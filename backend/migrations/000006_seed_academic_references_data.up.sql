INSERT INTO program_studi (
    id, program_key, title, faculty, degree,
    description,
    image_path, link, sort_order
) VALUES

(UUID_TO_BIN('018f7a8c-3b00-7d01-8000-000000000001'), 'teknik-sipil',
 'Teknik Sipil', 'FTSP', 'S1',
 'Sebagai program study yang menghasilkan lulusan berstandar internasional yang berkompeten dalam menerapkan keilmuan dalam pengembangan teknologi di bidang rekayasa sipil serta mampu mengaplikasikan dalam pembangunan berkelanjutan (sustainable development) di wilayah kepulauan untuk menghadapi tuntutan dan perubahan global dunia yang bersifat dinamis.',
 '/images/courses/TS.jpg', 'https://www.uib.ac.id/ts/', 1),

(UUID_TO_BIN('018f7a8c-3b00-7d02-8000-000000000002'), 'arsitektur',
 'Arsitektur', 'FTSP', 'S1',
 'Menjadi program studi arsitektur maritim berbasis kearifan lokal dengan daya saing global yang mendukung pembangunan wilayah pesisir berkelanjutan.',
 '/images/courses/AR.jpg', 'https://www.uib.ac.id/arsi/', 2),

(UUID_TO_BIN('018f7a8c-3b00-7d03-8000-000000000003'), 'sistem-informasi',
 'Sistem Informasi', 'FIK', 'S1',
 'Sebagai program sarjana yang menghasilkan lulusan berkualitas di bidang Sistem Informasi melalui pendidikan, penelitian, dan pengabdian kepada masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
 '/images/courses/SI.jpg', 'https://www.uib.ac.id/si/', 3),

(UUID_TO_BIN('018f7a8c-3b00-7d04-8000-000000000004'), 'teknologi-informasi',
 'Teknologi Informasi', 'FIK', 'S1',
 'Sebagai program sarjana yang menghasilkan lulusan berkualitas dalam bidang teknologi informasi khususnya teknologi cloud dan keamanan melalui pendidikan, penelitian, dan pengabdian masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
 '/images/courses/TI.jpg', 'https://www.uib.ac.id/ti/', 4),

(UUID_TO_BIN('018f7a8c-3b00-7d05-8000-000000000005'), 'manajemen',
 'Manajemen', 'FBM', 'S1',
 'Sebagai Program Sarjana Manajemen berstandar internasional dalam menghasilkan lulusan yang memiliki jiwa kepemimpinan dan kewirausahaan, berkompeten dalam bidang hubungan industri, keuangan perusahaan, pemasaran business to consumer, serta tanggap dalam mengantisipasi perubahan global yang dinamis.',
 '/images/courses/MN.jpg', 'https://www.uib.ac.id/mn/', 5),

(UUID_TO_BIN('018f7a8c-3b00-7d06-8000-000000000006'), 'akuntansi',
 'Akuntansi', 'FBM', 'S1',
 'Sebagai program studi yang menghasilkan lulusan profesional di bidang akuntansi keuangan sesuai standar internasional dengan jiwa kepemimpinan dan kewirausahaan serta mampu mengikuti perubahan global yang dinamis.',
 '/images/courses/AK.jpg', 'https://www.uib.ac.id/ak/', 6),

(UUID_TO_BIN('018f7a8c-3b00-7d07-8000-000000000007'), 'pariwisata',
 'Pariwisata', 'FBM', 'S1',
 'Menjadi program studi pariwisata dengan standar mutu internasional yang menghasilkan IPTEKS dan lulusan yang mampu mengikuti dinamika perubahan pariwisata di tingkat nasional dan internasional.',
 '/images/courses/PR.jpg', 'https://www.uib.ac.id/par/', 7),

(UUID_TO_BIN('018f7a8c-3b00-7d08-8000-000000000008'), 'magister-manajemen',
 'Magister Manajemen', 'FBM', 'S2',
 'Sebagai program studi dengan standar kualitas internasional yang menghasilkan lulusan berkualitas dengan kepemimpinan dan kewirausahaan bersemangat dan kompetensi dalam manajemen internasional di tingkat manajerial.',
 '/images/courses/MM.jpg', 'https://www.uib.ac.id/mm/', 8),

