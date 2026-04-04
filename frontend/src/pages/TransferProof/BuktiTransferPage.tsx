import { useNavigate } from "react-router-dom";
import "./BuktiTransferPage.scss";

// ── Types ──────────────────────────────────────────────────────────────────────
interface BiodataPendaftaran {
    nomorDaftar: string;
    periode:     string;
    gelombang:   string;
    jurusan:     string;
    namaLengkap: string;
    alamatEmail: string;
    nomorNIK:    string;
}

interface BuktiTransferRow {
    tanggalUpload:   string;
    pemilikRekening: string;
    bank:            string;
    buktiTransferUrl: string;  // URL file bukti transfer
    statusValidasi:  string;
    tanggalValidasi: string;
    ropUrl:          string;   // URL Lihat ROP
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BiodataSection({ data }: { data: BiodataPendaftaran }) {
    const rows: [string, string][] = [
        ["Nomor Daftar (Registration Number)", data.nomorDaftar],
        ["Periode (Period)",                   data.periode],
        ["Gelombang (Group)",                  data.gelombang],
        ["Jurusan (Study Program)",            data.jurusan],
        ["Nama Lengkap (Full Name)",           data.namaLengkap],
        ["Alamat Email (Email)",               data.alamatEmail],
        ["Nomor NIK (National Identification Number)", data.nomorNIK],
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
    "Tanggal Upload (Uploaded Date)",
    "Pemilik Rekening (Account Owner)",
    "Bank",
    "Bukti Transfer (Receipt of Payment)",
    "Status Validasi (Validation Status)",
    "Tanggal Validasi (Validation Date)",
    "Aksi",
];

function BuktiTransferTable({ rows }: { rows: BuktiTransferRow[] }) {
    return (
        <div className="table-wrapper">
            <table>
                <thead>
                    <tr>
                        {TABLE_HEADERS.map(h => <th key={h}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={TABLE_HEADERS.length} style={{ textAlign: "center", padding: "1rem" }}>
                                Belum ada bukti transfer.
                            </td>
                        </tr>
                    ) : (
                        rows.map((row, i) => (
                            <tr key={i}>
                                <td>{row.tanggalUpload}</td>
                                <td>{row.pemilikRekening}</td>
                                <td>{row.bank}</td>
                                <td>
                                    <a
                                        href={row.buktiTransferUrl}
                                        className="bukti-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        🧾 Bukti Transfer
                                    </a>
                                </td>
                                <td>
                                    <span className={
                                        row.statusValidasi.toLowerCase().includes("diterima")
                                            ? "status-accepted" : ""
                                    }>
                                        {row.statusValidasi}
                                    </span>
                                </td>
                                <td>{row.tanggalValidasi}</td>
                                <td>
                                    <a
                                        href={row.ropUrl}
                                        className="btn-rop"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        📋 Lihat ROP
                                    </a>
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
    nomorDaftar: "",
    periode:     "",
    gelombang:   "",
    jurusan:     "",
    namaLengkap: "",
    alamatEmail: "",
    nomorNIK:    "",
};

const MOCK_ROWS: BuktiTransferRow[] = []; // TODO: fetch dari backend

export default function BuktiTransferPage() {
    const navigate = useNavigate();

    return (
        <div className="page-content">
            <div className="bukti-box">
                <h2 className="section-title">Biodata Pendaftaran</h2>
                <BiodataSection data={MOCK_BIODATA} />

                <h3 className="table-title">
                    Daftar Bukti Transfer (List of Receipt Payment)
                </h3>
                <BuktiTransferTable rows={MOCK_ROWS} />

                <div className="bottom-actions">
                    <button className="btn btn-warning" onClick={() => navigate(-1)}>
                        ← Kembali (Back)
                    </button>
                    <button className="btn btn-success"
                        onClick={() => navigate("/uploadtransferproof")}>
                        + Tambah Bukti Transfer (Add Receipt of Payment)
                    </button>
                </div>
            </div>
        </div>
    );
}
