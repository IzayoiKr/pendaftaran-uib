-- ===============================================================================
-- SEED DATA: program_studi, gelombang, gelombang_detail
-- UUIDv7 via UUID_TO_BIN()
-- usm_password: bcrypt of "password" (development only – regenerate with pepper!)
-- ===============================================================================

INSERT INTO program_studi (
    id, title, title_en, faculty, degree,
    description,
    image_path, link, sort_order
) VALUES
-- 1
(UUID_TO_BIN('018f7a8c-3b00-7d01-8000-000000000001'), 'Teknik Sipil', 'Civil Engineering', 'FTSP', 'S1',
 'Sebagai program study yang menghasilkan lulusan berstandar internasional yang berkompeten dalam menerapkan keilmuan dalam pengembangan teknologi di bidang rekayasa sipil serta mampu mengaplikasikan dalam pembangunan berkelanjutan (sustainable development) di wilayah kepulauan untuk menghadapi tuntutan dan perubahan global dunia yang bersifat dinamis.',
 '/images/courses/TS.jpg', 'https://www.uib.ac.id/ts/', 1),

-- 2
(UUID_TO_BIN('018f7a8c-3b00-7d02-8000-000000000002'), 'Arsitektur', 'Architecture', 'FTSP', 'S1',
 'Menjadi program studi arsitektur maritim berbasis kearifan lokal dengan daya saing global yang mendukung pembangunan wilayah pesisir berkelanjutan.',
 '/images/courses/AR.jpg', 'https://www.uib.ac.id/arsi/', 2),

-- 3
(UUID_TO_BIN('018f7a8c-3b00-7d03-8000-000000000003'), 'Sistem Informasi', 'Information Systems', 'FIK', 'S1',
 'Sebagai program sarjana yang menghasilkan lulusan berkualitas di bidang Sistem Informasi melalui pendidikan, penelitian, dan pengabdian kepada masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
 '/images/courses/SI.jpg', 'https://www.uib.ac.id/si/', 3),

-- 4
(UUID_TO_BIN('018f7a8c-3b00-7d04-8000-000000000004'), 'Teknologi Informasi', 'Information Technology', 'FIK', 'S1',
 'Sebagai program sarjana yang menghasilkan lulusan berkualitas dalam bidang teknologi informasi khususnya teknologi cloud dan keamanan melalui pendidikan, penelitian, dan pengabdian masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
 '/images/courses/TI.jpg', 'https://www.uib.ac.id/ti/', 4),

-- 5
(UUID_TO_BIN('018f7a8c-3b00-7d05-8000-000000000005'), 'Manajemen', 'Management', 'FBM', 'S1',
 'Sebagai Program Sarjana Manajemen berstandar internasional dalam menghasilkan lulusan yang memiliki jiwa kepemimpinan dan kewirausahaan, berkompeten dalam bidang hubungan industri, keuangan perusahaan, pemasaran business to consumer, serta tanggap dalam mengantisipasi perubahan global yang dinamis.',
 '/images/courses/MN.jpg', 'https://www.uib.ac.id/mn/', 5),

-- 6
(UUID_TO_BIN('018f7a8c-3b00-7d06-8000-000000000006'), 'Akuntansi', 'Accounting', 'FBM', 'S1',
 'Sebagai program studi yang menghasilkan lulusan profesional di bidang akuntansi keuangan sesuai standar internasional dengan jiwa kepemimpinan dan kewirausahaan serta mampu mengikuti perubahan global yang dinamis.',
 '/images/courses/AK.jpg', 'https://www.uib.ac.id/ak/', 6),

-- 7
(UUID_TO_BIN('018f7a8c-3b00-7d07-8000-000000000007'), 'Pariwisata', 'Tourism', 'FBM', 'S1',
 'Menjadi program studi pariwisata dengan standar mutu internasional yang menghasilkan IPTEKS dan lulusan yang mampu mengikuti dinamika perubahan pariwisata di tingkat nasional dan internasional.',
 '/images/courses/PR.jpg', 'https://www.uib.ac.id/par/', 7),

-- 8
(UUID_TO_BIN('018f7a8c-3b00-7d08-8000-000000000008'), 'Magister Manajemen', 'Master of Management', 'FBM', 'S2',
 'Sebagai program studi dengan standar kualitas internasional yang menghasilkan lulusan berkualitas dengan kepemimpinan dan kewirausahaan bersemangat dan kompetensi dalam manajemen internasional di tingkat manajerial.',
 '/images/courses/MM.jpg', 'https://www.uib.ac.id/mm/', 8),

-- 9
(UUID_TO_BIN('018f7a8c-3b00-7d09-8000-000000000009'), 'Ilmu Hukum', 'Law', 'FIH', 'S1',
 'Sebagai Program Studi dengan standar kualitas internasional yang menghasilkan lulusan hukum yang dapat memenuhi perubahan dinamis hukum bisnis dalam konteks nasional dan internasional.',
 '/images/courses/IH.jpg', 'https://www.uib.ac.id/ih/', 9),

-- 10
(UUID_TO_BIN('018f7a8c-3b00-7d0a-8000-00000000000a'), 'Magister Hukum', 'Master of Law', 'FIH', 'S2',
 'Sebagai program studi dengan standar mutu internasional yang menghasilkan lulusan berkualitas yang mampu mengikuti dinamika perubahan hukum bisnis di tingkat nasional dan internasional.',
 '/images/courses/MH.jpg', 'https://www.uib.ac.id/mh/', 10),

