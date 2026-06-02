CREATE TABLE examinee_sequence (
    gelombang_id BINARY(16) NOT NULL,
    prefix_key CHAR(5) NOT NULL,
    next_value INT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (gelombang_id, prefix_key),
    CONSTRAINT fk_sequence_gelombang FOREIGN KEY (gelombang_id)
        REFERENCES gelombang(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
