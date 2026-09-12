-- Fix: el trigger de categorías por defecto fallaba por RLS.
-- GoTrue inserta en auth.users como `supabase_auth_admin`, y durante el
-- signup auth.uid() es NULL, así que la policy "auth.uid() = user_id"
-- rechazaba el INSERT en categories -> "Database error saving new user".
-- SECURITY DEFINER hace que la función corra con permisos del owner
-- (postgres), salteando RLS. search_path fijo evita hijacking.

CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, icon, color, is_default) VALUES
    (NEW.id, 'Alimentación', '🍔', '#FF6B6B', true),
    (NEW.id, 'Transporte', '🚗', '#4ECDC4', true),
    (NEW.id, 'Entretenimiento', '🎮', '#45B7D1', true),
    (NEW.id, 'Salud', '💊', '#96CEB4', true),
    (NEW.id, 'Servicios', '💡', '#FFEAA7', true),
    (NEW.id, 'Ropa', '👕', '#DDA0DD', true),
    (NEW.id, 'Hogar', '🏠', '#98D8C8', true),
    (NEW.id, 'Educación', '📚', '#F7DC6F', true),
    (NEW.id, 'Ingresos', '💰', '#2ECC71', true),
    (NEW.id, 'Otros', '📦', '#BDC3C7', true);
  RETURN NEW;
END;
$$;