(UUID_TO_BIN('018f7a8c-3b00-7d09-8000-000000000009'), 'ilmu-hukum',
 'Ilmu Hukum', 'FIH', 'S1',
 'Sebagai Program Studi dengan standar kualitas internasional yang menghasilkan lulusan hukum yang dapat memenuhi perubahan dinamis hukum bisnis dalam konteks nasional dan internasional.',
 '/images/courses/IH.jpg', 'https://www.uib.ac.id/ih/', 9),

(UUID_TO_BIN('018f7a8c-3b00-7d0a-8000-00000000000a'), 'magister-hukum',
 'Magister Hukum', 'FIH', 'S2',
 'Sebagai program studi dengan standar mutu internasional yang menghasilkan lulusan berkualitas yang mampu mengikuti dinamika perubahan hukum bisnis di tingkat nasional dan internasional.',
 '/images/courses/MH.jpg', 'https://www.uib.ac.id/mh/', 10),

(UUID_TO_BIN('018f7a8c-3b00-7d0b-8000-00000000000b'), 'pendidikan-bahasa-inggris',
 'Pendidikan Bahasa Inggris', 'FIP', 'S1',
 'Menjadi program sarjana yang menghasilkan lulusan dengan kompetensi unggul dalam bidang pendidikan bahasa Inggris yang dinamis berbasis Edutechnopreneur (education, technology, and entrepreneurship) sesuai dengan standar kualitas internasional.',
 '/images/courses/PBI.jpg', 'https://www.uib.ac.id/pbi/', 11);


INSERT INTO gelombang (
    id,
    batch_key,
    batch_name, batch_type, program_type, program_type_en,
    degree, academic_year, image_path,
    event_date, start_time, end_time, location,
    registration_start, registration_end, usm_password
) VALUES

(UUID_TO_BIN('018f7a8c-3b00-7e01-8000-000000000101'),
 'sarjana-gelombang-6',
 'Gelombang 06', 'Reguler', 'Program Sarjana', 'Undergraduate Program',
 'S1', 'T.A 2026/2027', '/images/event/GP.jpg',
 '2026-05-09', '09:00:00', '16:00:00', 'Online',
 '2026-04-13', '2026-05-08', 'S1G6OL'),

(UUID_TO_BIN('018f7a8c-3b00-7e02-8000-000000000102'),
 'magister-gelombang-1',
 'Gelombang 01', 'Reguler', 'Program Magister', 'Master Program',
 'S2', 'T.A 2026/2027', '/images/event/magister.png',
 '2026-05-23', '09:00:00', '17:00:00', 'Online',
 '2026-03-01', '2026-05-22', 'M2G1OL'),

(UUID_TO_BIN('018f7a8c-3b00-7e03-8000-000000000103'),
 'sarjana-kedokteran-beasiswa-gelombang-2',
 'Gelombang 2 Beasiswa-S1 Kedokteran', 'Beasiswa', 'Program Sarjana', 'Undergraduate Program',
 'S1', 'T.A 2026/2027', '/images/event/GP.jpg',
 '2026-06-20', '09:00:00', '13:00:00', 'Batam',
 '2026-02-09', '2026-06-13', 'K2B2BM'),

(UUID_TO_BIN('018f7a8c-3b00-7e04-8000-000000000104'),
 'sarjana-beasiswa-gelombang-3',
 'Beasiswa III', 'Beasiswa', 'Program Sarjana', 'Undergraduate Program',
 'S1', 'T.A 2026/2027', '/images/event/beasiswa-baru.png',
 '2026-06-13', '09:00:00', '16:00:00', 'Online',
 '2025-12-08', '2026-06-12', 'B3OL26'),

(UUID_TO_BIN('018f7a8c-3b00-7e05-8000-000000000105'),
 'sarjana-gelombang-7',
 'Gelombang 07', 'Reguler', 'Program Sarjana', 'Undergraduate Program',
 'S1', 'T.A 2026/2027', '/images/event/GP.jpg',
 '2026-06-27', '09:00:00', '16:00:00', 'Online',
 '2026-05-11', '2026-06-26', 'F67BLO');
