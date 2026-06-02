"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/api";
import styles from "./ChangeProdi.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BiodataPendaftaran {
    periode: string;
    gelombang: string;
    jurusan: string;
    namaLengkap: string;
    alamatEmail: string;
    nomorNIK: string;
}

interface RequestPindahForm {
    prodiTujuan: string;
    waktuKuliahSebelumnya: string;
    waktuKuliahBaru: string;
}

interface ProgramStudiOption {
    id: string;
    title: string;
    degree: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WAKTU_KULIAH_OPTIONS = [
    { value: "pagi", label: "Pagi (Morning Class)" },
    { value: "malam", label: "Malam (Night Class)" },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string][] = [
        ["Periode", data.periode],
        ["Gelombang", data.gelombang],
        ["Jurusan", data.jurusan],
        ["Nama Lengkap", data.namaLengkap],
        ["Alamat Email", data.alamatEmail],
        ["Nomor NIK", data.nomorNIK],
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
            <select
                disabled
                tabIndex={-1}
                aria-readonly="true"
                value={value}
            >
                <option value={value}>{value}</option>
            </select>
        </div>
    );
}

function EditableSelect({
    id,
    label,
    value,
    required,
    onChange,
    children,
}: {
    id: string;
    label: string;
    value: string;
    required?: boolean;
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
}) {
    return (
        <div className={styles.formField}>
            <label htmlFor={id} className={styles.fieldLabel}>
                {label}
                {required && (
                    <span className={styles.requiredStar} aria-hidden="true">
                        {" "}
                        *
                    </span>
                )}
            </label>
            <select
                id={id}
                value={value}
                onChange={onChange}
                required={required}
            >
                {children}
            </select>
        </div>
    );
}

function ActionRow({
    isLoading,
    onCancel,
}: {
    isLoading: boolean;
    onCancel: () => void;
}) {
    return (
        <div className={styles.bottomActions}>
            <button
                type="button"
                className={styles.btnDanger}
                onClick={onCancel}
                disabled={isLoading}
            >
                Batal
            </button>
            <button
                type="submit"
                className={styles.btn}
                disabled={isLoading}
                aria-busy={isLoading}
            >
                {isLoading ? (
                    <>
                        <div className={styles.spinner} aria-hidden="true" />{" "}
                        Simpan
                    </>
                ) : (
                    "Simpan"
                )}
            </button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChangeProdi() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const regID = searchParams.get("regID");

    const [biodata, setBiodata] = useState<BiodataPendaftaran>({
        periode: "-",
        gelombang: "-",
        jurusan: "-",
        namaLengkap: "-",
        alamatEmail: "-",
        nomorNIK: "-",
    });

    const [form, setForm] = useState<RequestPindahForm>({
        prodiTujuan: "",
        waktuKuliahSebelumnya: "-",
        waktuKuliahBaru: "",
    });

    const [prodiOptions, setProdiOptions] = useState<ProgramStudiOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        if (!regID) return;

        const fetchData = async () => {
            setIsFetching(true);
            try {
                const res = await api.profile.getRegistration(regID);
                let degree = null;
                if (res) {
                    const { registration, user, current_prodi, current_session } = res;
                    degree = registration.degree;
                    setBiodata({
                        periode: registration.academic_year || "-",
                        gelombang: registration.batch_name || "-",
                        jurusan: current_prodi || "-",
                        namaLengkap: user.full_name || "-",
                        alamatEmail: user.email || "-",
                        nomorNIK: user.nik || "-",
                    });
                    setForm((prev) => ({
                        ...prev,
                        waktuKuliahSebelumnya: current_session || "-",
                    }));
                }

                const prodis = await api.programStudi.getAll();
                if (Array.isArray(prodis)) {
                    setProdiOptions(
                        prodis
                            .filter((p) => !degree || p.degree === degree)
                            .map((p) => ({
                                id: p.id,
                                title: p.title,
                                degree: p.degree,
                            })),
                    );
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
                toast.error("Gagal mengambil data.");
            } finally {
                setIsFetching(false);
            }
        };

        fetchData();
    }, [regID]);

    const handleSelectChange =
        (field: keyof RequestPindahForm) =>
        (e: ChangeEvent<HTMLSelectElement>) =>
            setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!regID) return;

        setIsLoading(true);
        try {
            await api.prodiChange.create({
                registration_id: regID,
                new_program_studi_id: form.prodiTujuan,
                new_class_session: form.waktuKuliahBaru,
            });
            toast.success("Request perpindahan prodi berhasil dikirim!");
            router.back();
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Terjadi kesalahan",
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <p>Loading...</p>;

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Biodata Pendaftaran</h2>
                <BiodataSection data={biodata} />

                <h3 className={styles.formTitle}>
                    Form Request Pindah Program Studi
                </h3>

                <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.formGrid}>
                        <ReadonlySelect
                            label="Program Studi Sebelumnya (Previous Major)"
                            value={biodata.jurusan}
                        />
                        <EditableSelect
                            id="prodiTujuan"
                            label="Program Studi Baru (New Major)"
                            value={form.prodiTujuan}
                            required
                            onChange={handleSelectChange("prodiTujuan")}
                        >
                            <option value="" disabled>
                                Program Studi Pilihan (Selected Study Program) *
                            </option>
                            {prodiOptions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </EditableSelect>

                        <ReadonlySelect
                            label="Waktu Kuliah Sebelumnya (Previous Shift)"
                            value={form.waktuKuliahSebelumnya}
                        />
                        <EditableSelect
                            id="waktuKuliahBaru"
                            label="Waktu Kuliah Baru (New Shift)"
                            value={form.waktuKuliahBaru}
                            required
                            onChange={handleSelectChange("waktuKuliahBaru")}
                        >
                            <option value="" disabled>
                                Pilih Waktu Kuliah *
                            </option>
                            {WAKTU_KULIAH_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </EditableSelect>
                    </div>

                    <ActionRow
                        isLoading={isLoading}
                        onCancel={() => router.back()}
                    />
                </form>
            </div>
        </main>
    );
}
