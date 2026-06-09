CREATE TABLE master_s1_prodi_fee (
    program_studi_id BINARY(16) PRIMARY KEY,
    bpp_pokok INT UNSIGNED NOT NULL,
    per_sks_cost INT UNSIGNED NOT NULL,
    base_ppl INT UNSIGNED NOT NULL,
    lab_fee INT UNSIGNED NOT NULL DEFAULT 750000,
    CONSTRAINT fk_s1_fee_prodi FOREIGN KEY (program_studi_id)
        REFERENCES program_studi(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE master_s1_spp_matrix (
    gelombang_number TINYINT UNSIGNED NOT NULL,
    usm_rank TINYINT UNSIGNED NOT NULL,
    spp_amount INT UNSIGNED NOT NULL,
    PRIMARY KEY (gelombang_number, usm_rank)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE master_s1_scholarship (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    spp_discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    ppl_discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    bpp_discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    sks_discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE master_s2_package (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    total_tuition INT UNSIGNED NOT NULL,
    matriculation_fee INT UNSIGNED NOT NULL DEFAULT 2000000,
    installment_schedule JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE registration_s1_assessment (
    registration_id BINARY(16) PRIMARY KEY,
    usm_rank TINYINT UNSIGNED DEFAULT NULL,
    scholarship_id INT DEFAULT NULL,
    CONSTRAINT fk_s1_assess_reg FOREIGN KEY (registration_id)
        REFERENCES registration(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_s1_assess_scholar FOREIGN KEY (scholarship_id)
        REFERENCES master_s1_scholarship(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE registration_s2_assessment (
    registration_id BINARY(16) PRIMARY KEY,
    s2_package_id INT NOT NULL,
    is_matriculation_required BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_s2_assess_reg FOREIGN KEY (registration_id)
        REFERENCES registration(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_s2_assess_pkg FOREIGN KEY (s2_package_id)
        REFERENCES master_s2_package(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE registration_loa_fee (
    registration_id BINARY(16) PRIMARY KEY,

    spp_charged INT UNSIGNED NOT NULL DEFAULT 0,
    ppl_charged INT UNSIGNED NOT NULL DEFAULT 0,
    bpp_charged INT UNSIGNED NOT NULL DEFAULT 0,
    sks_charged INT UNSIGNED NOT NULL DEFAULT 0,
    lab_charged INT UNSIGNED NOT NULL DEFAULT 0,

    total_semester_1 INT UNSIGNED GENERATED ALWAYS AS
        (spp_charged + ppl_charged + bpp_charged + sks_charged + lab_charged) STORED,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_loa_ledger_reg FOREIGN KEY (registration_id)
        REFERENCES registration(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