-- 11
(UUID_TO_BIN('018f7a8c-3b00-7d0b-8000-00000000000b'), 'Pendidikan Bahasa Inggris', 'English Education', 'FIP', 'S1',
 'Menjadi program sarjana yang menghasilkan lulusan dengan kompetensi unggul dalam bidang pendidikan bahasa Inggris yang dinamis berbasis Edutechnopreneur (education, technology, and entrepreneurship) sesuai dengan standar kualitas internasional.',
 '/images/courses/PBI.jpg', 'https://www.uib.ac.id/pbi/', 11),

-- 12 – Biologi
(UUID_TO_BIN('018f7a8c-3b00-7d0c-8000-00000000000c'), 'Biologi', 'Biology', 'FK', 'S1',
 'Program studi Biologi menghasilkan lulusan yang menguasai ilmu hayati, berorientasi pada penelitian, dan mampu berkontribusi dalam bidang bioteknologi, konservasi, dan pengelolaan sumber daya alam hayati di tingkat nasional maupun internasional.',
 '/images/courses/BIO.png', 'https://www.uib.ac.id/bio/', 12),

-- 13 – Gizi
(UUID_TO_BIN('018f7a8c-3b00-7d0d-8000-00000000000d'), 'Gizi', 'Nutrition', 'FK', 'S1',
 'Program studi Gizi bertujuan menghasilkan lulusan yang kompeten dalam ilmu gizi, mampu merancang dan mengelola program gizi masyarakat serta klinis, dan berperan aktif dalam peningkatan status gizi di tingkat nasional dan internasional.',
 '/images/courses/GIZ.jpg', 'https://www.uib.ac.id/gizi/', 13),

-- 14 – Kedokteran
(UUID_TO_BIN('018f7a8c-3b00-7d0e-8000-00000000000e'), 'Kedokteran', 'Medicine', 'FK', 'S1',
 'Program studi Kedokteran menghasilkan dokter yang profesional, beretika, dan berwawasan global, mampu memberikan pelayanan kesehatan prima serta berkontribusi dalam pengembangan ilmu kedokteran dan kesehatan masyarakat.',
 '/images/courses/KED.jpeg', 'https://www.uib.ac.id/ked/', 14);


INSERT INTO gelombang (
    id,
    batch_key,
    batch_name,
    degree,
    batch_type
) VALUES

(UUID_TO_BIN('018f7a8c-3b00-7e02-8000-000000000101'), 'magister-gelombang-1',
 'Gelombang 01', 'S2', 'Reguler'),

(UUID_TO_BIN('018f7a8c-3b00-7e03-8000-000000000102'), 'sarjana-kedokteran-beasiswa-gelombang-2',
 'Gelombang 2 Beasiswa-S1 Kedokteran', 'S1', 'Beasiswa'),

(UUID_TO_BIN('018f7a8c-3b00-7e04-8000-000000000103'), 'sarjana-beasiswa-gelombang-3',
 'Beasiswa III', 'S1', 'Beasiswa'),

(UUID_TO_BIN('018f7a8c-3b00-7e05-8000-000000000104'), 'sarjana-gelombang-7',
 'Gelombang 07', 'S1', 'Reguler');


INSERT INTO gelombang_detail (
    gelombang_id,
    academic_year,
    image_path,
    event_date,
    start_time,
    end_time,
    location,
    registration_start,
    registration_end,
    usm_password
) VALUES

-- Magister Gelombang 01
(UUID_TO_BIN('018f7a8c-3b00-7e02-8000-000000000101'),
 'T.A 2026/2027', '/images/event/magister.png',
 '2026-05-23', '09:00:00', '17:00:00', 'Online',
 '2026-03-01', '2026-06-30',
 '$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa'),

-- Kedokteran Beasiswa
(UUID_TO_BIN('018f7a8c-3b00-7e03-8000-000000000102'),
 'T.A 2026/2027', '/images/event/GP.jpg',
 '2026-06-20', '09:00:00', '13:00:00', 'Batam',
 '2026-02-09', '2026-06-13',
 '$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa'),

-- Beasiswa III
(UUID_TO_BIN('018f7a8c-3b00-7e04-8000-000000000103'),
 'T.A 2026/2027', '/images/event/beasiswa-baru.png',
 '2026-06-13', '09:00:00', '16:00:00', 'Online',
 '2025-12-08', '2026-06-12',
 '$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa'),

-- Gelombang 07
(UUID_TO_BIN('018f7a8c-3b00-7e05-8000-000000000104'),
 'T.A 2026/2027', '/images/event/GP.jpg',
 '2026-06-27', '09:00:00', '16:00:00', 'Online',
 '2026-05-11', '2026-06-26',
 '$2b$10$nOUIs5kJ7naTuTFkBy1veuK0kSxUFXfuaOKdOKf9xYT0KKIGSJwFa');

INSERT INTO registration_fee (
    degree,
    batch_type,
    bank_name,
    account_holder,
    account_number,
    amount
) VALUES
('S1', 'Reguler', 'OCBC NISP', 'Universitas Internasional Batam', '094800007802', 250000),
('S1', 'Beasiswa', 'OCBC NISP', 'Universitas Internasional Batam', '094800007802', 150000),
('S2', 'Reguler', 'OCBC NISP', 'Universitas Internasional Batam', '094800007802', 1500000),
('S2', 'Beasiswa', 'OCBC NISP', 'Universitas Internasional Batam', '094800007802', 1500000);
