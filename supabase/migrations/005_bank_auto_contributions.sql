-- Automatic recording of bank transfers received through SePay webhooks,
-- member leave months, and admin-only bank identities for matching senders.
--
-- BACK UP THE DATABASE BEFORE APPLYING (Supabase dashboard → Database → Backups,
-- or pg_dump). Apply manually in the Supabase SQL editor. This migration only
-- adds tables, columns, policies and functions; it does not modify existing rows.

-- ---------------------------------------------------------------------------
-- Bank identities (sender names / account numbers). Kept out of `members`
-- because `members` is publicly readable.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_bank_identities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('name', 'account')),
  value TEXT NOT NULL CHECK (length(value) BETWEEN 2 AND 60),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (kind, value)
);
CREATE INDEX IF NOT EXISTS idx_member_bank_identities_member ON member_bank_identities(member_id);

-- ---------------------------------------------------------------------------
-- Leave months: the member owes nothing for these months.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_leaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  month TEXT NOT NULL CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (member_id, month)
);

-- ---------------------------------------------------------------------------
-- Raw bank transactions from SePay. sepay_id makes webhook retries idempotent.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sepay_id BIGINT NOT NULL UNIQUE,
  gateway TEXT,
  transaction_date TIMESTAMPTZ NOT NULL,
  account_number TEXT NOT NULL,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('in', 'out')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  content TEXT NOT NULL DEFAULT '',
  reference_code TEXT,
  raw JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'ignored')),
  pending_reason TEXT,
  matched_via TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
