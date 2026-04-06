-- ============================================================
--  V5: Seed Floors and Rooms based on Block requirements
-- ============================================================

DO $$
DECLARE
    rec RECORD;
    f_count INT;
    r_count INT;
    f_num INT;
    r_num INT;
    new_floor_id UUID;
    r_width DOUBLE PRECISION;
BEGIN
    DELETE FROM rooms;
    DELETE FROM floors;

    FOR rec IN SELECT * FROM map_blocks WHERE is_active = true LOOP
        
        IF rec.code IN ('CDC', 'RUS', 'RUN', 'BSSN') THEN
            f_count := 1;
            r_count := 1;
        ELSE
            f_count := 2;
            r_count := 6;
        END IF;
        UPDATE map_blocks SET floor_count = f_count WHERE id = rec.id;

        r_width := 1000.0 / r_count;


        FOR f_num IN 1..f_count LOOP
            new_floor_id := gen_random_uuid();
            
            INSERT INTO floors (id, block_id, number, name)
            VALUES (new_floor_id, rec.id, f_num, CASE WHEN f_num = 1 THEN 'Térreo' ELSE f_num || 'º Andar' END);


            FOR r_num IN 1..r_count LOOP
                INSERT INTO rooms (floor_id, name, number, type, x, y, width, height)
                VALUES (
                    new_floor_id,
                    'Sala ' || ((f_num * 100) + r_num),
                    ((f_num * 100) + r_num)::VARCHAR,
                    CASE WHEN r_count = 1 THEN 'OTHER' ELSE 'CLASSROOM' END,
                    (r_num - 1) * r_width,
                    100.0,
                    r_width,
                    300.0
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
