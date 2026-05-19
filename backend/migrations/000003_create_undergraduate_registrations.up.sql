CREATE TABLE s1_registrations (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    registration_key VARCHAR(50) NOT NULL,
    batch_name VARCHAR(100) NOT NULL,

    -- Step 1 (Biodata)
    nik CHAR(16) NOT NULL,
    email VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    jk ENUM('l', 'p') NOT NULL,
    kewarganegaraan ENUM('1', '2', '3') NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    no_hp2 VARCHAR(20) NOT NULL,
    jenis_daftar ENUM('baru', 'alihjenjang', 'transfer') NOT NULL,
    prodi_pil BINARY(16) NOT NULL, -- UUID foreign key to program_studi
    prodi_pil2 CHAR(36),
    prodi_pil3 CHAR(36),
    waktu_kuliah ENUM('pagi', 'malam') NOT NULL,
    asal_sekolah VARCHAR(255) NOT NULL,
    konfirmasi TINYINT(1) DEFAULT 0,

    -- Conditional: Transfer/Alih Jenjang
    universitas_asal VARCHAR(255),
    prodi_asal VARCHAR(255),
    ipk DECIMAL(3,2),
    jenjang_pendidikan ENUM('d3', 'd4', 's1', 's2'),

    -- Step 2 (Uploaded Document Paths)
    pas_foto_path VARCHAR(255),
    ktp_path VARCHAR(255),
    kk_path VARCHAR(255),
    transkrip_nilai_path VARCHAR(255),
    ijazah_path VARCHAR(255),
    bukti_bayar_path VARCHAR(255),

    -- Payment Details
    pemilik_rek VARCHAR(255),
    bank VARCHAR(100),

    -- Admin Status Tracking
    doc_check_status VARCHAR(100) DEFAULT 'Belum Lengkap',
    doc_check_notes TEXT,
    payment_status VARCHAR(100) DEFAULT 'Belum Lunas',
    payment_notes TEXT,
    usm_status VARCHAR(100) DEFAULT 'Belum USM',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_s1_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_s1_prodi FOREIGN KEY (prodi_pil) REFERENCES program_studi(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
