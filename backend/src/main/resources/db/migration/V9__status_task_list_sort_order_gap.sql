ALTER TABLE status    ALTER COLUMN sort_order TYPE DOUBLE PRECISION;
ALTER TABLE task_list ALTER COLUMN sort_order TYPE DOUBLE PRECISION;

-- 상태는 목록별로 65536 간격으로 다시 매긴다
UPDATE status s
SET sort_order = r.rn * 65536
FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY task_list_id ORDER BY sort_order, id) AS rn
    FROM status
) r
WHERE s.id = r.id;

-- 목록은 사용자별로 65536 간격으로 다시 매긴다
UPDATE task_list t
SET sort_order = r.rn * 65536
FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY sort_order, id) AS rn
    FROM task_list
) r
WHERE t.id = r.id;