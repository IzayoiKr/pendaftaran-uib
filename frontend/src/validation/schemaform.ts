import { z } from "zod";

const stringRequired = (msg: string) => z.string().trim().min(1, msg);
const namaSchema = z.string().trim().min(3).max(100);
const emailSchema = z.string().trim().email("Format email tidak valid");

const phoneSchema = z
  .string()
  .transform(v => v.replace(/\D/g, ""))
  .transform(v => (v.startsWith("0") ? "62" + v.slice(1) : v))
  .refine(v => v.length >= 10 && v.length <= 15, "No HP tidak valid");

const nikSchema = z
  .string()
  .transform(v => v.replace(/\D/g, ""))
  .refine(v => v.length === 16, "NIK harus 16 digit");

const tanggalSchema = z
  .string()
  .min(1, "Tanggal wajib diisi")
  .refine(v => !isNaN(new Date(v).getTime()), "Format tanggal tidak valid")
  .refine(v => new Date(v) <= new Date(), "Tanggal tidak boleh di masa depan")
  .refine(v => {
    const birth = new Date(v);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 15;
  }, "Minimal umur 15 tahun");

const ipkSchema = z.number().min(0).max(4);

const fileSchema = z
  .instanceof(File, { message: "File wajib diupload" })
  .refine(f => f.type === "application/pdf", "File harus PDF")
  .refine(f => f.size <= 2 * 1024 * 1024, "Max 2MB");

const jenisKelaminSchema = z.enum(["l", "p"], {
  error: "Jenis kelamin wajib dipilih",
});
const kewarganegaraanSchema = z.enum(["1", "2", "3"], {
  error: "Kewarganegaraan wajib dipilih",
});
const waktukuliahSchema = z.enum(["pagi", "malam"], {
  error: "Waktu kuliah wajib dipilih",
});
const jenisdaftarSchema = z.enum(["baru", "alihjenjang", "transfer"], {
  error: "Jenis pendaftaran wajib dipilih",
});
const jenjangPendidikanSchema = z.enum(["d3", "d4", "s1", "s2"], {
  error: "Jenjang pendidikan wajib dipilih",
});

/* =========================================================
   SCHEMAS
========================================================= */

// ── STEP 1 S1 ────────────────────────────────────────────
// Audit dari STEP1S1_ORIGINAL_REFERENCES.html
// Required (*): nik, email, nama, jk, kewarganegaraan, tempatlahir,
//   tanggallahir, nohp, nohp2, jenisdaftar, prodipil, waktukuliah, asal_sekolah
// Conditional required (jenisdaftar=baru): konfirmasi
// Conditional required (transfer/alihjenjang): universitas_asal, prodi_asal, ipk, jenjang_pendidikan
// Optional: prodipil2, prodipil3
export const s1Step1Schema = z
  .object({
    nik: nikSchema,
    email: emailSchema,
    nama: namaSchema,
    jk: jenisKelaminSchema,
    kewarganegaraan: kewarganegaraanSchema,
    tempatlahir: stringRequired("Tempat lahir wajib diisi"),
    tanggallahir: tanggalSchema,
    nohp: phoneSchema,
    nohp2: phoneSchema,
    jenisdaftar: jenisdaftarSchema,
    prodipil: stringRequired("Program studi pilihan wajib dipilih"),
    prodipil2: z.string().optional(),
    prodipil3: z.string().optional(),
    waktukuliah: waktukuliahSchema,
    asal_sekolah: stringRequired("Nama asal sekolah wajib diisi"),

    // Conditional fields — validated in superRefine below
    konfirmasi: z.boolean().optional(),
    universitas_asal: z.string().optional(),
    prodi_asal: z.string().optional(),
    ipk: ipkSchema.optional(),
    jenjang_pendidikan: jenjangPendidikanSchema.optional(),
  })
  .superRefine((data, ctx) => {
    // konfirmasi wajib dicentang jika jenisdaftar = "baru"
    if (data.jenisdaftar === "baru") {
      if (!data.konfirmasi) {
        ctx.addIssue({
          path: ["konfirmasi"],
          code: "custom",
          message: "Anda harus menyetujui pernyataan ini",
        });
      }
    }

    // Field transfer/alihjenjang wajib diisi
    if (data.jenisdaftar === "transfer" || data.jenisdaftar === "alihjenjang") {
      if (!data.universitas_asal || data.universitas_asal.trim() === "") {
        ctx.addIssue({
          path: ["universitas_asal"],
          code: "custom",
          message: "Nama universitas asal wajib diisi",
        });
      }
      if (!data.prodi_asal || data.prodi_asal.trim() === "") {
        ctx.addIssue({
          path: ["prodi_asal"],
          code: "custom",
          message: "Program studi asal wajib diisi",
        });
      }
      if (data.ipk === undefined || data.ipk === null) {
        ctx.addIssue({
          path: ["ipk"],
          code: "custom",
          message: "IPK wajib diisi",
        });
      }
      if (!data.jenjang_pendidikan) {
        ctx.addIssue({
          path: ["jenjang_pendidikan"],
          code: "custom",
          message: "Jenjang pendidikan terakhir wajib dipilih",
        });
      }
    }
  });

