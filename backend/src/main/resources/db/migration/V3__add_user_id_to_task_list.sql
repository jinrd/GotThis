DELETE FROM task_list;

ALTER TABLE task_list ADD COLUMN user_id BIGINT NOT NULL;

ALTER TABLE task_list
    ADD CONSTRAINT fk_task_list_user FOREIGN KEY (user_id) REFERENCES users (id);

CREATE INDEX idx_task_list_user_sort ON task_list (user_id, sort_order);