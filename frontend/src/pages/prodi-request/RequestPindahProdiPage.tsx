'use client';

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import styles from "./RequestPindahProdiPage.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BiodataPendaftaran {
    nomorDaftar: string;
    periode:     string;
    gelombang:   string;
    jurusan:     string;
    namaLengkap: string;
    alamatEmail: string;
    nomorNIK:    string;
}

interface RequestPindahForm {
    prodiTujuan:           string;
    waktuKuliahSebelumnya: string;
    waktuKuliahBaru:       string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODI_OPTIONS = [
    "Akuntansi (Accounting)",
    "Arsitektur (Architecture)",
    "Biologi (Biology)",
    "Gizi (Nutrition)",
    "Ilmu Hukum (Law Science)",
    "Kedokteran (Medicine)",
    "Manajemen (Management)",
    "Pariwisata (Tourism)",
    "Pendidikan Bahasa Inggris (English Language Education)",
    "Profesi Kedokteran (Medicine)",
    "Sistem Informasi (Information System)",
    "Teknik Sipil (Civil Engineering)",
    "Teknologi Informasi (Information Technology)",
] as const;

const WAKTU_KULIAH_OPTIONS = [
    { value: "pagi",  label: "Pagi (Morning Class)" },
    { value: "malam", label: "Malam (Night Class)"  },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string][] = [
        ["Nomor Daftar", data.nomorDaftar],
        ["Periode",      data.periode],
        ["Gelombang",    data.gelombang],
        ["Jurusan",      data.jurusan],
        ["Nama Lengkap", data.namaLengkap],
        ["Alamat Email", data.alamatEmail],
        ["Nomor NIK",    data.nomorNIK],
    ];

    return (
        <div className={styles.biodataInfo}>
            {rows.map(([label, value]) => (
                <div key={label} className={styles.infoRow}>
                    <span className={styles.infoLabel}>{label}</span>
                    <span className={styles.infoValue}>: {value}</span>
                </div>
            ))}
        </div>
    );
}

function ReadonlySelect({ label, value }: { label: string; value: string }) {
    return (
        <div className={styles.formField}>
            <label className={styles.fieldLabel}>{label}</label>
            <select disabled tabIndex={-1} aria-readonly="true" defaultValue={value}>
                <option>{value}</option>
            </select>
        </div>
    );
}

function EditableSelect({ id, label, value, required, onChange, children }: {
    id:        string;
    label:     string;
    value:     string;
    required?: boolean;
    onChange:  (e: ChangeEvent<HTMLSelectElement>) => void;
    children:  React.ReactNode;
}) {
    return (
        <div className={styles.formField}>
            <label htmlFor={id} className={styles.fieldLabel}>
                {label}
                {required && <span className={styles.requiredStar} aria-hidden="true"> *</span>}
            </label>
            <select id={id} value={value} onChange={onChange} required={required}>
                {children}
            </select>
        </div>
    );
}

function ActionRow({ isLoading, onCancel }: { isLoading: boolean; onCancel: () => void }) {
    return (
        <div className={styles.bottomActions}>
            <button type="button" className={styles.btnDanger} onClick={onCancel} disabled={isLoading}>
                Batal
            </button>
            <button type="submit" className={styles.btn} disabled={isLoading} aria-busy={isLoading}>
                {isLoading
                    ? <><div className={styles.spinner} aria-hidden="true" /> Simpan</>
                    : "Simpan"
                }
            </button>
        </div>
    );
}

// ─── Mock data — ganti dengan data dari backend / props / context ─────────────

const MOCK_BIODATA: BiodataPendaftaran = {
    nomorDaftar: "-",
    periode:     "-",
    gelombang:   "-",
    jurusan:     "-",
    namaLengkap: "-",
    alamatEmail: "-",
    nomorNIK:    "-",
};

const WAKTU_KULIAH_SEBELUMNYA = "Malam (Night Class)";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RequestPindahProdiPage() {
    const router = useRouter();
    const [form, setForm] = useState<RequestPindahForm>({
        prodiTujuan:           "",
        waktuKuliahSebelumnya: WAKTU_KULIAH_SEBELUMNYA,
        waktuKuliahBaru:       "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSelectChange =
        (field: keyof RequestPindahForm) =>
        (e: ChangeEvent<HTMLSelectElement>) =>
            setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.prodi.requestPindah(form); // TODO: pastikan endpoint ini ada
            toast.success("Request perpindahan prodi berhasil dikirim!");
            router.back();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Biodata Pendaftaran</h2>
                <BiodataSection data={MOCK_BIODATA} />

                <h3 className={styles.formTitle}>Form Request Pindah Program Studi</h3>

                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.formGrid}>
                        <ReadonlySelect
                            label="Program Studi Sebelumnya (Previous Major)"
                            value={`${MOCK_BIODATA.jurusan} (Information Technology)`}
                        />
                        <EditableSelect
                            id="prodiTujuan"
                            label="Program Studi Baru (New Major)"
                            value={form.prodiTujuan}
                            required
                            onChange={handleSelectChange("prodiTujuan")}
                        >
                            <option value="" disabled>Program Studi Pilihan (Selected Study Program) *</option>
                            {PRODI_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </EditableSelect>

                        <ReadonlySelect
                            label="Waktu Kuliah Sebelumnya (Previous Shift)"
                            value={WAKTU_KULIAH_SEBELUMNYA}
                        />
                        <EditableSelect
                            id="waktuKuliahBaru"
                            label="Waktu Kuliah Baru (New Shift)"
                            value={form.waktuKuliahBaru}
                            required
                            onChange={handleSelectChange("waktuKuliahBaru")}
                        >
                            <option value="" disabled>Pilih Waktu Kuliah *</option>
                            {WAKTU_KULIAH_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </EditableSelect>
                    </div>

                    <ActionRow isLoading={isLoading} onCancel={() => router.back()} />
                </form>
            </div>
        </main>
    );
}
