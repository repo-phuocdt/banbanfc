-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read members" ON members FOR SELECT USING (true);
CREATE POLICY "Public read contributions" ON contributions FOR SELECT USING (true);
CREATE POLICY "Public read transactions" ON transactions FOR SELECT USING (true);

-- Auth write policies for members
CREATE POLICY "Auth insert members" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update members" ON members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete members" ON members FOR DELETE USING (auth.role() = 'authenticated');

-- Auth write policies for contributions
CREATE POLICY "Auth insert contributions" ON contributions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update contributions" ON contributions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete contributions" ON contributions FOR DELETE USING (auth.role() = 'authenticated');

-- Auth write policies for transactions
CREATE POLICY "Auth insert transactions" ON transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update transactions" ON transactions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete transactions" ON transactions FOR DELETE USING (auth.role() = 'authenticated');
