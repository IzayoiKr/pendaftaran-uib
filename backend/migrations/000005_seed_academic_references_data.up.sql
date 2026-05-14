INSERT INTO program_studi (
    id, title, faculty, degree,
    description,
    image_path, link, sort_order
) VALUES

('550e8400-e29b-41d4-a716-446655440001', 'Teknik Sipil',            'FTSP', 'S1',
 'Sebagai program study yang menghasilkan lulusan berstandar internasional yang berkompeten dalam menerapkan keilmuan dalam pengembangan teknologi di bidang rekayasa sipil serta mampu mengaplikasikan dalam pembangunan berkelanjutan (sustainable development) di wilayah kepulauan untuk menghadapi tuntutan dan perubahan global dunia yang bersifat dinamis.',
 '/images/courses/TS.jpg',  'https://www.uib.ac.id/ts/',   1),

('550e8400-e29b-41d4-a716-446655440002', 'Arsitektur',              'FTSP', 'S1',
 'Menjadi program studi arsitektur maritim berbasis kearifan lokal dengan daya saing global yang mendukung pembangunan wilayah pesisir berkelanjutan.',
 '/images/courses/AR.jpg',  'https://www.uib.ac.id/arsi/', 2),

('550e8400-e29b-41d4-a716-446655440003', 'Sistem Informasi',        'FIK',  'S1',
 'Sebagai program sarjana yang menghasilkan lulusan berkualitas di bidang Sistem Informasi melalui pendidikan, penelitian, dan pengabdian kepada masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
 '/images/courses/SI.jpg',  'https://www.uib.ac.id/si/',   3),

('550e8400-e29b-41d4-a716-446655440004', 'Teknologi Informasi',     'FIK',  'S1',
 'Sebagai program sarjana yang menghasilkan lulusan berkualitas dalam bidang teknologi informasi khususnya teknologi cloud dan keamanan melalui pendidikan, penelitian, dan pengabdian masyarakat, pada tingkat nasional dan internasional di tahun 2021.',
 '/images/courses/TI.jpg',  'https://www.uib.ac.id/ti/',   4),

('550e8400-e29b-41d4-a716-446655440005', 'Manajemen',               'FBM',  'S1',
 'Sebagai Program Sarjana Manajemen berstandar internasional dalam menghasilkan lulusan yang memiliki jiwa kepemimpinan dan kewirausahaan, berkompeten dalam bidang hubungan industri, keuangan perusahaan, pemasaran business to consumer, serta tanggap dalam mengantisipasi perubahan global yang dinamis.',
 '/images/courses/MN.jpg',  'https://www.uib.ac.id/mn/',   5),

('550e8400-e29b-41d4-a716-446655440006', 'Akuntansi',               'FBM',  'S1',
 'Sebagai program studi yang menghasilkan lulusan profesional di bidang akuntansi keuangan sesuai standar internasional dengan jiwa kepemimpinan dan kewirausahaan serta mampu mengikuti perubahan global yang dinamis.',
 '/images/courses/AK.jpg',  'https://www.uib.ac.id/ak/',   6),

('550e8400-e29b-41d4-a716-446655440007', 'Pariwisata',              'FBM',  'S1',
 'Menjadi program studi pariwisata dengan standar mutu internasional yang menghasilkan IPTEKS dan lulusan yang mampu mengikuti dinamika perubahan pariwisata di tingkat nasional dan internasional.',
 '/images/courses/PR.jpg',  'https://www.uib.ac.id/par/',  7),

('550e8400-e29b-41d4-a716-446655440008', 'Magister Manajemen',      'FBM',  'S2',
 'Sebagai program studi dengan standar kualitas internasional yang menghasilkan lulusan berkualitas dengan kepemimpinan dan kewirausahaan bersemangat dan kompetensi dalam manajemen internasional di tingkat manajerial.',
 '/images/courses/MM.jpg',  'https://www.uib.ac.id/mm/',   8),

