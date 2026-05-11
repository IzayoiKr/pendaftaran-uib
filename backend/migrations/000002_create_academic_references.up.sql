CREATE TABLE program_studi (
    id CHAR(36) NOT NULL PRIMARY KEY,
    title VARCHAR(50) NOT NULL,
    faculty VARCHAR(20) NOT NULL,
    degree ENUM('S1', 'S2') NOT NULL,
    description TEXT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    link VARCHAR(255) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE gelombang (
    id CHAR(36) NOT NULL PRIMARY KEY,
    batch_key VARCHAR(50) NOT NULL,
    batch_name VARCHAR(100) NOT NULL,
    batch_type ENUM('Reguler', 'Beasiswa') NOT NULL,
    program_type VARCHAR(50) NOT NULL,
    program_type_en VARCHAR(50) NOT NULL,
    degree ENUM('S1', 'S2') NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location ENUM('Batam', 'Online', 'Tanjung Pinang') NOT NULL,
    registration_start DATE NOT NULL,
    registration_end DATE NOT NULL,
    usm_password VARCHAR(6),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
