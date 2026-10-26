-- Hora (0-23, hora de Colombia) a la que se envía el aviso de cada pago, y
-- registro del último aviso enviado para no repetirlo.
ALTER TABLE public.recurring_payments
  ADD COLUMN IF NOT EXISTS notify_hour INTEGER NOT NULL DEFAULT 9
    CHECK (notify_hour BETWEEN 0 AND 23),
  ADD COLUMN IF NOT EXISTS last_reminder TEXT;
