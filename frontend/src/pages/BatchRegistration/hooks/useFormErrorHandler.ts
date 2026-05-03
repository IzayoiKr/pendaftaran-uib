// hooks/useFormErrorHandler.ts
import { type FieldErrors, type FieldValues, type UseFormSetFocus } from "react-hook-form";
import { toast } from "sonner";

/**
 * Konfigurasi per-step: mapping field key → label yang tampil di toast.
 * Extend ini sesuai kebutuhan step lain (Step2S1, Step1S2, dst.)
 */
export const FIELD_LABELS = {
  // ── Step 1 S1 ─────────────────────────────────────────────
  nik: "NIK",
  email: "Email",
  nama: "Nama Lengkap",
  nohp: "No. HP",
  nohp2: "No. WA",
  tanggallahir: "Tanggal Lahir",
  tempatlahir: "Tempat Lahir",
  jk: "Jenis Kelamin",
  kewarganegaraan: "Kewarganegaraan",
  jenisdaftar: "Jenis Pendaftaran",
  prodipil: "Program Studi Pilihan",
  waktukuliah: "Waktu Kuliah",
  asal_sekolah: "Asal Sekolah",
  konfirmasi: "Pernyataan Persetujuan",
  universitas_asal: "Universitas Asal",
  prodi_asal: "Asal Program Studi",
  ipk: "IPK",
  jenjang_pendidikan: "Jenjang Pendidikan",

  // ── Step 2 S1 (dokumen) ───────────────────────────────────
  pp: "Pas Foto",
  ktp: "KTP",
  kk: "Kartu Keluarga",
  buktibayar: "Bukti Bayar",
  transkrip_nilai: "Transkrip Nilai",
  ijazah_dok: "Ijazah",
  pemilikrek: "Pemilik Rekening",
  bank: "Bank",

  // ── Step 1 S2 ─────────────────────────────────────────────
  agama: "Agama",
  sumber_studi: "Sumber Biaya Studi",
  alamat: "Alamat",
  kelurahan: "Kelurahan",
  kecamatan: "Kecamatan",
  jurusan: "Jurusan",
  gelar: "Gelar",

  // ── Step Parent S2 ────────────────────────────────────────
  nama_ayah: "Nama Ayah",
  notelp_ayah: "No. Telp Ayah",
  nama_ibu: "Nama Ibu",
  notelp_ibu: "No. Telp Ibu",

  // ── Step 2 S2 (dokumen) ───────────────────────────────────
  al: "Akta Lahir",
  r1: "Ijazah Sarjana",
  r4: "Transkrip Nilai Sarjana",
} as const;

/**
 * Mengambil label tampilan dari field key.
 * Jika tidak dikenali, kembalikan key itu sendiri sebagai fallback.
 */
function getLabel(key: string): string {
  return (FIELD_LABELS as Record<string, string>)[key] ?? key;
}

/**
 * Flatten nested error keys (untuk field bertingkat seperti `address.city`)
 * menjadi array string flat.
 */
function flattenErrorKeys(errors: FieldErrors): string[] {
  const keys: string[] = [];

  function traverse(obj: FieldErrors, prefix = "") {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const val = obj[key];

      if (val && typeof val === "object" && "message" in val) {
        // Ini adalah FieldError leaf
        keys.push(fullKey);
      } else if (val && typeof val === "object") {
        // Nested errors (array atau object)
        traverse(val as FieldErrors, fullKey);
      }
    }
  }

  traverse(errors);
  return keys;
}

type UseFormErrorHandlerOptions<T extends FieldValues> = {
  /** react-hook-form setFocus dari useForm() */
  setFocus: UseFormSetFocus<T>;
  /**
   * Jumlah field error maksimum yang ditampilkan di toast.
   * Default: 5 (sisanya diringkas "dan N lainnya")
   */
  maxShown?: number;
};

/**
 * Hook reusable untuk menangani error onSubmit dari react-hook-form.
 *
 * Fitur:
 * - Toast dengan daftar label field yang kosong/salah
 * - Auto scroll + fokus ke field error pertama
 * - Fallback ke query [name] jika setFocus gagal (berguna untuk select/custom input)
 *
 * @example
 * const { onError } = useFormErrorHandler({ setFocus: methods.setFocus });
 * <form onSubmit={methods.handleSubmit(onValid, onError)}>
 */
export function useFormErrorHandler<T extends FieldValues>({
  setFocus,
  maxShown = 5,
}: UseFormErrorHandlerOptions<T>) {
  const onError = (errors: FieldErrors<T>) => {
    // 1. Kumpulkan semua error keys (flat)
    const errorKeys = flattenErrorKeys(errors as FieldErrors);

    if (errorKeys.length === 0) return;

    // 2. Bangun pesan toast
    const shown = errorKeys.slice(0, maxShown).map(getLabel);
    const remaining = errorKeys.length - shown.length;

    const labelList = shown.join(", ");
    const suffix = remaining > 0 ? `, dan ${remaining} field lainnya` : "";

    toast.error(`Field belum lengkap: ${labelList}${suffix}`, {
      duration: 5000,
    });

    // 3. Scroll + fokus ke field error pertama
    const firstKey = errorKeys[0] as string;

    // Coba setFocus dulu (bekerja untuk <input> yang terdaftar di RHF)
    try {
      setFocus(firstKey as Parameters<typeof setFocus>[0]);
    } catch {
      // Abaikan jika setFocus gagal (field custom / tidak terdaftar)
    }

    // Scroll tetap dilakukan via DOM query sebagai fallback & untuk elemen custom
    // Coba beberapa selector: [name="..."], #id, atau data attribute
    const selectors = [
      `[name="${firstKey}"]`,
      `#${firstKey}`,
      `[data-field="${firstKey}"]`,
    ];

    let targetEl: Element | null = null;
    for (const sel of selectors) {
      targetEl = document.querySelector(sel);
      if (targetEl) break;
    }

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return { onError };
}
