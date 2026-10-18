-- 순서 값을 정수(1, 2, 3)에서 간격 방식 실수(65536, 131072, 196608 ...)로 바꾼다
ALTER TABLE task ALTER COLUMN sort_order TYPE DOUBLE PRECISION;

-- 최상위 Task는 상태별로, 하위 작업은 부모별로 65536 간격으로 다시 매긴다
UPDATE task t
SET sort_order = r.rn * 65536
FROM (
    SELECT id,
           ROW_NUMBER() OVER (
               PARTITION BY parent_id,
                            CASE WHEN parent_id IS NULL THEN status_id END
               ORDER BY sort_order, id
           ) AS rn
    FROM task
) r
WHERE t.id = r.id;

-- 하위 작업 조회(parent_id + 순서)를 인덱스 하나로 처리한다
DROP INDEX idx_task_parent;
CREATE INDEX idx_task_parent_sort ON task (parent_id, sort_order);