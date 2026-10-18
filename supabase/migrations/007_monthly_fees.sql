-- Monthly fund fee schedule. Each row sets the fee from `effective_month` onward until the next
-- row; months earlier than the first row use the first row's amount.

CREATE TABLE IF NOT EXISTS monthly_fees (
  effective_month TEXT PRIMARY KEY CHECK (effective_month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed with the fee used so far, effective from the first recorded contribution.
INSERT INTO monthly_fees (effective_month, amount)
SELECT COALESCE((SELECT MIN(month) FROM contributions), to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM')), 200000
WHERE NOT EXISTS (SELECT 1 FROM monthly_fees);

-- RLS: public read (the contribution grid is public), admin-only write.
ALTER TABLE monthly_fees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read monthly_fees" ON monthly_fees;
CREATE POLICY "Public read monthly_fees" ON monthly_fees FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin insert monthly_fees" ON monthly_fees;
CREATE POLICY "Admin insert monthly_fees" ON monthly_fees FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Admin update monthly_fees" ON monthly_fees;
CREATE POLICY "Admin update monthly_fees" ON monthly_fees FOR UPDATE USING (is_admin());
DROP POLICY IF EXISTS "Admin delete monthly_fees" ON monthly_fees;
CREATE POLICY "Admin delete monthly_fees" ON monthly_fees FOR DELETE USING (is_admin());
