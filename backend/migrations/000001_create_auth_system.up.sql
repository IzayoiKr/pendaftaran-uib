CREATE TABLE users (
    id BINARY(16) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    nik VARCHAR(512) NOT NULL,
    nik_blind CHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash CHAR(60) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT 0,
    email_verified_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nik_blind (nik_blind)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE email_verification (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    token_hash CHAR(64) COLLATE utf8mb4_bin NOT NULL UNIQUE,
    is_used BOOLEAN  NOT NULL DEFAULT 0,
    expired_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_verification_user FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    INDEX idx_is_used_expired_at (is_used, expired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE reset_password (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    token_hash CHAR(64) COLLATE utf8mb4_bin NOT NULL UNIQUE,
    is_used BOOLEAN NOT NULL DEFAULT 0,
    expired_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reset_password_user FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    INDEX idx_is_used_expired_at (is_used, expired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
