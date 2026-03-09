-- Tighten write policies: require admin role instead of just authenticated
-- This uses a custom claim 'is_admin' in user app_metadata
-- Set via: supabase.auth.admin.updateUserById(uid, { app_metadata: { is_admin: true } })

-- Helper function to check admin status
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean,
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop old permissive write policies
DROP POLICY IF EXISTS "Auth insert members" ON members;
DROP POLICY IF EXISTS "Auth update members" ON members;
DROP POLICY IF EXISTS "Auth delete members" ON members;
DROP POLICY IF EXISTS "Auth insert contributions" ON contributions;
DROP POLICY IF EXISTS "Auth update contributions" ON contributions;
DROP POLICY IF EXISTS "Auth delete contributions" ON contributions;
DROP POLICY IF EXISTS "Auth insert transactions" ON transactions;
DROP POLICY IF EXISTS "Auth update transactions" ON transactions;
DROP POLICY IF EXISTS "Auth delete transactions" ON transactions;

-- Recreate with admin-only check
CREATE POLICY "Admin insert members" ON members FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update members" ON members FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete members" ON members FOR DELETE USING (is_admin());

CREATE POLICY "Admin insert contributions" ON contributions FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update contributions" ON contributions FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete contributions" ON contributions FOR DELETE USING (is_admin());

CREATE POLICY "Admin insert transactions" ON transactions FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admin update transactions" ON transactions FOR UPDATE USING (is_admin());
CREATE POLICY "Admin delete transactions" ON transactions FOR DELETE USING (is_admin());
