CREATE TABLE registration (
    id BINARY(16) NOT NULL PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    gelombang_id BINARY(16) NOT NULL,
    status ENUM('DRAFT', 'SUBMITTED', 'REJECTED', 'VERIFIED') NOT NULL DEFAULT 'DRAFT',

    feedback_document TEXT DEFAULT NULL,
    feedback_payment TEXT DEFAULT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_gelombang_id (user_id, gelombang_id),
    CONSTRAINT fk_registration_user FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_registration_gelombang FOREIGN KEY(gelombang_id)
        REFERENCES gelombang(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE registration_draft (
    registration_id BINARY(16) PRIMARY KEY,
    form_data JSON NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_registration_draft FOREIGN KEY(registration_id)
        REFERENCES registration(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE registration_s1_detail (
    registration_id BINARY(16) PRIMARY KEY,

    gender ENUM('L', 'P') NOT NULL,
    nationality ENUM('WNI', 'WNA', 'STATELESS') NOT NULL,
    birth_place VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    whatsapp_number VARCHAR(15) NOT NULL,
    registration_type ENUM('BARU', 'ALIH_JENJANG', 'TRANSFER') NOT NULL,

    previous_university VARCHAR(100) DEFAULT NULL,
    previous_major VARCHAR(100) DEFAULT NULL,
    gpa DECIMAL(3,2) DEFAULT NULL,
    last_education ENUM('D3', 'D4', 'S1', 'S2') DEFAULT NULL,

    previous_highschool VARCHAR(100) NOT NULL,
    highschool_gpa DECIMAL(5,2) DEFAULT NULL,
    highschool_graduate_year YEAR DEFAULT NULL,

    program_studi_id BINARY(16) NOT NULL COMMENT 'Major Choice',
    class_session ENUM('PAGI', 'MALAM') NOT NULL,

    is_fresh_graduate_declared BOOLEAN NOT NULL,
    is_final_declaration_agreed BOOLEAN NOT NULL,

    CONSTRAINT fk_registration_s1 FOREIGN KEY(registration_id)
        REFERENCES registration(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_registration_s1_program_studi FOREIGN KEY(program_studi_id)
        REFERENCES program_studi(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE registration_s2_detail (
    registration_id BINARY(16) PRIMARY KEY,

    nationality ENUM('WNI', 'WNA', 'STATELESS') NOT NULL,
    birth_place VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,
    religion ENUM('NOT_SPECIFIED', 'ISLAM', 'KATOLIK', 'KRISTEN', 'HINDU', 'BUDDHA', 'KONGHUCU') NOT NULL,
    funding_source ENUM('SENDIRI', 'INSTANSI', 'LAINNYA') NOT NULL,

    tax_number VARCHAR(20) DEFAULT NULL,
    reference_source VARCHAR(255) DEFAULT NULL,
    field_of_expertise VARCHAR(150) DEFAULT NULL,

    address TEXT NOT NULL,
    sub_district VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,

    hamlet VARCHAR(100) DEFAULT NULL,
    postal_code VARCHAR(12) DEFAULT NULL,
    rt VARCHAR(5) DEFAULT NULL,
    rw VARCHAR(5) DEFAULT NULL,

    previous_major VARCHAR(100) NOT NULL,
    gpa DECIMAL(3,2) NOT NULL,
    academic_degree VARCHAR(50) NOT NULL,
    previous_university VARCHAR(150) NOT NULL,

    company_name VARCHAR(150) DEFAULT NULL,
    company_address TEXT DEFAULT NULL,
    job_position VARCHAR(100) DEFAULT NULL,
    company_status ENUM('PEMERINTAH', 'SWASTA', 'BUMN', 'PTN', 'PTS') DEFAULT NULL,
    company_start_year YEAR DEFAULT NULL,

    parent_address TEXT DEFAULT NULL,

    program_studi_id BINARY(16) NOT NULL COMMENT 'Major Choice',

    is_final_declaration_agreed BOOLEAN NOT NULL,

    CONSTRAINT fk_registration_s2 FOREIGN KEY (registration_id)
        REFERENCES registration(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_registration_s2_program_studi FOREIGN KEY (program_studi_id)
        REFERENCES program_studi(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE registration_s2_parent_detail (
    registration_s2_id BINARY(16) NOT NULL,
    parent_type ENUM('FATHER', 'MOTHER') NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) NOT NULL,

    nik VARCHAR(20) DEFAULT NULL,
    birth_date DATE DEFAULT NULL,
    last_education ENUM(
        'NOT_SPECIFIED', 'TIDAK_TAMAT_SD', 'SD', 'SMP', 'SMA_SMK',
        'D1', 'D2', 'D3', 'D4', 'S1', 'PROFESI', 'SP_1', 'S2', 'SP_2', 'S3', 'NON_AKADEMIK'
    ) DEFAULT NULL,
    occupation ENUM(
        'NOT_SPECIFIED', 'PNS_ASN', 'TNI_POLRI', 'PENGAJAR', 'SWASTA', 'BUMN_BUMD',
        'WIRASWASTA', 'PROFESIONAL', 'PETANI_NELAYAN', 'BURUH', 'IRT', 'PENSIUNAN', 'LAINNYA'
    ) DEFAULT NULL,
    income ENUM(
        'NO_INCOME',
        'UNDER_500K',
        '500K_TO_1M',
        '1M_TO_2M5',
        '2M5_TO_5M',
        '5M_TO_7M5',
        '7M5_TO_10M',
        'ABOVE_10M'
    ) DEFAULT NULL,
    status ENUM('ALIVE', 'DECEASED') DEFAULT NULL,

    PRIMARY KEY (registration_s2_id, parent_type),
    CONSTRAINT fk_registration_s2_parent_detail FOREIGN KEY(registration_s2_id)
        REFERENCES registration_s2_detail(registration_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
