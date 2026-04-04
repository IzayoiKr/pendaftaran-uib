import { useNavigate } from "react-router-dom";
import "./AccountPage.scss";

// ── Types ──────────────────────────────────────────────────────────────────────
interface UserInfo {
    fullName: string;
    email:    string;
    nik:      string;
}

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

// ── Sub-components ─────────────────────────────────────────────────────────────

function AccountInfo({ user }: { user: UserInfo }) {
    return (
        <div className="account-info">
            {([
                ["Nama Lengkap", user.fullName],
                ["Alamat Email", user.email],
                ["Nomor NIK",    user.nik],
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
    return <span className={cls}>{status}</span>;
}

// Buttons tampil kondisional sesuai referensi:
// Row belum lengkap/lunas → hanya Check Pendaftaran + Ubah Biodata
// Row sudah lengkap & lunas → semua button muncul
function RegistrationActions({ reg, handlers }: {
    reg:      Registration;
    handlers: RegistrationHandlers;
}) {
    const isComplete = reg.biodata === "Telah Lengkap" && reg.pembayaran === "Telah Lunas";

    return (
        <div className="action-group">
            <button className="btn btn-warning"
                onClick={() => handlers.onCheckPendaftaran(reg)}>
                Check Pendaftaran
            </button>
            <button className="btn btn-primary"
                onClick={() => handlers.onUbahBiodata(reg)}>
                Ubah Biodata
            </button>

            {isComplete && (
                <>
                    <button className="btn btn-success"
                        onClick={() => handlers.onDownloadSuratHasil(reg)}>
                        Surat Hasil
                    </button>
                    <button className="btn btn-info"
                        onClick={() => handlers.onBuktiTransfer(reg)}>
                        Bukti Transfer
                    </button>
                    <button className="btn btn-primary"
                        onClick={() => handlers.onPerubahanProdi(reg)}>
                        Perubahan Prodi
                    </button>
                    <button className="btn btn-danger"
                        onClick={() => handlers.onDownloadPengunduran(reg)}>
                        Pengunduran Diri
                    </button>
                    <button className="btn btn-warning"
                        onClick={() => handlers.onPrasyaratOspek(reg)}>
                        Prasyarat Ospek
                    </button>
                </>
            )}
        </div>
    );
}

const TABLE_HEADERS = [
    "Nomor Daftar", "Periode", "Gelombang", "Jurusan",
    "Biodata", "Pembayaran", "USM", "Password USM", "Aksi",
];

function RegistrationTable({ registrations, handlers }: {
    registrations: Registration[];
    handlers:      RegistrationHandlers;
}) {
    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>{TABLE_HEADERS.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {registrations.map(reg => (
                        <tr key={reg.nomorDaftar}>
                            <td>{reg.nomorDaftar}</td>
                            <td>{reg.periode}</td>
                            <td>{reg.gelombang}</td>
                            <td>{reg.jurusan}</td>
                            <td><StatusBadge status={reg.biodata} /></td>
                            <td><StatusBadge status={reg.pembayaran} /></td>
                            <td>{reg.usm}</td>
                            <td>{reg.passwordUSM}</td>
                            <td><RegistrationActions reg={reg} handlers={handlers} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ── Dummy data sesuai referensi gambar ────────────────────────────────────────
// TODO: ganti dengan data dari API/auth context
const DUMMY_USER: UserInfo = {
    fullName: "Karenina",
    email:    "izayoikareninalover@gmail.com",
    nik:      "02032007",
};

const DUMMY_REGISTRATIONS: Registration[] = [
    {
        nomorDaftar: "BM2510078",
        periode:     2025,
        gelombang:   "Gelombang 01",
        jurusan:     "Sistem Informasi - Malam",
        biodata:     "Belum Lengkap",
        pembayaran:  "Belum Lunas",
        usm:         "KAMPUS UIB, 08 Oct 2024 (09:00 - 18:00)",
        passwordUSM: "",
    },
    {
        nomorDaftar: "OL2520068",
        periode:     2025,
        gelombang:   "Beasiswa II",
        jurusan:     "Teknologi Informasi - Malam",
        biodata:     "Telah Lengkap",
        pembayaran:  "Telah Lunas",
        usm:         "Online, 03 Nov 2024 (09:00 - 16:00)",
        passwordUSM: "V8IECG",
    },
];

// ── Parent — semua navigate di sini ───────────────────────────────────────────
export default function AccountPage() {
    const navigate = useNavigate();

    const downloadPdf = (filename: string) => {
        const link = document.createElement("a");
        link.href = `/files/${filename}`;
        link.download = filename;
        link.click();
    };

    const handlers: RegistrationHandlers = {
        onCheckPendaftaran:    ()    => navigate("/"),
        onUbahBiodata:         (reg) => navigate("/biodata",         { state: { nomorDaftar: reg.nomorDaftar } }),
        onDownloadSuratHasil:  (reg) => downloadPdf(`surat-hasil-${reg.nomorDaftar}.pdf`),
        onBuktiTransfer:       (reg) => navigate("/transferproof",  { state: { nomorDaftar: reg.nomorDaftar } }),
        onPerubahanProdi:      (reg) => navigate("/perubahan-prodi", { state: { nomorDaftar: reg.nomorDaftar } }),
        onDownloadPengunduran: (reg) => downloadPdf(`pengunduran-diri-${reg.nomorDaftar}.pdf`),
        onPrasyaratOspek:      (reg) => navigate("/prasyaratospek", { state: { nomorDaftar: reg.nomorDaftar } }),
    };

    return (
        <div className="page-content">
            <div className="account-box">
                <h2 className="account-title">Akun Saya</h2>
                <AccountInfo user={DUMMY_USER} />

                <h3 className="section-title">Pendaftaran</h3>
                <RegistrationTable registrations={DUMMY_REGISTRATIONS} handlers={handlers} />

                <div className="bottom-actions">
                    <button className="btn btn-warning btn-lg"
                        onClick={() => navigate("/ubah-password")}>
                        UBAH PASSWORD
                    </button>
                    <button className="btn btn-primary btn-lg"
                        onClick={() => navigate("/ubah-profile")}>
                        UBAH PROFILE
                    </button>
                    <button className="btn btn-danger btn-lg"
                        onClick={() => navigate("/login")}>
                        ⏻ LOGOUT
                    </button>
                </div>
            </div>
        </div>
    );
}
