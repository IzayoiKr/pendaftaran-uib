import { useNavigate } from "react-router-dom";
import "./PerubahanProdiPage.scss";

// ── Types ──────────────────────────────────────────────────────────────────────
interface BiodataPendaftaran {
    nomorDaftar:  string;
    periode:      string;
    gelombang:    string;
    jurusan:      string;
    namaLengkap:  string;
    alamatEmail:  string;
    nomorNIK:     string;
}

interface RequestPerpindahan {
    tanggalRequest:          string;
    programStudiSebelumnya:  string;
    programStudiPerpindahan: string;
    waktuKuliahSebelumnya:   string;
    waktuKuliahPerpindahan:  string;
    statusValidasi:          string;
    tanggalValidasi:         string;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string][] = [
        ["Nomor Daftar",  data.nomorDaftar],
        ["Periode",       data.periode],
        ["Gelombang",     data.gelombang],
        ["Jurusan",       data.jurusan],
        ["Nama Lengkap",  data.namaLengkap],
        ["Alamat Email",  data.alamatEmail],
        ["Nomor NIK",     data.nomorNIK],
    ];

    return (
        <div className="biodata-info">
            {rows.map(([label, value]) => (
                <div key={label} className="info-row">
                    <span className="info-label">{label}</span>
                    <span className="info-value">: {value}</span>
                </div>
            ))}
        </div>
    );
}

const TABLE_HEADERS = [
    "Tanggal Request",
    "Program Studi Sebelumnya",
    "Program Studi Perpindahan",
    "Waktu Kuliah Sebelumnya",
    "Waktu Kuliah Perpindahan",
    "Status Validasi",
    "Tanggal Validasi",
    "Aksi",
];

function RequestTable({ requests }: { requests: RequestPerpindahan[] }) {
    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        {TABLE_HEADERS.map(h => <th key={h}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {requests.length === 0 ? (
                        <tr>
                            <td className="empty-row" colSpan={TABLE_HEADERS.length}>
                                Belum ada request perpindahan prodi.
                            </td>
                        </tr>
                    ) : (
                        requests.map((req, i) => (
                            <tr key={i}>
                                <td>{req.tanggalRequest}</td>
                                <td>{req.programStudiSebelumnya}</td>
                                <td>{req.programStudiPerpindahan}</td>
                                <td>{req.waktuKuliahSebelumnya}</td>
                                <td>{req.waktuKuliahPerpindahan}</td>
                                <td>{req.statusValidasi}</td>
                                <td>{req.tanggalValidasi}</td>
                                <td>
                                    {/* TODO: aksi per row */}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

// ── Parent component ───────────────────────────────────────────────────────────
// TODO: ganti dengan data dari backend / props / context

const MOCK_BIODATA: BiodataPendaftaran = {
    nomorDaftar:  "",
    periode:      "",
    gelombang:    "",
    jurusan:      "",
    namaLengkap:  "",
    alamatEmail:  "",
    nomorNIK:     "",
};

const MOCK_REQUESTS: RequestPerpindahan[] = []; // TODO: fetch dari backend

export default function PerubahanProdiPage() {
    const navigate = useNavigate();

    const handleRequestBaru = () => {
        // TODO: navigate ke form request perpindahan prodi
        navigate("/requestchangeprodi");
    };

    return (
        <div className="page-content">
            <div className="prodi-box">
                <h2 className="section-title">Biodata Pendaftaran</h2>
                <BiodataSection data={MOCK_BIODATA} />

                <h3 className="table-title">Daftar Request Pemindahan Prodi</h3>
                <RequestTable requests={MOCK_REQUESTS} />

                <div className="bottom-actions">
                    <button className="btn btn-warning" onClick={() => navigate(-1)}>
                        ← Kembali
                    </button>
                    <button className="btn btn-success" onClick={handleRequestBaru}>
                        + Request Perpindahan Prodi
                    </button>
                </div>
            </div>
        </div>
    );
}
