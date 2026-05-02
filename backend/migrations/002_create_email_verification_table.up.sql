CREATE TABLE email_verification (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id CHAR(36) COLLATE utf8mb4_0900_ai_ci NOT NULL,
    token_hash CHAR(64) COLLATE utf8mb4_bin NOT NULL UNIQUE,
    is_used TINYINT(1) NOT NULL DEFAULT 0,
    expired_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_verification_user FOREIGN KEY(user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_token_hash (token_hash),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