-- The same bank transaction re-synced under a different SePay id is still a duplicate.
CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_transactions_reference
  ON bank_transactions(account_number, reference_code) WHERE reference_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bank_transactions_status_date
  ON bank_transactions(status, transaction_date DESC);

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS bank_transaction_id UUID REFERENCES bank_transactions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_bank_tx ON transactions(bank_transaction_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE member_bank_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin all member_bank_identities" ON member_bank_identities;
CREATE POLICY "Admin all member_bank_identities" ON member_bank_identities
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read member_leaves" ON member_leaves;
CREATE POLICY "Public read member_leaves" ON member_leaves FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin insert member_leaves" ON member_leaves;
CREATE POLICY "Admin insert member_leaves" ON member_leaves FOR INSERT WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Admin update member_leaves" ON member_leaves;
CREATE POLICY "Admin update member_leaves" ON member_leaves FOR UPDATE USING (is_admin());
DROP POLICY IF EXISTS "Admin delete member_leaves" ON member_leaves;
CREATE POLICY "Admin delete member_leaves" ON member_leaves FOR DELETE USING (is_admin());

-- Raw content holds full names and account numbers: admins only.
DROP POLICY IF EXISTS "Admin all bank_transactions" ON bank_transactions;
CREATE POLICY "Admin all bank_transactions" ON bank_transactions
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- Atomic writes. SECURITY INVOKER: the webhook runs as service_role (bypasses
-- RLS); admins are checked by the existing is_admin() RLS policies.
-- ---------------------------------------------------------------------------

-- p_allocations: [{member_id, month, amount, expected_paid}, ...]
CREATE OR REPLACE FUNCTION apply_bank_income(p_bank_tx_id UUID, p_allocations JSONB, p_matched_via TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_tx bank_transactions%ROWTYPE;
  v_item JSONB;
  v_member UUID;
  v_month TEXT;
  v_amount INTEGER;
  v_paid INTEGER;
  v_contrib_id UUID;
  v_total INTEGER := 0;
BEGIN
  SELECT * INTO v_tx FROM bank_transactions WHERE id = p_bank_tx_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'bank_tx_not_found'; END IF;
  IF v_tx.status <> 'pending' OR v_tx.transfer_type <> 'in' THEN
    RAISE EXCEPTION 'bank_tx_not_pending';
  END IF;

  -- Serialize concurrent transfers of the same member; fixed order avoids deadlocks.
  FOR v_member IN
    SELECT DISTINCT (e->>'member_id')::UUID FROM jsonb_array_elements(p_allocations) e ORDER BY 1
  LOOP
    PERFORM pg_advisory_xact_lock(hashtext(v_member::TEXT));
  END LOOP;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_allocations) LOOP
    v_member := (v_item->>'member_id')::UUID;
    v_month := v_item->>'month';
    v_amount := (v_item->>'amount')::INTEGER;
    IF v_amount <= 0 THEN RAISE EXCEPTION 'invalid_allocation'; END IF;

    SELECT COALESCE(SUM(amount), 0) INTO v_paid
      FROM contributions WHERE member_id = v_member AND month = v_month;
    IF v_paid <> (v_item->>'expected_paid')::INTEGER
       OR EXISTS (SELECT 1 FROM member_leaves WHERE member_id = v_member AND month = v_month) THEN
      RAISE EXCEPTION 'stale_allocation';
    END IF;

    INSERT INTO contributions (member_id, month, amount, paid_at, note)
      VALUES (v_member, v_month, v_amount, v_tx.transaction_date, 'Chuyển khoản tự động')
      ON CONFLICT (member_id, month) DO UPDATE SET amount = contributions.amount + EXCLUDED.amount
      RETURNING id INTO v_contrib_id;

    INSERT INTO transactions (date, type, amount, category, description, member_id, contribution_id, bank_transaction_id)
      VALUES (v_tx.transaction_date, 'income', v_amount, 'Quỹ hàng tháng',
              'Đóng quỹ tháng ' || v_month || ' (chuyển khoản)', v_member, v_contrib_id, v_tx.id);

    v_total := v_total + v_amount;
  END LOOP;

  IF v_total <> v_tx.amount THEN RAISE EXCEPTION 'allocation_amount_mismatch'; END IF;

  UPDATE bank_transactions
    SET status = 'applied', matched_via = p_matched_via, pending_reason = NULL, resolved_at = now()
    WHERE id = v_tx.id;
END;
$$;

-- Records a pending transaction as a single ledger entry: expense for money out,
-- other income (e.g. 'Góp thêm') for money in.
CREATE OR REPLACE FUNCTION apply_bank_simple(p_bank_tx_id UUID, p_category TEXT, p_description TEXT, p_matched_via TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_tx bank_transactions%ROWTYPE;
BEGIN
  SELECT * INTO v_tx FROM bank_transactions WHERE id = p_bank_tx_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'bank_tx_not_found'; END IF;
  IF v_tx.status <> 'pending' THEN RAISE EXCEPTION 'bank_tx_not_pending'; END IF;

  INSERT INTO transactions (date, type, amount, category, description, bank_transaction_id)
    VALUES (v_tx.transaction_date,
            CASE WHEN v_tx.transfer_type = 'in' THEN 'income' ELSE 'expense' END,
            v_tx.amount, p_category, COALESCE(p_description, ''), v_tx.id);

  UPDATE bank_transactions
    SET status = 'applied', matched_via = p_matched_via, pending_reason = NULL, resolved_at = now()
    WHERE id = v_tx.id;
END;
$$;

-- Undoes everything a bank transaction produced and puts it back in the pending queue.
CREATE OR REPLACE FUNCTION revert_bank_transaction(p_bank_tx_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  v_tx bank_transactions%ROWTYPE;
  r RECORD;
  v_left INTEGER;
BEGIN
  SELECT * INTO v_tx FROM bank_transactions WHERE id = p_bank_tx_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'bank_tx_not_found'; END IF;
  IF v_tx.status = 'pending' THEN RAISE EXCEPTION 'bank_tx_already_pending'; END IF;

  FOR r IN SELECT id, contribution_id, amount FROM transactions WHERE bank_transaction_id = v_tx.id LOOP
    DELETE FROM transactions WHERE id = r.id;
    IF r.contribution_id IS NOT NULL THEN
      UPDATE contributions SET amount = amount - r.amount WHERE id = r.contribution_id
        RETURNING amount INTO v_left;
      IF v_left IS NOT NULL AND v_left <= 0 THEN
        DELETE FROM contributions WHERE id = r.contribution_id;
      END IF;
    END IF;
  END LOOP;

  UPDATE bank_transactions
    SET status = 'pending', matched_via = NULL, pending_reason = 'Đã hủy ghi nhận', resolved_at = NULL
    WHERE id = v_tx.id;
END;
$$;

REVOKE EXECUTE ON FUNCTION apply_bank_income(UUID, JSONB, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION apply_bank_simple(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION revert_bank_transaction(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION apply_bank_income(UUID, JSONB, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION apply_bank_simple(UUID, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION revert_bank_transaction(UUID) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Realtime (RLS still applies to subscribers). Identities are never broadcast.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['contributions', 'transactions', 'member_leaves', 'bank_transactions'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