// ── STEP 2 S1 ────────────────────────────────────────────
// Audit dari STEP2S1_ORIGINAL_REFERENCES.html
// Required: pp, ktp, kk, buktibayar, pemilikrek, bank (*)
// Conditional required (transfer/alihjenjang): transkrip_nilai, ijazah_dok
export const s1Step2Schema = z
  .object({
    pp: fileSchema,
    ktp: fileSchema,
    kk: fileSchema,
    buktibayar: fileSchema,
    transkrip_nilai: z
      .instanceof(File, { message: "Transkrip nilai wajib diupload" })
      .optional(),
    ijazah_dok: z
      .instanceof(File, { message: "Ijazah wajib diupload" })
      .optional(),
    pemilikrek: stringRequired("Pemilik rekening wajib diisi"),
    bank: stringRequired("Bank wajib diisi"),
    jenisdaftar: z.enum(["baru", "transfer", "alihjenjang"]),
  })
  .superRefine((data, ctx) => {
    const isTransfer =
      data.jenisdaftar === "transfer" || data.jenisdaftar === "alihjenjang";

    if (isTransfer) {
      if (!data.transkrip_nilai) {
        ctx.addIssue({
          path: ["transkrip_nilai"],
          code: "custom",
          message: "Transkrip nilai wajib diupload untuk transfer/alih jenjang",
        });
      }
      if (!data.ijazah_dok) {
        ctx.addIssue({
          path: ["ijazah_dok"],
          code: "custom",
          message: "Ijazah wajib diupload untuk transfer/alih jenjang",
        });
      }
    }
  });

// ── STEP 1 S2 ────────────────────────────────────────────
// Audit dari STEP1S2_Admisi___Universitas_Internasional_Batam.html
// Required (*): nik, nama, jk, kewarganegaraan, tempatlahir, tanggallahir,
//   email, nohp, agama, sumber_studi, alamat, kelurahan, kecamatan,
//   jurusan, ipk, gelar
// Optional (no *): nisn, npwp, referensi, keahlian, namadusun, kodepost,
//   nort, norw, universitas, perusahaan_nama, alamat_instansi, jabatan,
//   status_instansi, tahun_perusahaan
// Note: prodipil tidak ada * di HTML S2
export const s2Step1Schema = z.object({
  // ── Required fields ───────────────────────────────────
  nik: nikSchema,
  nama: namaSchema,
  jk: jenisKelaminSchema,
  kewarganegaraan: kewarganegaraanSchema,
  tempatlahir: stringRequired("Tempat lahir wajib diisi"),
  tanggallahir: tanggalSchema,
  email: emailSchema,
  nohp: phoneSchema,
  agama: stringRequired("Agama wajib dipilih"),
  sumber_studi: stringRequired("Sumber biaya studi wajib dipilih"),
  alamat: stringRequired("Alamat wajib diisi"),
  kelurahan: stringRequired("Kelurahan wajib diisi"),
  kecamatan: stringRequired("Kecamatan wajib diisi"),
  jurusan: stringRequired("Jurusan wajib diisi"),
  ipk: ipkSchema,
  gelar: stringRequired("Gelar wajib diisi"),

  // ── Optional fields (no * in HTML) ───────────────────
  nisn: z.string().optional(),
  npwp: z.string().optional(),
  referensi: z.string().optional(),
  keahlian: z.string().optional(),
  namadusun: z.string().optional(),
  kodepost: z.string().optional(),
  nort: z.string().optional(),
  norw: z.string().optional(),
  universitas: z.string().optional(),   // Nama universitas asal (optional di S2)
  prodipil: z.string().optional(),      // Program studi pilihan tidak wajib di S2
  perusahaan_nama: z.string().optional(),
  alamat_instansi: z.string().optional(),
  jabatan: z.string().optional(),
  status_instansi: z.string().optional(),
  tahun_perusahaan: z.string().optional(),
});

