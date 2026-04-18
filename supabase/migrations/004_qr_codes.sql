-- QR codes for bank transfers (Vietcombank / VietQR, etc.)
-- Stored directly as base64 data URI in `image_data` to avoid
-- extra Storage bucket setup. This keeps uploads small since QR
-- screenshots are usually < 200KB.

CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Chuyển khoản quỹ',
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  description TEXT,
  image_data TEXT NOT NULL,        -- data:image/...;base64,....
  image_mime TEXT NOT NULL DEFAULT 'image/png',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_active_order
  ON qr_codes(is_active, display_order);

-- RLS: public read, admin-only write (mirrors other tables)
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read qr_codes" ON qr_codes;
CREATE POLICY "Public read qr_codes" ON qr_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin insert qr_codes" ON qr_codes;
CREATE POLICY "Admin insert qr_codes" ON qr_codes
  FOR INSERT WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin update qr_codes" ON qr_codes;
CREATE POLICY "Admin update qr_codes" ON qr_codes
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Admin delete qr_codes" ON qr_codes;
CREATE POLICY "Admin delete qr_codes" ON qr_codes
  FOR DELETE USING (is_admin());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_qr_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_qr_codes_updated_at ON qr_codes;
CREATE TRIGGER trg_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_qr_codes_updated_at();
