import type {
  Step2DocConfig,
  S2Step2DocConfig,
  StatusState
} from "@/validation/schemaform";

/* ================= PRODI ================= */

export const PRODI_MAP: Record<string, string> = {
  "42": "Akuntansi (Accounting)",
  "12": "Arsitektur (Architecture)",
  "71": "Biologi (Biology)",
  "72": "Gizi (Nutrition)",
  "51": "Ilmu Hukum (Law Science)",
  "81": "Kedokteran (Medicine)",
  "41": "Manajemen (Management)",
  "46": "Pariwisata (Tourism)",
  "61": "Pendidikan Bahasa Inggris",
  "82": "Profesi Kedokteran (Medicine)",
  "31": "Sistem Informasi (Information System)",
  "11": "Teknik Sipil (Civil Engineering)",
  "32": "Teknologi Informasi (Information Technology)",

  "52": "Magister Hukum (Master of Law)",
  "44": "Magister Manajemen (Master of Management)",
};

export type SelectOption = {
  value: string;
  label: string;
};

const mapToOptions = (codes: string[]): SelectOption[] =>
  codes.map((code) => ({
    value: code,
    label: PRODI_MAP[code],
  }));

export const PRODI_S1_OPTIONS = mapToOptions([
  "42", "12", "71", "72", "51", "81", "41",
  "46", "61", "82", "31", "11", "32",
]);

export const PRODI_S2_OPTIONS = mapToOptions(["52", "44"]);

export function getProdiName(code?: string): string {
  return code ? PRODI_MAP[code] || code : "";
}

/* ================= OPTIONS ================= */

// Tahun kerja: 2011–2026 (matches original HTML exactly)
export const TAHUN_KERJA_OPTIONS: SelectOption[] = Array.from(
  { length: 16 },
  (_, i) => ({ value: String(2011 + i), label: String(2011 + i) })
);

export const JENIS_KELAMIN_OPTIONS: SelectOption[] = [
  { value: "l", label: "Laki - Laki (Male)" },
  { value: "p", label: "Perempuan (Female)" },
];

export const KEWARGANEGARAAN_OPTIONS: SelectOption[] = [
  { value: "1", label: "WNI" },
  { value: "2", label: "WNA" },
  { value: "3", label: "TIDAK ADA WN" },
];

export const JENJANG_PENDIDIKAN_OPTIONS: SelectOption[] = [
  { value: "d3", label: "D3 (Diploma 3)" },
  { value: "d4", label: "D4 (Diploma 4)" },
  { value: "s1", label: "S1 (Sarjana)" },
  { value: "s2", label: "S2 (Magister)" },
];

export const AGAMA_OPTIONS: SelectOption[] = [
  { value: "5", label: "BUDDHA" },
  { value: "4", label: "HINDU" },
  { value: "1", label: "ISLAM" },
  { value: "2", label: "KATHOLIK" },
  { value: "6", label: "KONGHUCU" },
  { value: "3", label: "KRISTEN" },
  { value: "7", label: "TIDAK ADA DATA" },
];

// Values from original STEP1S2 HTML: sendiri | instansi | lainnya
export const SUMBER_BIAYA_OPTIONS: SelectOption[] = [
  { value: "sendiri", label: "Sendiri (Self-funding)" },
  { value: "instansi", label: "Instansi (Institute)" },
  { value: "lainnya", label: "Lainnya (Others)" },
];

// Values from original STEP1S2 HTML: pemerintah | swasta | bumn | ptn | pts
export const STATUS_INSTANSI_OPTIONS: SelectOption[] = [
  { value: "pemerintah", label: "Pemerintah (Government)" },
  { value: "swasta",     label: "Swasta (Private)" },
  { value: "bumn",       label: "BUMN" },
  { value: "ptn",        label: "PTN" },
  { value: "pts",        label: "PTS" },
];

export const JENIS_DAFTAR_OPTIONS: SelectOption[] = [
  { value: "baru", label: "Baru (Newly Registered)" },
  { value: "alihjenjang", label: "Alih Jenjang (Change Level)" },
  { value: "transfer", label: "Transfer" },
];