// ── STEP PARENT S2 ───────────────────────────────────────
// Audit dari STEPPARENTS2_Admisi___Universitas_Internasional_Batam.html
// Required (*): nama_ayah, notelp_ayah, nama_ibu, notelp_ibu
// Optional: semua field sisanya (nik, tanggallahir, pendidikan, pekerjaan, penghasilan, status, alamat)
// + Wali fields (semua optional — tidak ada * di HTML)
export const s2ParentSchema = z.object({
  // ── Ayah ─────────────────────────────────────────────
  nama_ayah: stringRequired("Nama ayah wajib diisi"),
  notelp_ayah: phoneSchema,
  nik_ayah: z.string().optional(),
  tanggallahir_ayah: z.string().optional(),
  pendidikan_ayah: z.string().optional(),
  pekerjaan_ayah: z.string().optional(),
  penghasilan_ayah: z.string().optional(),
  status_ayah: z.string().optional(),

  // ── Ibu ──────────────────────────────────────────────
  nama_ibu: stringRequired("Nama ibu wajib diisi"),
  notelp_ibu: phoneSchema,
  nik_ibu: z.string().optional(),
  tanggallahir_ibu: z.string().optional(),
  pendidikan_ibu: z.string().optional(),
  pekerjaan_ibu: z.string().optional(),
  penghasilan_ibu: z.string().optional(),
  status_ibu: z.string().optional(),

  // ── Alamat orang tua ──────────────────────────────────
  alamat_ortu: z.string().optional(),

  // ── Wali (semua optional — tidak ada * di HTML) ───────
  nik_wali: z.string().optional(),
  nama_wali: z.string().optional(),
  tanggallahir_wali: z.string().optional(),
  notelp_wali: z.string().optional(),
  pendidikan_wali: z.string().optional(),
  pekerjaan_wali: z.string().optional(),
  penghasilan_wali: z.string().optional(),
  alamat_wali: z.string().optional(),
});

// ── STEP 2 S2 ────────────────────────────────────────────
// Audit dari STEP2S2_Admisi___Universitas_Internasional_Batam.html
// Required: pp, ktp, kk, al, r1, r4, buktibayar, pemilikrek (*)
// Optional: bank (label tidak ada * di HTML S2)
export const s2Step2Schema = z.object({
  pp: fileSchema,
  ktp: fileSchema,
  kk: fileSchema,
  al: fileSchema,         // Akta Lahir (Birth Certificate)
  r1: fileSchema,         // Ijazah (Bachelor Certificate)
  r4: fileSchema,         // Transkrip Nilai Sarjana (Academic Transcript)
  buktibayar: fileSchema,
  pemilikrek: stringRequired("Pemilik rekening wajib diisi"),
  bank: z.string().optional(), // Tidak ada * di HTML S2
});

/* =========================================================
   REQUIRED FIELD MAPS
   Digunakan oleh algoritma asterisk otomatis di UI.
   Key = nama field, value = true jika wajib (non-conditional).
   Conditional fields ditangani terpisah lewat superRefine.
========================================================= */

export const s1Step1RequiredFields: Record<string, boolean> = {
  nik: true,
  email: true,
  nama: true,
  jk: true,
  kewarganegaraan: true,
  tempatlahir: true,
  tanggallahir: true,
  nohp: true,
  nohp2: true,
  jenisdaftar: true,
  prodipil: true,
  waktukuliah: true,
  asal_sekolah: true,
  // Conditional — asterisk dihandle di component berdasarkan jenisdaftar
  konfirmasi: false,        // wajib hanya jika jenisdaftar=baru
  universitas_asal: false,  // wajib hanya jika transfer/alihjenjang
  prodi_asal: false,        // wajib hanya jika transfer/alihjenjang
  ipk: false,               // wajib hanya jika transfer/alihjenjang
  jenjang_pendidikan: false,// wajib hanya jika transfer/alihjenjang
  prodipil2: false,
  prodipil3: false,
};

export const s1Step2RequiredFields: Record<string, boolean> = {
  pp: true,
  ktp: true,
  kk: true,
  buktibayar: true,
  pemilikrek: true,
  bank: true,
  // Conditional
  transkrip_nilai: false, // wajib hanya jika transfer/alihjenjang
  ijazah_dok: false,      // wajib hanya jika transfer/alihjenjang
};

