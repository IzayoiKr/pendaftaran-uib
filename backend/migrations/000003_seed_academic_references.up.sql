INSERT INTO program_studi (
    id, code, faculty, degree,
    image_path, link, sort_order
) VALUES
(UUID_TO_BIN('018f7a8c-3b00-7d01-8000-000000000001'), 'TS', 'FTSP', 'S1',
 '/images/courses/TS.jpg', 'https://www.uib.ac.id/ts/', 1),

(UUID_TO_BIN('018f7a8c-3b00-7d02-8000-000000000002'), 'AR', 'FTSP', 'S1',
 '/images/courses/AR.jpg', 'https://www.uib.ac.id/arsi/', 2),

(UUID_TO_BIN('018f7a8c-3b00-7d03-8000-000000000003'), 'SI', 'FIK', 'S1',
 '/images/courses/SI.jpg', 'https://www.uib.ac.id/si/', 3),

(UUID_TO_BIN('018f7a8c-3b00-7d04-8000-000000000004'), 'TI', 'FIK', 'S1',
 '/images/courses/TI.jpg', 'https://www.uib.ac.id/ti/', 4),

(UUID_TO_BIN('018f7a8c-3b00-7d05-8000-000000000005'), 'MN', 'FBM', 'S1',
 '/images/courses/MN.jpg', 'https://www.uib.ac.id/mn/', 5),

(UUID_TO_BIN('018f7a8c-3b00-7d06-8000-000000000006'), 'AK', 'FBM', 'S1',
 '/images/courses/AK.jpg', 'https://www.uib.ac.id/ak/', 6),

(UUID_TO_BIN('018f7a8c-3b00-7d07-8000-000000000007'), 'PR', 'FBM', 'S1',
 '/images/courses/PR.jpg', 'https://www.uib.ac.id/par/', 7),

(UUID_TO_BIN('018f7a8c-3b00-7d08-8000-000000000008'), 'MM', 'FBM', 'S2',
 '/images/courses/MM.jpg', 'https://www.uib.ac.id/mm/', 8),

(UUID_TO_BIN('018f7a8c-3b00-7d09-8000-000000000009'), 'IH', 'FIH', 'S1',
 '/images/courses/IH.jpg', 'https://www.uib.ac.id/ih/', 9),

(UUID_TO_BIN('018f7a8c-3b00-7d0a-8000-00000000000a'), 'MH', 'FIH', 'S2',
 '/images/courses/MH.jpg', 'https://www.uib.ac.id/mh/', 10),

(UUID_TO_BIN('018f7a8c-3b00-7d0b-8000-00000000000b'), 'PBI', 'FIP', 'S1',
 '/images/courses/PBI.jpg', 'https://www.uib.ac.id/pbi/', 11),

(UUID_TO_BIN('018f7a8c-3b00-7d0c-8000-00000000000c'), 'BIO', 'FK', 'S1',
 '/images/courses/BIO.png', 'https://www.uib.ac.id/bio/', 12),

(UUID_TO_BIN('018f7a8c-3b00-7d0d-8000-00000000000d'), 'GIZ', 'FK', 'S1',
 '/images/courses/GIZ.jpg', 'https://www.uib.ac.id/gizi/', 13),

(UUID_TO_BIN('018f7a8c-3b00-7d0e-8000-00000000000e'), 'KED', 'FK', 'S1',
 '/images/courses/KED.jpeg', 'https://www.uib.ac.id/ked/', 14);

INSERT INTO gelombang (
    id, batch_key, batch_name, batch_number, degree, batch_type
) VALUES
(UUID_TO_BIN('018f7a8c-3b00-7e02-8000-000000000101'), 'magister-gelombang-2', 'Gelombang 02', 2, 'S2', 'Reguler'),
(UUID_TO_BIN('018f7a8c-3b00-7e03-8000-000000000102'), 'sarjana-kedokteran-beasiswa-gelombang-2', 'Gelombang 2 Beasiswa-S1 Kedokteran', 2, 'S1', 'Beasiswa'),
(UUID_TO_BIN('018f7a8c-3b00-7e04-8000-000000000103'), 'sarjana-beasiswa-gelombang-3', 'Beasiswa III', 3, 'S1', 'Beasiswa'),
(UUID_TO_BIN('018f7a8c-3b00-7e05-8000-000000000104'), 'sarjana-gelombang-7', 'Gelombang 07', 7, 'S1', 'Reguler');

INSERT INTO gelombang_detail (
    gelombang_id, academic_year, image_path, event_date,
    start_time, end_time, location, registration_start, registration_end,
    usm_password
) VALUES
(UUID_TO_BIN('018f7a8c-3b00-7e02-8000-000000000101'), 2026, '/images/event/magister.png', '2026-07-18', '09:00:00', '17:00:00', 'Online', '2026-05-25', '2026-07-17', 'A1B2C3'),
(UUID_TO_BIN('018f7a8c-3b00-7e03-8000-000000000102'), 2026, '/images/event/GP.jpg', '2026-06-20', '09:00:00', '13:00:00', 'Batam', '2026-02-09', '2026-06-13', 'D4E5F6'),
(UUID_TO_BIN('018f7a8c-3b00-7e04-8000-000000000103'), 2026, '/images/event/beasiswa-baru.png', '2026-06-13', '09:00:00', '16:00:00', 'Online', '2025-12-08', '2026-06-12', 'G7H8I9'),
(UUID_TO_BIN('018f7a8c-3b00-7e05-8000-000000000104'), 2026, '/images/event/GP.jpg', '2026-06-27', '09:00:00', '16:00:00', 'Online', '2026-05-11', '2026-06-26', 'J0K1L2');

INSERT INTO registration_fee (
    degree, batch_type, bank_name, account_holder, account_number, amount
) VALUES
('S1', 'Reguler', 'OCBC NISP', 'Universitas Internasional Batam', '094800007802', 250000),
('S1', 'Beasiswa', 'OCBC NISP', 'Universitas Internasional Batam', '094800007802', 150000),
('S2', 'Reguler', 'OCBC NISP', 'Universitas Internasional Batam', '094800007802', 1500000),
('S2', 'Beasiswa', 'OCBC NISP', 'Universitas Internasional Batam', '094800007802', 1500000);
