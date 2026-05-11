CREATE TABLE s2_registrations (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    registration_key VARCHAR(50) NOT NULL,
    batch_name VARCHAR(100) NOT NULL,
    
    -- Step 1 (Biodata)
    nik CHAR(16) NOT NULL,
    nama VARCHAR(255) NOT NULL,
    jk ENUM('l', 'p') NOT NULL,
    kewarganegaraan ENUM('1', '2', '3') NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    email VARCHAR(255) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    agama VARCHAR(50) NOT NULL,
    sumber_studi VARCHAR(100) NOT NULL,
    alamat TEXT NOT NULL,
    kelurahan VARCHAR(100) NOT NULL,
    kecamatan VARCHAR(100) NOT NULL,
    jurusan VARCHAR(100) NOT NULL,
    ipk DECIMAL(3,2) NOT NULL,
    gelar VARCHAR(50) NOT NULL,
    
    -- Biodata Optionals
    nisn VARCHAR(50),
    npwp VARCHAR(50),
    referensi VARCHAR(255),
    keahlian VARCHAR(255),
    nama_dusun VARCHAR(100),
    kode_pos VARCHAR(10),
    no_rt VARCHAR(10),
    no_rw VARCHAR(10),
    universitas VARCHAR(255),
    prodi_pil CHAR(36) ,
    waktu_kuliah ENUM('pagi', 'malam') NOT NULL DEFAULT 'pagi',
    perusahaan_nama VARCHAR(255),
    alamat_instansi TEXT,
    jabatan VARCHAR(100),
    status_instansi VARCHAR(100),
    tahun_perusahaan VARCHAR(4),
    
    -- Step Parent (Orang Tua & Wali)
    nama_ayah VARCHAR(255) NOT NULL,
    notelp_ayah VARCHAR(20) NOT NULL,
    nik_ayah CHAR(16),
    tanggallahir_ayah DATE,
    pendidikan_ayah VARCHAR(100),
    pekerjaan_ayah VARCHAR(100),
    penghasilan_ayah VARCHAR(100),
    status_ayah VARCHAR(50),
    
    nama_ibu VARCHAR(255) NOT NULL,
    notelp_ibu VARCHAR(20) NOT NULL,
    nik_ibu CHAR(16),
    tanggallahir_ibu DATE,
    pendidikan_ibu VARCHAR(100),
    pekerjaan_ibu VARCHAR(100),
    penghasilan_ibu VARCHAR(100),
    status_ibu VARCHAR(50),
    
    alamat_ortu TEXT,
    
    nik_wali CHAR(16),
    nama_wali VARCHAR(255),
    tanggallahir_wali DATE,
    notelp_wali VARCHAR(20),
    pendidikan_wali VARCHAR(100),
    pekerjaan_wali VARCHAR(100),
    penghasilan_wali VARCHAR(100),
    alamat_wali TEXT,

    -- Step 2 (Uploaded Document Paths)
    pas_foto_path VARCHAR(255),
    ktp_path VARCHAR(255),
    kk_path VARCHAR(255),
    akta_lahir_path VARCHAR(255),
    ijazah_s1_path VARCHAR(255),
    transkrip_s1_path VARCHAR(255),
    bukti_bayar_path VARCHAR(255),
    
    -- Payment Details
    pemilik_rek VARCHAR(255),
    bank VARCHAR(100),
    
    -- Admin Status Tracking
    doc_status VARCHAR(100) DEFAULT 'Belum Lengkap',
    doc_notes TEXT,
    payment_status VARCHAR(100) DEFAULT 'Belum Lunas',
    payment_notes TEXT,
    usm_status VARCHAR(100) DEFAULT 'Belum USM',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_s2_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