export const s2Step1RequiredFields: Record<string, boolean> = {
  nik: true,
  nama: true,
  jk: true,
  kewarganegaraan: true,
  tempatlahir: true,
  tanggallahir: true,
  email: true,
  nohp: true,
  agama: true,
  sumber_studi: true,
  alamat: true,
  kelurahan: true,
  kecamatan: true,
  jurusan: true,
  ipk: true,
  gelar: true,
  // Optional
  nisn: false,
  npwp: false,
  referensi: false,
  keahlian: false,
  namadusun: false,
  kodepost: false,
  nort: false,
  norw: false,
  universitas: false,
  prodipil: false,
  perusahaan_nama: false,
  alamat_instansi: false,
  jabatan: false,
  status_instansi: false,
  tahun_perusahaan: false,
};

export const s2ParentRequiredFields: Record<string, boolean> = {
  nama_ayah: true,
  notelp_ayah: true,
  nama_ibu: true,
  notelp_ibu: true,
  // Semua lainnya optional
  nik_ayah: false,
  tanggallahir_ayah: false,
  pendidikan_ayah: false,
  pekerjaan_ayah: false,
  penghasilan_ayah: false,
  status_ayah: false,
  nik_ibu: false,
  tanggallahir_ibu: false,
  pendidikan_ibu: false,
  pekerjaan_ibu: false,
  penghasilan_ibu: false,
  status_ibu: false,
  alamat_ortu: false,
  nik_wali: false,
  nama_wali: false,
  tanggallahir_wali: false,
  notelp_wali: false,
  pendidikan_wali: false,
  pekerjaan_wali: false,
  penghasilan_wali: false,
  alamat_wali: false,
};

export const s2Step2RequiredFields: Record<string, boolean> = {
  pp: true,
  ktp: true,
  kk: true,
  al: true,
  r1: true,
  r4: true,
  buktibayar: true,
  pemilikrek: true,
  bank: false, // Tidak ada * di HTML S2
};

/* =========================================================
   TYPES
========================================================= */

export type FormDataS1 =
  z.infer<typeof s1Step1Schema> &
  z.infer<typeof s1Step2Schema>;

export type FormDataS2 =
  z.infer<typeof s2Step1Schema> &
  z.infer<typeof s2ParentSchema> &
  z.infer<typeof s2Step2Schema>;

export type ProgramType = "Program Sarjana" | "Program Diploma";

export type EventType = {
  programType: ProgramType;
  batchName?: string;
};

export type StepResultS1 =
  | { action: "next";   data: Partial<FormDataS1> }
  | { action: "prev" }
  | { action: "submit"; data: Partial<FormDataS1> };

export type StepResultS2 =
  | { action: "next";   data: Partial<FormDataS2> }
  | { action: "prev" }
  | { action: "submit"; data: Partial<FormDataS2> };

export type StepKey =
  | "Step1S1"
  | "Step2S1"
  | "StepDoneS1"
  | "Step1S2"
  | "Step2S2"
  | "StepParentS2"
  | "StepDoneS2";

export type StepItem = {
  key: StepKey;
  label: string;
  sub: string;
};

export type StepPropsS1 = {
  data: Partial<FormDataS1>;
  onResult: (result: StepResultS1) => void;
  goToStep: (n: number) => void;
  currentStep: number;
  totalStep: number;
  flow: StepItem[];
  isSubmitting: boolean;
};

export type StepPropsS2 = {
  data: Partial<FormDataS2>;
  onResult: (result: StepResultS2) => void;
  goToStep: (n: number) => void;
  currentStep: number;
  totalStep: number;
  flow: StepItem[];
  isSubmitting: boolean;
};

export type UploadField =
  | "pp"
  | "ktp"
  | "kk"
  | "buktibayar"
  | "transkrip_nilai"
  | "ijazah_dok";

export type S2UploadField =
  | "pp"
  | "ktp"
  | "kk"
  | "buktibayar"
  | "al"
  | "r1"
  | "r4";

export type StatusState = {
  completeness: string;
  checkStatus: string;
  checkNotes: string;
  paymentStatus: string;
  paymentNotes: string;
};

export type Step2DocConfig = {
  name: UploadField;
  label: string;
  section: "personal" | "study" | "payment";
  required?: boolean;
};

export type S2Step2DocConfig = {
  name: S2UploadField;
  label: string;
  section: "personal" | "study" | "payment";
  required?: boolean;
};

export type School = string;