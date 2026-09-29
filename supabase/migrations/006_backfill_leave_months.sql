-- One-off data backfill: every month up to 2026-09 in which a member paid nothing
-- becomes a leave month, so historic gaps no longer count as owed.
-- Months start at the later of the member's join month (Vietnam time) and the
-- fund's first recorded month. Deleted members are skipped; months with any
-- contribution (including partial ones) are left untouched.
--
-- BACK UP THE DATABASE BEFORE APPLYING. Requires 005_bank_auto_contributions.sql.
-- Safe to re-run: existing leave months are kept (ON CONFLICT DO NOTHING).

WITH bounds AS (
  SELECT MIN(month) AS fund_start, '2026-09'::TEXT AS last_month FROM contributions
),
candidate AS (
  SELECT m.id AS member_id,
         to_char(gs, 'YYYY-MM') AS month
  FROM members m
  CROSS JOIN bounds b
  CROSS JOIN LATERAL generate_series(
    GREATEST(
      date_trunc('month', (m.joined_at AT TIME ZONE 'Asia/Ho_Chi_Minh')),
      to_date(b.fund_start, 'YYYY-MM')
    ),
    to_date(b.last_month, 'YYYY-MM'),
    interval '1 month'
  ) AS gs
  WHERE m.status <> 'deleted'
)
INSERT INTO member_leaves (member_id, month, note)
SELECT c.member_id, c.month, 'Tự đánh dấu: chưa đóng (dữ liệu cũ)'
FROM candidate c
WHERE NOT EXISTS (
  SELECT 1 FROM contributions x WHERE x.member_id = c.member_id AND x.month = c.month
)
ON CONFLICT (member_id, month) DO NOTHING;
