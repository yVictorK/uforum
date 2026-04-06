-- ============================================================
--  V6: Set room height to create wide horizontal corridors
-- ============================================================

UPDATE rooms
SET height = 100.0, width = CASE WHEN width > 500 THEN width ELSE width END
WHERE height = 300.0;
