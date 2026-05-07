/**
 * RegistrationStatusSection
 *
 * DISPLAY ONLY — bukan input user, bukan bagian dari validasi form.
 * Data idealnya berasal dari API (GET /api/registration-status?key=...).
 * Komponen ini tidak menyentuh react-hook-form, tidak ada register(),
 * tidak ada Zod schema, dan tidak ikut kirim ke API saat submit.
 *
 * Gunakan di StepDoneS1 dan StepDoneS2 — setelah section prodiCard / summary,
 * sebelum tabel dokumen (yang sudah dipindah ke Step2).
 */

/* =========================================================
   TYPES
========================================================= */

export type StatusDisplayItem = {
  /** Label yang ditampilkan ke user, misal "Status Dokumen (Document Status)" */
  label: string;
  /** Nilai aktual dari API / state parent */
  value: string;
  /** Fallback jika value kosong ("", null, undefined) */
  fallback?: string;
};

type Props = {
  /** Judul section, default "Status Dokumen (Document Status)" */
  title?: string;
  /** Array item status yang ditampilkan */
  items: StatusDisplayItem[];
};

/* =========================================================
   STATUS COLOR HELPER
========================================================= */

function getStatusClass(value: string): string {
  const v = value.toLowerCase();
  if (v.includes("rejected") || v.includes("ditolak") || v.includes("tidak lengkap")) {
    return "statusRejected";
  }
  if (v.includes("approved") || v.includes("disetujui") || v.includes("lengkap")) {
    return "statusApproved";
  }
  return "statusPending";
}

/* =========================================================
   COMPONENT
========================================================= */

export default function RegistrationStatusSection({
  title = "Status Dokumen (Document Status)",
  items,
}: Props) {
  return (
    <div className="statusSection">
      <h3 className="sectionHeading">{title}</h3>

      <div className="infoBox">
        {items.map((item, index) => {
          const displayValue =
            item.value && item.value.trim() !== ""
              ? item.value
              : (item.fallback ?? "-");

          return (
            <div key={index} className="statusItem">
              <strong>{item.label} :</strong>
              <span className={`statusValue ${getStatusClass(displayValue)}`}>
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   HELPERS — S1 & S2 item builders
   Gunakan ini di StepDoneS1 / StepDoneS2 untuk membuat array items
   dari data status yang sudah di-fetch dari API.
========================================================= */

export type S1StatusData = {
  completeness: string;   // "Masih ada dokumen yang tidak lengkap" | "Lengkap"
  checkStatus: string;    // "Masih dalam pemeriksaan" | "Approved" | "Rejected"
  checkNotes: string;     // catatan dari admin, bisa kosong
  paymentStatus: string;  // "Masih dalam pemeriksaan" | "Sudah Dibayar" | dst
  paymentNotes: string;   // catatan keuangan, bisa kosong
};

export type S2StatusData = {
  documentStatus: string; // "Masih dalam pemeriksaan" | "Approved" | "Rejected"
  documentNotes: string;  // catatan pemeriksaan, bisa kosong
  paymentStatus: string;  // "Masih dalam pemeriksaan" | "Sudah Dibayar" | dst
  paymentNotes: string;   // catatan keuangan, bisa kosong
};

/** Bangun items untuk StepDoneS1 dari data API */
export function buildS1StatusItems(data: S1StatusData): StatusDisplayItem[] {
  return [
    {
      label: "Kelengkapan Dokumen (Completion of Requirement)",
      value: data.completeness,
      fallback: "Masih ada dokumen yang tidak lengkap",
    },
    {
      label: "Status Pemeriksaan Dokumen (Document Check Status)",
      value: data.checkStatus,
      fallback: "Masih dalam pemeriksaan (Under Assessment)",
    },
    {
      label: "Catatan Pemeriksaan Dokumen (Document Inspection Notes)",
      value: data.checkNotes,
      fallback: "-",
    },
    {
      label: "Status Pemeriksaan Pembayaran (Payment Check Status)",
      value: data.paymentStatus,
      fallback: "Masih dalam pemeriksaan (Under Assessment)",
    },
    {
      label: "Catatan Pemeriksaan Keuangan (Payment Notes)",
      value: data.paymentNotes,
      fallback: "-",
    },
  ];
}

/** Bangun items untuk StepDoneS2 dari data API */
export function buildS2StatusItems(data: S2StatusData): StatusDisplayItem[] {
  return [
    {
      label: "Status Dokumen (Document Status)",
      value: data.documentStatus,
      fallback: "Masih dalam pemeriksaan (Under Assessment)",
    },
    {
      label: "Catatan Pemeriksaan Dokumen (Document Assessment Notes)",
      value: data.documentNotes,
      fallback: "-",
    },
    {
      label: "Status Pembayaran (Payment Status)",
      value: data.paymentStatus,
      fallback: "Masih dalam pemeriksaan (Under Assessment)",
    },
    {
      label: "Catatan Pemeriksaan Keuangan (Payment Notes)",
      value: data.paymentNotes,
      fallback: "-",
    },
  ];
}

/** Default status S1 — tampilkan saat data API belum tersedia */
export const DEFAULT_S1_STATUS: S1StatusData = {
  completeness: "Masih ada dokumen yang tidak lengkap",
  checkStatus: "Masih dalam pemeriksaan",
  checkNotes: "",
  paymentStatus: "Masih dalam pemeriksaan",
  paymentNotes: "",
};

/** Default status S2 — tampilkan saat data API belum tersedia */
export const DEFAULT_S2_STATUS: S2StatusData = {
  documentStatus: "Masih dalam pemeriksaan",
  documentNotes: "",
  paymentStatus: "Masih dalam pemeriksaan",
  paymentNotes: "",
};