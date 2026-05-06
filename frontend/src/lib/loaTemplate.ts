// src/lib/loaTemplate.ts
// Generator HTML Surat Hasil / LoA UIB
// Template dari LoA.txt, data mapping dari pendaftaran_gelombang + master_gelombang

import {
    hitungTotalBiaya,
    formatRupiah,
    type JenisBeasiswa,
    type KelasKuliah,
    DEFAULT_KELAS,
} from "@/constants/biaya";

// ─── Types ─────────────────────────────────────────────────────────────────────
// Field mapping dari tabel pendaftaran_gelombang + master_gelombang (Go backend)
//
// pendaftaran_gelombang:
//   nomor_daftar, nik, nama, waktukuliah, prodipil, jenisdaftar, asal_sekolah
//
// master_gelombang:
//   nama (gelombang), tahun_akademik, lokasi, tanggal_ujian, jam_mulai, jam_selesai
//
// Extra (dari logika bisnis / admin input):
//   nomor_surat, nama_beasiswa, nama_bank, no_rekening, atas_nama,
//   tanggal_deadline, tanggal_surat, cicilan_deadline

export interface LoaData {
    // dari pendaftaran_gelombang
    nomorDaftar:     string;   // nomor_daftar
    namaLengkap:     string;   // nama
    namaSekolah:     string;   // asal_sekolah
    prodi:           string;   // prodipil
    kelasKuliah:     KelasKuliah; // waktukuliah → "Kelas Malam" | "Kelas Pagi"

    // dari master_gelombang
    gelombang:       string;   // nama (gelombang)
    tahunAkademik:   string;   // tahun_akademik
    tempatUjian:     string;   // lokasi
    tanggalUjian:    string;   // tanggal_ujian (formatted)

    // dari logika bisnis / admin
    nomorSurat:      string;
    namaBeasiswa:    JenisBeasiswa;
    namaBank:        string;
    noRekening:      string;
    atasNama:        string;
    tanggalDeadline: string;
    tanggalSurat:    string;
    cicilanDeadline: string;
}

