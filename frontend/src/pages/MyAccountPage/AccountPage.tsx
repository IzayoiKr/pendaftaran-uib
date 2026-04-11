import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api";
import useAuthStore from "../../store/useAuthStore";
import type { User } from "../../types";
import { toast } from "sonner"; 
import "./AccountPage.scss";

type BiodataStatus = "Belum Lengkap" | "Telah Lengkap";
type PaymentStatus = "Belum Lunas"   | "Telah Lunas";

interface Registration {
    nomorDaftar: string;
    periode:     number;
    gelombang:   string;
    jurusan:     string;
    biodata:     BiodataStatus;
    pembayaran:  PaymentStatus;
    usm:         string;
    passwordUSM: string;
}

interface RegistrationHandlers {
    onCheckPendaftaran:    (reg: Registration) => void;
    onUbahBiodata:         (reg: Registration) => void;
    onDownloadSuratHasil:  (reg: Registration) => void;
    onBuktiTransfer:       (reg: Registration) => void;
    onPerubahanProdi:      (reg: Registration) => void;
    onDownloadPengunduran: (reg: Registration) => void;
    onPrasyaratOspek:      (reg: Registration) => void;
}

function AccountInfo({ user }: { user: User }) {
    return (
        <div className="account-info">
            {([
                ["Nama Lengkap", user.full_name || "-"],
                ["Alamat Email", user.email || "-"],
                ["Nomor NIK",    user.nik || "-"],
            ] as [string, string][]).map(([label, value]) => (
                <div key={label} className="info-row">
                    <span className="info-label">{label}</span>
                    <span className="info-value">: {value}</span>
                </div>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: BiodataStatus | PaymentStatus }) {
    const cls =
        status === "Telah Lengkap" ? "status-complete"   :
        status === "Belum Lengkap" ? "status-incomplete"  :
        status === "Telah Lunas"   ? "status-paid"        :
        "status-unpaid";
    return <span className={cls}>{status || "-"}</span>;
}

function RegistrationActions({ reg, handlers }: { reg: Registration; handlers: RegistrationHandlers; }) {
    const isComplete = reg.biodata === "Telah Lengkap" && reg.pembayaran === "Telah Lunas";
    return (
        <div className="action-group">
            <button className="btn btn-warning" onClick={() => handlers.onCheckPendaftaran(reg)}>Check Pendaftaran</button>
            <button className="btn btn-primary" onClick={() => handlers.onUbahBiodata(reg)}>Ubah Biodata</button>
            {isComplete && (
                <>
                    <button className="btn btn-success" onClick={() => handlers.onDownloadSuratHasil(reg)}>Surat Hasil</button>
                    <button className="btn btn-info" onClick={() => handlers.onBuktiTransfer(reg)}>Bukti Transfer</button>
                    <button className="btn btn-primary" onClick={() => handlers.onPerubahanProdi(reg)}>Perubahan Prodi</button>
                    <button className="btn btn-danger" onClick={() => handlers.onDownloadPengunduran(reg)}>Pengunduran Diri</button>
                    <button className="btn btn-warning" onClick={() => handlers.onPrasyaratOspek(reg)}>Prasyarat Ospek</button>
                </>
            )}
        </div>
    );
}

const TABLE_HEADERS = ["Nomor Daftar", "Periode", "Gelombang", "Jurusan", "Biodata", "Pembayaran", "USM", "Password USM", "Aksi"];

function RegistrationTable({ registrations, handlers }: { registrations: Registration[]; handlers: RegistrationHandlers; }) {
    return (
        <div className="table-wrapper">
            <table>
                <thead><tr>{TABLE_HEADERS.map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                    {registrations.map(reg => (
                        <tr key={reg.nomorDaftar}>
                            <td>{reg.nomorDaftar || "-"}</td>
                            <td>{reg.periode || "-"}</td>
                            <td>{reg.gelombang || "-"}</td>
                            <td>{reg.jurusan || "-"}</td>
                            <td><StatusBadge status={reg.biodata} /></td>
                            <td><StatusBadge status={reg.pembayaran} /></td>
                            <td>{reg.usm || "-"}</td>
                            <td>{reg.passwordUSM || "-"}</td>
                            <td><RegistrationActions reg={reg} handlers={handlers} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function AccountPage() {
    const navigate = useNavigate();
    
    // Langsung destructure user dan logout dari Zustand Store
    const { user, logout } = useAuthStore();
    const [registrations, setRegistrations] = useState<Registration[]>([]);

    useEffect(() => {
        if (!user) {
            navigate("/login");
        } else {
            const savedRegs = localStorage.getItem(`registrations_${user.id}`);
            if (savedRegs) {
                setRegistrations(JSON.parse(savedRegs));
            }
        }
    }, [navigate, user]);

    const handleLogout = async () => {
        try {
            await api.auth.logout(); // Panggil API backend untuk mematikan token di server
        } catch {
            // Abaikan jika token di server sudah mati duluan
        }
        logout(); // Hapus user dari state lokal (Zustand)
        toast.success("Logout Berhasil!"); 
        navigate("/login");
    };

    const downloadPdf = (filename: string) => {
        const link = document.createElement("a");
        link.href = `/files/${filename}`;
        link.download = filename;
        link.click();
    };

    const handlers: RegistrationHandlers = {
        onCheckPendaftaran:    ()    => navigate("/"),
        onUbahBiodata:         (reg) => navigate("MASIH KOSONG TUNGGU ALDO", { state: { nomorDaftar: reg.nomorDaftar } }),
        onDownloadSuratHasil:  (reg) => downloadPdf(`surat-hasil-${reg.nomorDaftar}.pdf`),
        onBuktiTransfer:       (reg) => navigate("/transferproof",  { state: { nomorDaftar: reg.nomorDaftar } }),
        onPerubahanProdi:      (reg) => navigate("/changeprodi", { state: { nomorDaftar: reg.nomorDaftar } }),
        onDownloadPengunduran: (reg) => downloadPdf(`pengunduran-diri-${reg.nomorDaftar}.pdf`),
        onPrasyaratOspek:      (reg) => navigate("/prasyaratospek", { state: { nomorDaftar: reg.nomorDaftar } }),
    };

    if (!user) return null; 

    return (
        <div className="page-content">
            <div className="account-box">
                <h2 className="account-title">Akun Saya</h2>
                <AccountInfo user={user} /> 

                <h3 className="section-title">Pendaftaran</h3>
                
                {registrations.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem", background: "#f8f9fa", borderRadius: "10px", border: "1px dashed #ccc", marginBottom: "2rem" }}>
                        <p style={{ color: "#6c757d", fontSize: "1.1rem", marginBottom: "1.5rem" }}>Anda belum melakukan pendaftaran program studi apapun.</p>
                        <button className="btn btn-primary btn-lg" onClick={() => navigate("/#gelombang")}>
                            Daftar Gelombang Sekarang
                        </button>
                    </div>
                ) : (
                    <RegistrationTable registrations={registrations} handlers={handlers} />
                )}

                <div className="bottom-actions">
                    <button className="btn btn-warning btn-lg" onClick={() => navigate("/passwordchange")}>UBAH PASSWORD</button>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate("/profilechange")}>UBAH PROFILE</button>
                    <button className="btn btn-danger btn-lg" onClick={handleLogout}>⏻ LOGOUT</button>
                </div>
            </div>
        </div>
    );
}
