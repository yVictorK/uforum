-- ============================================================
--  V7: Increase Map Block code column length to avoid 
--      errors during soft deletion renaming.
-- ============================================================

ALTER TABLE map_blocks
ALTER COLUMN code TYPE VARCHAR(100);
