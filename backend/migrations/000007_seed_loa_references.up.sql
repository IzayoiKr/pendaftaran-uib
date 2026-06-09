-- S1 Program Fees (all S1 programs, including Kedokteran)
INSERT INTO master_s1_prodi_fee (program_studi_id, bpp_pokok, per_sks_cost, base_ppl, lab_fee) VALUES
(UUID_TO_BIN('018f7a8c-3b00-7d01-8000-000000000001'), 5500000, 166666, 3000000, 750000),  -- Teknik Sipil
(UUID_TO_BIN('018f7a8c-3b00-7d02-8000-000000000002'), 5500000, 158333, 3000000, 750000),  -- Arsitektur
(UUID_TO_BIN('018f7a8c-3b00-7d03-8000-000000000003'), 5500000, 158333, 3000000, 750000),  -- Sistem Informasi
(UUID_TO_BIN('018f7a8c-3b00-7d04-8000-000000000004'), 5500000, 158333, 3000000, 750000),  -- Teknologi Informasi
(UUID_TO_BIN('018f7a8c-3b00-7d05-8000-000000000005'), 5500000, 166666, 3000000, 750000),  -- Manajemen
(UUID_TO_BIN('018f7a8c-3b00-7d06-8000-000000000006'), 5500000, 166666, 3000000, 750000),  -- Akuntansi
(UUID_TO_BIN('018f7a8c-3b00-7d07-8000-000000000007'), 5500000, 166666, 5000000, 750000),  -- Pariwisata (higher PPL)
(UUID_TO_BIN('018f7a8c-3b00-7d09-8000-000000000009'), 5500000, 166666, 3000000, 750000),  -- Ilmu Hukum
(UUID_TO_BIN('018f7a8c-3b00-7d0b-8000-00000000000b'), 5500000, 166666, 3000000, 750000),  -- Pendidikan Bahasa Inggris
(UUID_TO_BIN('018f7a8c-3b00-7d0c-8000-00000000000c'), 5500000, 166666, 3000000, 750000),  -- Biologi
(UUID_TO_BIN('018f7a8c-3b00-7d0d-8000-00000000000d'), 5500000, 166666, 3000000, 750000),  -- Gizi
(UUID_TO_BIN('018f7a8c-3b00-7d0e-8000-00000000000e'), 5500000, 166666, 3000000, 750000);  -- Kedokteran

-- SPP Matrix by Gelombang Number (1-10) and USM Rank (1-5)
INSERT INTO master_s1_spp_matrix (gelombang_number, usm_rank, spp_amount) VALUES
(1, 1, 5000000), (1, 2, 5000000), (1, 3, 5000000), (1, 4, 5000000), (1, 5, 5000000),
(2, 1, 5000000), (2, 2, 5000000), (2, 3, 5000000), (2, 4, 5000000), (2, 5, 5000000),
(3, 1, 5000000), (3, 2, 5000000), (3, 3, 5000000), (3, 4, 5000000), (3, 5, 5000000),
(4, 1, 5500000), (4, 2, 6000000), (4, 3, 6500000), (4, 4, 7000000), (4, 5, 7500000),
(5, 1, 6000000), (5, 2, 6500000), (5, 3, 7000000), (5, 4, 7500000), (5, 5, 8000000),
(6, 1, 6500000), (6, 2, 7000000), (6, 3, 7500000), (6, 4, 8000000), (6, 5, 8500000),
(7, 1, 7000000), (7, 2, 7500000), (7, 3, 8000000), (7, 4, 8500000), (7, 5, 9000000),
(8, 1, 7500000), (8, 2, 8000000), (8, 3, 8500000), (8, 4, 9000000), (8, 5, 9500000),
(9, 1, 8000000), (9, 2, 8500000), (9, 3, 9000000), (9, 4, 9500000), (9, 5, 10000000),
(10, 1, 8500000), (10, 2, 9000000), (10, 3, 9500000), (10, 4, 10000000), (10, 5, 10500000);

-- Scholarships
INSERT INTO master_s1_scholarship (id, name, spp_discount_pct, ppl_discount_pct, bpp_discount_pct, sks_discount_pct) VALUES
(1, 'Cemerlang',    100.00, 0.00,   100.00, 100.00),
(2, 'Bidikmisi',     100.00, 100.00, 100.00, 100.00),
(3, 'Insan Mandiri', 100.00, 0.00,   100.00, 100.00),
(4, 'Prestasi 1',    100.00, 0.00,   50.00,  50.00),
(5, 'Prestasi 2',    100.00, 0.00,   25.00,  25.00),
(6, 'Prestasi 3',    100.00, 0.00,   0.00,   0.00),
(7, 'Prestasi 4',    76.19,  0.00,   0.00,   0.00);

-- S2 Packages
INSERT INTO master_s2_package (id, category_name, total_tuition, matriculation_fee, installment_schedule) VALUES
(1, 'Umum', 50000000, 2000000, '{"semester_1": 30000000, "semester_2": 10000000, "semester_3": 10000000}'),
(2, 'Sivitas Akademika / Alumni / Kelas Kerja Sama', 40000000, 2000000, '{"semester_1": 20000000, "semester_2": 10000000, "semester_3": 10000000}'),
(3, 'Fast Track', 27000000, 2000000, '{"semester_1": 13500000, "semester_2": 6750000, "semester_3": 6750000}');
