// ============================================================
// constants/registerOptions.ts
// Centralised dropdown option lists for the registration forms.
// Import from here instead of duplicating inside each Step file.
// ============================================================

export const PRODI_S1_OPTIONS = [
  { value: "42", label: "Akuntansi (Accounting)" },
  { value: "12", label: "Arsitektur (Architecture)" },
  { value: "71", label: "Biologi (Biology)" },
  { value: "72", label: "Gizi (Nutrition)" },
  { value: "51", label: "Ilmu Hukum (Law Science)" },
  { value: "81", label: "Kedokteran (Medicine)" },
  { value: "41", label: "Manajemen (Management)" },
  { value: "46", label: "Pariwisata (Tourism)" },
  { value: "61", label: "Pendidikan Bahasa Inggris (English Language Education)" },
  { value: "82", label: "Profesi Kedokteran (Medicine)" },
  { value: "31", label: "Sistem Informasi (Information System)" },
  { value: "11", label: "Teknik Sipil (Civil Engineering)" },
  { value: "32", label: "Teknologi Informasi (Information Technology)" },
];

export const PRODI_S2_OPTIONS = [
  { value: "52", label: "Magister Hukum (Master of Law)" },
  { value: "44", label: "Magister Manajemen (Master of Management)" },
];

export const PENDIDIKAN_OPTIONS = [
  { value: "D1",       label: "Diploma 1" },
  { value: "D2",       label: "Diploma 2" },
  { value: "D3",       label: "Diploma 3" },
  { value: "D4",       label: "Diploma 4" },
  { value: "NON-AKAD", label: "NON-AKADEMIK" },
  { value: "PR",       label: "Profesi" },
  { value: "Sp-1",     label: "Spesialis 1" },
  { value: "Sp-2",     label: "Spesialis 2" },
  { value: "S1",       label: "Strata 1" },
  { value: "S2",       label: "Strata 2" },
  { value: "S3",       label: "Strata 3" },
  { value: "TAMAT SD",    label: "TAMAT SD" },
  { value: "TAMAT SMA",   label: "TAMAT SMA" },
  { value: "TAMAT SMP",   label: "TAMAT SMP" },
  { value: "TDK TMT SD",  label: "TIDAK TAMAT SD" },
];

export const PEKERJAAN_OPTIONS = [
  { value: "3",  label: "ABRI" },
  { value: "14", label: "AHLI/PROF.BEKRJ PERORANGA" },
  { value: "16", label: "BURUH" },
  { value: "8",  label: "GURU/DOSEN NEGERI" },
  { value: "11", label: "GURU/DOSEN SWASTA" },
  { value: "19", label: "IBU RUMAH TANGGA" },
  { value: "2",  label: "KARYAWAN SWASTA" },
  { value: "7",  label: "LAIN-LAIN" },
  { value: "13", label: "PEDAGANG/WIRASWASTA" },
  { value: "12", label: "PEG.SWASTA NON GURU/DOSEN" },
  { value: "1",  label: "PEGAWAI NEGERI" },
  { value: "6",  label: "PENSIUNAN" },
  { value: "18", label: "PENSIUNAN PEG.SWASTA" },
  { value: "17", label: "PENSIUNAN PNS/TNI" },
  { value: "15", label: "PETANI/NELAYAN" },
  { value: "9",  label: "PNS NON GURU/DOSEN" },
  { value: "20", label: "POLISI" },
  { value: "21", label: "Tidak Terisi" },
  { value: "10", label: "TNI" },
  { value: "5",  label: "WIRASWASTA" },
];

export const PENGHASILAN_OPTIONS = [
  { value: "1", label: "100.000 - 500.000" },
  { value: "2", label: "500.000 - 1.000.000" },
  { value: "3", label: "1.000.000 - 2.500.000" },
  { value: "4", label: "2.500.000 - 5.000.000" },
  { value: "5", label: "5.000.000 - 7.500.000" },
  { value: "6", label: "7.500.000 - 10.000.000" },
  { value: "7", label: "> 10.000.000" },
];

/** Generates an array of years from startYear up to and including endYear. */
export const generateYearOptions = (startYear: number, endYear: number) =>
  Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

// Pre-built range used by the S2 "year started working" field (2011–2026).
export const TAHUN_KERJA_OPTIONS = generateYearOptions(2011, 2026);