('550e8400-e29b-41d4-a716-446655440009', 'Ilmu Hukum',              'FIH',  'S1',
 'Sebagai Program Studi dengan standar kualitas internasional yang menghasilkan lulusan hukum yang dapat memenuhi perubahan dinamis hukum bisnis dalam konteks nasional dan internasional.',
 '/images/courses/IH.jpg',  'https://www.uib.ac.id/ih/',   9),

('550e8400-e29b-41d4-a716-446655440010', 'Magister Hukum',          'FIH',  'S2',
 'Sebagai program studi dengan standar mutu internasional yang menghasilkan lulusan berkualitas yang mampu mengikuti dinamika perubahan hukum bisnis di tingkat nasional dan internasional.',
 '/images/courses/MH.jpg',  'https://www.uib.ac.id/mh/',   10),

('550e8400-e29b-41d4-a716-446655440011', 'Pendidikan Bahasa Inggris', 'FIP', 'S1',
 'Menjadi program sarjana yang menghasilkan lulusan dengan kompetensi unggul dalam bidang pendidikan bahasa Inggris yang dinamis berbasis Edutechnopreneur (education, technology, and entrepreneurship) sesuai dengan standar kualitas internasional.',
 '/images/courses/PBI.jpg', 'https://www.uib.ac.id/pbi/',  11);


INSERT INTO gelombang (
    id,
    batch_key,
    batch_name, batch_type, program_type, program_type_en,
    degree, academic_year, image_path,
    event_date, start_time, end_time, location,
    registration_start, registration_end, usm_password
) VALUES

('b1a0c7e2-0f1a-4d3b-9a1c-8e2b3c4d5e01',
 'sarjana-gelombang-6',
 'Gelombang 06', 'Reguler', 'Program Sarjana', 'Undergraduate Program',
 'S1', 'T.A 2026/2027', '/images/event/GP.jpg',
 '2026-05-09', '09:00:00', '16:00:00', 'Online',
 '2026-04-13', '2026-05-08', 'S1G6OL'),

('b1a0c7e2-0f1a-4d3b-9a1c-8e2b3c4d5e02',
 'magister-gelombang-1',
 'Gelombang 01', 'Reguler', 'Program Magister', 'Master Program',
 'S2', 'T.A 2026/2027', '/images/event/magister.png',
 '2026-05-23', '09:00:00', '17:00:00', 'Online',
 '2026-03-01', '2026-05-22', 'M2G1OL'),

('b1a0c7e2-0f1a-4d3b-9a1c-8e2b3c4d5e03',
 'sarjana-kedokteran-beasiswa-gelombang-2',
 'Gelombang 2 Beasiswa-S1 Kedokteran', 'Beasiswa', 'Program Sarjana', 'Undergraduate Program',
 'S1', 'T.A 2026/2027', '/images/event/GP.jpg',
 '2026-06-20', '09:00:00', '13:00:00', 'Batam',
 '2026-02-09', '2026-06-13', 'K2B2BM'),

('b1a0c7e2-0f1a-4d3b-9a1c-8e2b3c4d5e04',
 'sarjana-beasiswa-gelombang-3',
 'Beasiswa III', 'Beasiswa', 'Program Sarjana', 'Undergraduate Program',
 'S1', 'T.A 2026/2027', '/images/event/beasiswa-baru.png',
 '2026-06-13', '09:00:00', '16:00:00', 'Online',
 '2025-12-08', '2026-06-12', 'B3OL26'),

('b1a0c7e2-0f1a-4d3b-9a1c-8e2b3c4d5e05',
 'sarjana-gelombang-7',
 'Gelombang 07', 'Reguler', 'Program Sarjana', 'Undergraduate Program',
 'S1', 'T.A 2026/2027', '/images/event/GP.jpg',
 '2026-06-27', '09:00:00', '16:00:00', 'Online',
 '2026-05-11', '2026-06-26', 'F67BLO');