export const WAKTU_KULIAH_OPTIONS: SelectOption[] = [
  { value: "pagi", label: "Pagi (Morning Class)" },
  { value: "malam", label: "Malam (Night Class)" },
];

/* ================= S1 DOCUMENT ================= */

export const S1_STEP2_DOCS: Step2DocConfig[] = [
  { name: "pp", label: "Pas Photo (Photo Image)", section: "personal", required: true },
  { name: "ktp", label: "Dokumen KTP / SIM / Passport", section: "personal", required: true },
  { name: "kk", label: "Dokumen Kartu Keluarga", section: "personal", required: true },

  { name: "transkrip_nilai", label: "Transkrip Nilai (Transcript of Grades)", section: "study", required: true },
  { name: "ijazah_dok", label: "Ijazah (Diploma)", section: "study", required: true },

  { name: "buktibayar", label: "Bukti Pembayaran (Receipt of Payment)", section: "payment", required: true },
];

export const S1_STEP2_PERSONAL_DOCS = S1_STEP2_DOCS.filter(
  (d) => d.section === "personal"
);

export const S1_STEP2_TRANSFER_DOCS = S1_STEP2_DOCS.filter(
  (d) => d.section === "study"
);

export const S1_STEP2_PAYMENT_DOC = S1_STEP2_DOCS.find(
  (d) => d.section === "payment"
)!;

/* ================= PAYMENT ================= */

export const S2_STEP2_PAYMENT_INFO = {
  bank:       "OCBC Bank",
  rekening:   "123456789",
  nama:       "Universitas Internasional Batam",
  panduanUrl: "/api/files/panduanpenggunaanqris", 
  biaya:      "Rp 300.000",
};


export const S1_STEP2_PAYMENT_INFO = {
  bank:       "OCBC Bank",
  rekening:   "123456789",
  nama:       "Universitas Internasional Batam",
  panduanUrl: "/api/files/panduanpenggunaanqris", 
  biaya:      "Rp 200.000",
};

/* ================= STATUS ================= */

export type Step2StatusKey =
  | "completeness"
  | "checkStatus"
  | "checkNotes"
  | "paymentStatus"
  | "paymentNotes";

export type Step2StatusItem = {
  label: string;
  key: Step2StatusKey;
  fallback?: string;
};

export const STEP2_STATUS_ITEMS: Step2StatusItem[] = [
  { label: "Kelengkapan Dokumen (Completion of Requirement)", key: "completeness" },
  { label: "Status Pemeriksaan Dokumen (Document Check Status)", key: "checkStatus" },
  { label: "Catatan Pemeriksaan Dokumen (Document Inspection Notes)", key: "checkNotes", fallback: "-" },
  { label: "Status Pemeriksaan Pembayaran (Payment Check Status)", key: "paymentStatus" },
  { label: "Catatan Pemeriksaan Keuangan (Payment Notes)", key: "paymentNotes", fallback: "-" },
];

export const INITIAL_STATUS_STATE: StatusState = {
  completeness: "Masih ada dokumen yang tidak lengkap",
  checkStatus: "Masih dalam pemeriksaan",
  checkNotes: "",
  paymentStatus: "Masih dalam pemeriksaan",
  paymentNotes: "",
};

export const S1_STEP2_REQUIRED_DOCS = [
  "pp",
  "ktp",
  "kk",
  "buktibayar",
] as const;

export const S1_STEP2_REQUIRED_TRANSFER_DOCS = [
  "transkrip_nilai",
  "ijazah_dok",
] as const;

export const STATUS_PRESETS = {
  INCOMPLETE: (missing: string[]): StatusState => ({
    completeness: "Tidak Lengkap",
    checkStatus: "Rejected",
    checkNotes: `Dokumen kurang: ${missing.join(", ")}`,
    paymentStatus: "Belum Dibayar",
    paymentNotes: "-",
  }),

  PAYMENT_INCOMPLETE: {
    completeness: "Lengkap",
    checkStatus: "Pending",
    checkNotes: "Menunggu verifikasi admin",
    paymentStatus: "Belum Dibayar",
    paymentNotes: "Data pembayaran belum lengkap",
  },

  COMPLETE: {
    completeness: "Lengkap",
    checkStatus: "Pending",
    checkNotes: "Menunggu verifikasi admin",
    paymentStatus: "Sudah Dibayar",
    paymentNotes: "Menunggu konfirmasi pembayaran",
  },
};

