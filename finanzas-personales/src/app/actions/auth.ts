"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_PIN_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = ((formData.get("email") as string) ?? "").trim();
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect("/register?error=" + encodeURIComponent(error.message));
  }

  // Protección anti-enumeración: Supabase devuelve un usuario sin
  // identidades cuando el email ya está registrado.
  if (data.user && (data.user.identities?.length ?? 0) === 0) {
    redirect(
      "/login?message=" +
        encodeURIComponent("Ese email ya tiene cuenta. Iniciá sesión.")
    );
  }

  // Si la confirmación por email está desactivada, ya hay sesión.
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/");
  }

  redirect("/verify?email=" + encodeURIComponent(email));
}

export async function verifyCode(formData: FormData) {
  const supabase = await createClient();

  const email = ((formData.get("email") as string) ?? "").trim();
  const token = ((formData.get("token") as string) ?? "").replace(/\D/g, "");

  if (!email || token.length !== 6) {
    redirect(
      "/verify?email=" +
        encodeURIComponent(email) +
        "&error=" +
        encodeURIComponent("Ingresá el código de 6 dígitos que te enviamos.")
    );
  }

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) {
    redirect(
      "/verify?email=" +
        encodeURIComponent(email) +
        "&error=" +
        encodeURIComponent(error.message)
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function resendCode(formData: FormData) {
  const supabase = await createClient();

  const email = ((formData.get("email") as string) ?? "").trim();

  if (!email) {
    redirect(
      "/verify?error=" +
        encodeURIComponent("Ingresá tu email para reenviar el código.")
    );
  }

  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    redirect(
      "/verify?email=" +
        encodeURIComponent(email) +
        "&error=" +
        encodeURIComponent(error.message)
    );
  }

  redirect(
    "/verify?email=" +
      encodeURIComponent(email) +
      "&message=" +
      encodeURIComponent("Código reenviado. Revisá tu email.")
  );
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function setPin(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const pin = ((formData.get("pin") as string) ?? "").replace(/\D/g, "");
  const confirm = ((formData.get("confirm") as string) ?? "").replace(/\D/g, "");

  if (pin.length < 4 || pin.length > 6 || pin !== confirm) {
    redirect(
      "/set-pin?error=" +
        encodeURIComponent(
          "El código debe tener de 4 a 6 dígitos y coincidir en los dos campos."
        )
    );
  }

  const pin_hash = await bcrypt.hash(pin, 10);

  const { error } = await supabase.from("user_pins").upsert({
    user_id: user.id,
    email: user.email.toLowerCase(),
    pin_hash,
    failed_attempts: 0,
    locked_until: null,
  });

  if (error) {
    redirect(
      "/set-pin?error=" +
        encodeURIComponent("No se pudo guardar el código. Probá de nuevo.")
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}

function pinLoginError(message: string) {
  return "/login?error=" + encodeURIComponent(message);
}

function requireAdmin() {
  try {
    return createAdminClient();
  } catch {
    redirect(
      pinLoginError("Falta configurar SUPABASE_SERVICE_ROLE_KEY en el servidor.")
    );
  }
}

export async function loginWithPin(formData: FormData) {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const pin = ((formData.get("pin") as string) ?? "").replace(/\D/g, "");

  if (!email || pin.length < 4 || pin.length > 6) {
    redirect(pinLoginError("Ingresá tu email y tu código de 4 a 6 dígitos."));
  }

  const admin = requireAdmin();

  const { data: row } = await admin
    .from("user_pins")
    .select("user_id, email, pin_hash, failed_attempts, locked_until")
    .eq("email", email)
    .maybeSingle();

  // Tiempo constante ante email inexistente: igual se hashea para no filtrar.
  if (!row) {
    await bcrypt.hash(pin, 10);
    redirect(pinLoginError("Código incorrecto."));
  }

  if (row.locked_until && new Date(row.locked_until).getTime() > Date.now()) {
    const mins = Math.ceil(
      (new Date(row.locked_until).getTime() - Date.now()) / 60000
    );
    redirect(
      pinLoginError(
        `Demasiados intentos. Probá de nuevo en ${mins} min o entrá con tu contraseña.`
      )
    );
  }

  const ok = await bcrypt.compare(pin, row.pin_hash as string);

  if (!ok) {
    const attempts = (row.failed_attempts as number) + 1;
    if (attempts >= MAX_PIN_ATTEMPTS) {
      await admin
        .from("user_pins")
        .update({
          failed_attempts: 0,
          locked_until: new Date(
            Date.now() + LOCK_MINUTES * 60000
          ).toISOString(),
        })
        .eq("user_id", row.user_id);
      redirect(
        pinLoginError(
          `Demasiados intentos. Esperá ${LOCK_MINUTES} min o entrá con tu contraseña.`
        )
      );
    }
    await admin
      .from("user_pins")
      .update({ failed_attempts: attempts })
      .eq("user_id", row.user_id);
    redirect(
      pinLoginError(
        `Código incorrecto. Te quedan ${MAX_PIN_ATTEMPTS - attempts} intentos.`
      )
    );
  }

  await admin
    .from("user_pins")
    .update({ failed_attempts: 0, locked_until: null })
    .eq("user_id", row.user_id);

  // Sesión real de Supabase sin pedir el password: el PIN ya autenticó.
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: row.email as string,
    });

  const tokenHash = linkData?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    redirect(
      pinLoginError("No se pudo abrir la sesión. Probá con tu contraseña.")
    );
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });

  if (verifyError) {
    redirect(
      pinLoginError("No se pudo abrir la sesión. Probá con tu contraseña.")
    );
  }

  revalidatePath("/", "layout");
  redirect("/");
}