// ─── Generate HTML ─────────────────────────────────────────────────────────────
export function generateLoaHtml(data: LoaData): string {
    const calc = hitungTotalBiaya(data.prodi, data.namaBeasiswa);
    const { biaya, potongan } = calc;
    const kelas = data.kelasKuliah ?? DEFAULT_KELAS;
    const cicilanMinimal = formatRupiah(Math.min(calc.totalBayar, 3_000_000));

    // Helper row biaya
    const row = (label: string, nilai: string) =>
        `<tr><td>${label}</td><td>${nilai}</td></tr>`;

    const sectionHeader = (label: string) =>
        `<tr class="section-header"><td colspan="2">${label}</td></tr>`;

    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Surat Hasil USM - ${data.nomorDaftar}</title>
<style>
  :root {
    --primary: #1a3e6f;
    --accent: #e6a000;
    --green: #28a745;
    --light-bg: #f8f9fa;
    --border: #dee2e6;
    --text: #212529;
    --shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.05);
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    font-size: 13pt;
    line-height: 1.6;
    color: var(--text);
    background: #e9ecef;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    min-height: 100vh;
    padding: 30px 20px;
  }
  .letter {
    max-width: 800px;
    width: 100%;
    background: white;
    padding: 50px 60px;
    box-shadow: var(--shadow);
    border-radius: 4px;
    position: relative;
    border-top: 6px solid var(--primary);
  }
  .print-btn {
    position: fixed;
    top: 20px; right: 20px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 10px 22px;
    font-size: 13pt;
    cursor: pointer;
    font-family: sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    z-index: 100;
  }
  .print-btn:hover { background: #122d52; }
  .header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 25px;
  }
  .logo { flex: 0 0 90px; }
  .logo img { width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .school-info { flex: 1; font-size: 10pt; line-height: 1.6; }
  .school-info strong { font-size: 14pt; display: block; margin-bottom: 4px; color: var(--primary); letter-spacing: 0.5px; }
  hr { border: none; border-top: 2px solid var(--primary); margin: 20px 0 25px; opacity: 0.8; }
  .meta-info { margin-bottom: 20px; }
  .meta-row { display: flex; margin-bottom: 4px; font-size: 12pt; }
  .meta-label { min-width: 110px; font-weight: bold; color: #333; }
  .meta-value { flex: 1; }
  .addressee { margin: 20px 0 15px; }
  .addressee p { margin: 4px 0; }
  .salutation { margin: 10px 0 20px; font-weight: bold; color: var(--primary); }
  .congrats { text-align: center; margin: 30px 0; }
  .congrats-line { font-size: 18pt; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: var(--primary); }
  .congrats-lulus { font-size: 38pt; font-weight: bold; color: var(--green); letter-spacing: 6px; margin: 10px 0; text-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .exam-detail { font-size: 13pt; margin: 10px 0 25px; line-height: 1.6; }
  .section-title { font-weight: bold; margin: 20px 0 10px; font-size: 13pt; color: var(--primary); border-bottom: 1px solid var(--border); padding-bottom: 4px; }
  table.biaya { width: 100%; border-collapse: collapse; margin: 15px 0 25px; font-size: 11pt; background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
  table.biaya th { background: var(--primary); color: white; padding: 12px 10px; text-align: left; font-weight: 600; letter-spacing: 0.3px; }
  table.biaya th:last-child { text-align: right; }
  table.biaya td { padding: 10px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  table.biaya td:last-child { text-align: right; font-weight: 500; }
  table.biaya tr.section-header td { background: #f1f3f5; font-weight: bold; color: var(--primary); padding: 10px; font-size: 11pt; border-top: 2px solid var(--primary); }
  table.biaya tfoot tr.tot td { font-weight: bold; border-top: 2px solid var(--primary); padding: 12px 10px; font-size: 13pt; }
  table.biaya tfoot tr.tot td:last-child { text-align: right; }
  table.biaya tfoot tr.tot-highlight td { background: #d4edda; color: #155724; font-size: 14pt; }
  .payment-instruction { margin: 20px 0; padding-left: 25px; line-height: 1.8; }
  .payment-instruction li { margin-bottom: 10px; }
  .note-box { background: #fff3cd; border-left: 5px solid var(--accent); padding: 15px 20px; margin: 25px 0; border-radius: 0 6px 6px 0; font-size: 11pt; color: #856404; }
  .contact-info { margin: 25px 0 15px; font-size: 12pt; line-height: 1.6; }
  .signature { display: flex; justify-content: flex-end; margin-top: 50px; text-align: center; font-size: 12pt; }
  .signature .position { margin-top: 60px; font-weight: bold; color: var(--primary); }
  .footer-note { margin-top: 30px; font-size: 10pt; color: #666; text-align: center; border-top: 1px solid var(--border); padding-top: 20px; }
  @media print {
    body { background: white; padding: 0; }
    .letter { box-shadow: none; border-radius: 0; border-top: none; padding: 15mm 20mm; }
    .print-btn { display: none !important; }
  }
  @media (max-width: 600px) {
    .letter { padding: 30px 20px; }
    .header { flex-direction: column; align-items: center; }
  }
</style>
</head>
<body>

<button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>

<div class="letter">

  <!-- Header -->
  <div class="header">
    <div class="logo">
      <img src="api/files/logouibloa" alt="Logo UIB" onerror="this.style.display='none'"/>
    </div>
    <div class="school-info">
      <strong>Universitas Internasional Batam</strong>
      Jl. Gajah Mada, Baloi-Sei Ladi, Tiban Indah, Kec. Sekupang<br/>
      Kota Batam, Kepulauan Riau 29426 &nbsp;|&nbsp; www.uib.ac.id<br/>
      Tel +62 778 743 7111 &nbsp;|&nbsp; humas@uib.ac.id
    </div>
  </div>

  <hr/>

  <!-- Meta Surat -->
  <div class="meta-info">
    <div class="meta-row">
      <span class="meta-label">Nomor</span>
      <span class="meta-value">: ${data.nomorSurat}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Perihal</span>
      <span class="meta-value">: Hasil Ujian Saringan Masuk Mahasiswa Baru TA ${data.tahunAkademik}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Lampiran</span>
      <span class="meta-value">: 1 bundel</span>
    </div>
  </div>

  <!-- Penerima -->
  <div class="addressee">
    <p>Yth. Sdr/i <strong>${data.namaLengkap}</strong> / No Pendaftaran: <strong>${data.nomorDaftar}</strong></p>
    <p>Siswa/i ${data.namaSekolah}</p>
  </div>

  <p class="salutation">Dengan Hormat,</p>

  <!-- Kelulusan -->
  <div class="congrats">
    <div class="congrats-line">SELAMAT, Saudara/i dinyatakan</div>
    <div class="congrats-lulus">LULUS</div>
    <div class="exam-detail">
      Ujian Saringan Masuk Universitas Internasional Batam<br/>
      <strong>Gelombang ${data.gelombang}</strong> — TA ${data.tahunAkademik}<br/>
      Di <strong>${data.tempatUjian}</strong> pada <strong>${data.tanggalUjian}</strong>
    </div>
  </div>

  <p>Untuk terdaftar sebagai mahasiswa/i <strong>${data.namaBeasiswa}</strong>
  Program Studi <strong>${data.prodi}, ${kelas}</strong>, mohon cermati informasi berikut:</p>

  <!-- Rincian Biaya -->
  <div class="section-title">1. Rincian Biaya</div>
  <table class="biaya">
    <thead>
      <tr>
        <th>KETERANGAN KOMPONEN BIAYA</th>
        <th>JUMLAH</th>
      </tr>
    </thead>
    <tbody>
      ${sectionHeader("A. Biaya Mahasiswa Baru (sekali bayar tahun pertama)")}
      ${row("&nbsp;&nbsp;1) Sumbangan Penyelenggaraan Pendidikan (SPP) / Uang Gedung", formatRupiah(biaya.spp))}
      ${row("&nbsp;&nbsp;2) Biaya PPL (Penyelenggaraan Pendidikan &amp; Lain-lain)", formatRupiah(biaya.bppl))}

      ${sectionHeader("B. Biaya Kuliah Semester I")}
      ${row("&nbsp;&nbsp;1) BPP Pokok", formatRupiah(biaya.bppPokok))}
      ${row("&nbsp;&nbsp;2) BPP SKS Semester I", formatRupiah(biaya.bppSks))}
      ${biaya.bppPraktikum > 0 ? row("&nbsp;&nbsp;3) BPP Praktikum", formatRupiah(biaya.bppPraktikum)) : ""}

      <tr class="section-header"><td>SUBTOTAL SEBELUM BEASISWA</td><td>${formatRupiah(calc.totalSebelumPotongan)}</td></tr>

      ${sectionHeader(`C. BEASISWA: ${data.namaBeasiswa} — ${potongan.label}`)}
      ${calc.potonganBppPokok     > 0 ? row(`&nbsp;&nbsp;Potongan BPP Pokok (${potongan.potonganBppPokok}%)`,         formatRupiah(calc.potonganBppPokok)) : ""}
      ${calc.potonganBppSks       > 0 ? row(`&nbsp;&nbsp;Potongan BPP SKS (${potongan.potonganBppSks}%)`,             formatRupiah(calc.potonganBppSks)) : ""}
      ${calc.potonganBppPraktikum > 0 ? row(`&nbsp;&nbsp;Potongan BPP Praktikum (${potongan.potonganBppPraktikum}%)`, formatRupiah(calc.potonganBppPraktikum)) : ""}
      ${calc.potonganSpp          > 0 ? row(`&nbsp;&nbsp;Potongan SPP (${potongan.potonganSpp}%)`,                    formatRupiah(calc.potonganSpp)) : ""}
    </tbody>
    <tfoot>
      <tr class="tot">
        <td>TOTAL POTONGAN BEASISWA</td>
        <td>${formatRupiah(calc.totalPotongan)}</td>
      </tr>
      <tr class="tot tot-highlight">
        <td>✅ TOTAL YANG HARUS DIBAYAR</td>
        <td>${formatRupiah(calc.totalBayar)}</td>
      </tr>
    </tfoot>
  </table>

  <!-- Instruksi -->
  <div class="section-title">2. Petunjuk Daftar Ulang</div>
  <ol class="payment-instruction">
    <li>
      Lakukan pembayaran paling lambat <strong>${data.tanggalDeadline}</strong> melalui:<br/><br/>
      Bank: <strong>${data.namaBank}</strong> &nbsp;|&nbsp;
      No. Rekening: <strong>${data.noRekening}</strong> &nbsp;|&nbsp;
      Atas Nama: <strong>${data.atasNama}</strong>
    </li>
    <li>
      Pembayaran minimal sebesar <strong>${cicilanMinimal},-</strong>.
      Sisa tagihan dapat dicicil per bulan hingga <strong>${data.cicilanDeadline}</strong>
      dengan mengisi Surat Pernyataan Cicilan Biaya Kuliah (Lampiran-3).
    </li>
    <li>
      Lengkapi dan unggah dokumen daftar ulang di laman
      <strong>pendaftaran.uib.ac.id</strong> (pedoman pada Lampiran-2).
    </li>
    <li>
      Ketentuan pengunduran diri dan pengembalian pembayaran, silakan baca Lampiran-2.
    </li>
  </ol>

  <!-- Catatan -->
  <div class="note-box">
    <strong>CATATAN PENTING:</strong> Bagi calon mahasiswa peraih Beasiswa I, II, III, IV, serta
    program reguler, apabila melakukan pelunasan pembayaran pada periode daftar ulang, maka akan
    mendapat potongan tambahan sebesar <strong>Rp 1.000.000,-</strong> (satu juta rupiah).
  </div>

  <div class="contact-info">
    Informasi lebih lanjut, silakan menghubungi <strong>Humas UIB (0778-7437111)</strong>
    atau <strong>WA 0821 7484 6764</strong>.<br/>
    Atas perhatian dan kerjasama Saudara/i, kami ucapkan terima kasih.
  </div>

  <!-- Tanda Tangan -->
  <div class="signature">
    <div>
      <p>Batam, ${data.tanggalSurat}</p>
      <div class="position">
        <p>Panitia PMB Universitas Internasional Batam</p>
        <p>TA ${data.tahunAkademik}</p>
      </div>
    </div>
  </div>

</div>
</body>
</html>`;
}