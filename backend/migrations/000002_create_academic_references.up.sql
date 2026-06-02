CREATE TABLE program_studi (
    id BINARY(16) PRIMARY KEY,
    title VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    faculty VARCHAR(10) NOT NULL,
    degree ENUM('S1', 'S2') NOT NULL,
    description TEXT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT 1,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_program_studi_title (title),
    UNIQUE KEY uq_program_studi_code (code),
    INDEX idx_active_degree_sort (is_active, degree, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE gelombang (
    id BINARY(16) PRIMARY KEY,
    batch_key VARCHAR(50) NOT NULL UNIQUE,
    batch_name VARCHAR(100) NOT NULL,
    degree ENUM('S1', 'S2') NOT NULL,
    batch_type ENUM('Reguler', 'Beasiswa') NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_gelombang_batch_key (batch_key),
    INDEX idx_batch_lookup (batch_key, degree, batch_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE gelombang_detail (
    gelombang_id BINARY(16) PRIMARY KEY,
    academic_year YEAR NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location ENUM('Batam', 'Online', 'Tanjung Pinang') NOT NULL,
    registration_start DATE NOT NULL,
    registration_end DATE NOT NULL,
    usm_password CHAR(6) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_usm_gelombang (usm_password),
    CONSTRAINT fk_gelombang FOREIGN KEY(gelombang_id)
        REFERENCES gelombang(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    INDEX idx_registration_dates (registration_start, registration_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE registration_fee (
    degree ENUM('S1', 'S2') NOT NULL,
    batch_type ENUM('Reguler', 'Beasiswa') NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    amount INT UNSIGNED NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(degree, batch_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
