"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