/* ================= S2 DOCUMENT ================= */
// Per actual STEP2S2 (Step 3) HTML:
//   Personal: al (Akta Lahir), kk, pp, ktp
//   School:   r1 (Ijazah), r4 (Transkrip Nilai Sarjana)
//   Payment:  buktibayar

export const S2_STEP2_DOCS: S2Step2DocConfig[] = [
  { name: "al",  label: "Dokumen Akta Lahir (Birth Certificate)",    section: "personal", required: true },
  { name: "kk",  label: "Dokumen Kartu Keluarga (Family Card)",      section: "personal", required: true },
  { name: "pp",  label: "Dokumen Pas Photo (Passport Photo)",        section: "personal", required: true },
  { name: "ktp", label: "Dokumen KTP (National Identity Card)",      section: "personal", required: true },

  { name: "r1",  label: "Ijazah (Bachelor Certificate)",             section: "study",    required: true },
  { name: "r4",  label: "Transkrip Nilai Sarjana (Academic Transcript)", section: "study", required: true },

  { name: "buktibayar", label: "Bukti Pembayaran (Receipt of Payment)", section: "payment", required: true },
];

export const S2_STEP2_PERSONAL_DOCS = S2_STEP2_DOCS.filter(
  (d) => d.section === "personal"
);

export const S2_STEP2_STUDY_DOCS = S2_STEP2_DOCS.filter(
  (d) => d.section === "study"
);

export const S2_STEP2_PAYMENT_DOC = S2_STEP2_DOCS.find(
  (d) => d.section === "payment"
)!;

export const S2_STEP2_REQUIRED_DOCS = S2_STEP2_DOCS.map(
  (d) => d.name
);

export const S2_STEP2_STATUS_ITEMS = S2_STEP2_DOCS.map((d) => ({
  key: d.name,
  label: d.label,
}));

/* ================= PARENT OPTIONS ================= */
// Values must EXACTLY match the original HTML option values from STEPPARENTS2

export const PENDIDIKAN_OPTIONS: SelectOption[] = [
  { value: "D1",        label: "Diploma 1" },
  { value: "D2",        label: "Diploma 2" },
  { value: "D3",        label: "Diploma 3" },
  { value: "D4",        label: "Diploma 4" },
  { value: "NON-AKAD",  label: "NON-AKADEMIK" },
  { value: "PR",        label: "Profesi" },
  { value: "Sp-1",      label: "Spesialis 1" },
  { value: "Sp-2",      label: "Spesialis 2" },
  { value: "S1",        label: "Strata 1" },
  { value: "S2",        label: "Strata 2" },
  { value: "S3",        label: "Strata 3" },
  { value: "TAMAT SD",  label: "TAMAT SD" },
  { value: "TAMAT SMA", label: "TAMAT SMA" },
  { value: "TAMAT SMP", label: "TAMAT SMP" },
  { value: "TDK TMT SD",label: "TIDAK TAMAT SD" },
];

export const PEKERJAAN_OPTIONS: SelectOption[] = [
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

// Values 1–7 match original HTML exactly
export const PENGHASILAN_OPTIONS: SelectOption[] = [
  { value: "1", label: "100.000 - 500.000" },
  { value: "2", label: "500.000 - 1.000.000" },
  { value: "3", label: "1.000.000 - 2.500.000" },
  { value: "4", label: "2.500.000 - 5.000.000" },
  { value: "5", label: "5.000.000 - 7.500.000" },
  { value: "6", label: "7.500.000 - 10.000.000" },
  { value: "7", label: "> 10.000.000" },
];

// Values "n" = Hidup, "y" = Meninggal — match original HTML exactly
export const STATUS_ORANG_TUA_OPTIONS: SelectOption[] = [
  { value: "n", label: "Hidup (Alive)" },
  { value: "y", label: "Meninggal (Deceased)" },
];