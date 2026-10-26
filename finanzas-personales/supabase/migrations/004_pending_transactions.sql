-- Movimientos detectados desde el banco (Atajo de iOS, correo, SMS o texto
-- pegado) que esperan confirmación antes de entrar al libro.

CREATE TABLE IF NOT EXISTS public.pending_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL DEFAULT 'expense',
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL DEFAULT '',
  tx_date DATE NOT NULL DEFAULT CURRENT_DATE,
  raw_text TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pending_user ON public.pending_transactions(user_id, created_at DESC);

ALTER TABLE public.pending_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own pending transactions" ON public.pending_transactions;
CREATE POLICY "Users manage their own pending transactions"
  ON public.pending_transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Token personal para que el Atajo de iOS pueda enviar movimientos sin
-- sesión. Solo se guarda el hash SHA-256; el token real se muestra una vez.
CREATE TABLE IF NOT EXISTS public.bank_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own bank token" ON public.bank_tokens;
CREATE POLICY "Users manage their own bank token"
  ON public.bank_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
