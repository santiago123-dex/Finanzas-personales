-- PIN rápido de ingreso (definido por el usuario, hash bcrypt).
-- El PIN nunca se guarda en texto plano. El login con PIN lo verifica
-- una server action con service_role y luego abre sesión real de
-- Supabase, así RLS (auth.uid()) sigue funcionando igual.

CREATE TABLE public.user_pins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  pin_hash TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_pins ENABLE ROW LEVEL SECURITY;

-- Cada usuario gestiona solo su propia fila (lectura para chequear
-- "¿ya tiene PIN?", escritura para crearlo/cambiarlo logueado).
CREATE POLICY "Users manage their own pin"
  ON public.user_pins FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_pins_updated_at
  BEFORE UPDATE ON public.user_pins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
