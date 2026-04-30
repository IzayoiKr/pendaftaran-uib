
// Generator HTML Surat Hasil / LoA UIB
// Data biaya & beasiswa diambil dari src/constants/biaya.ts

import {
    hitungTotalBiaya,
    formatRupiah,
    type JenisBeasiswa,
} from "@/constants/biaya";

export interface LoaData {
    nomorSurat:      string;
    nomorDaftar:     string;
    namaLengkap:     string;
    namaSekolah:     string;
    gelombang:       string;
    tahunAkademik:   string;
    tempatUjian:     string;
    tanggalUjian:    string;
    prodi:           string;
    kelasKuliah:     string;
    namaBeasiswa:    JenisBeasiswa;
    namaBank:        string;
    noRekening:      string;
    atasNama:        string;
    tanggalDeadline: string;
    tanggalSurat:    string;
    cicilanDeadline: string;
}

export function generateLoaHtml(data: LoaData): string {
    const calc = hitungTotalBiaya(data.prodi, data.namaBeasiswa);
    const { biaya, potongan } = calc;

    const row = (label: string, nilai: string, bold = false) => `
        <tr>
            <td style="padding:4px 8px;${bold ? "font-weight:bold;" : ""}">${label}</td>
            <td style="padding:4px 8px;text-align:right;${bold ? "font-weight:bold;" : ""}">${nilai}</td>
        </tr>`;

    const cicilanMinimal = formatRupiah(Math.min(calc.totalBayar, 3_000_000));

    return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8"/>
<title>Surat Hasil USM - ${data.nomorDaftar}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Times New Roman",Times,serif;font-size:12pt;color:#000;background:#fff;padding:24pt 48pt}
  .ht{width:100%;border-collapse:collapse;margin-bottom:18pt}
  .ht td{vertical-align:top}
  .lc{width:80pt}
  .lc img{width:72pt}
  .ac{padding-left:12pt;font-size:9pt;line-height:1.5}
  .ac strong{font-size:12pt;display:block;margin-bottom:4pt}
  hr{border:none;border-top:2px solid #000;margin-bottom:16pt}
  .meta table{border-collapse:collapse;margin-bottom:14pt;line-height:1.8}
  .meta td{vertical-align:top;padding:1pt 4pt 1pt 0}
  .meta td:first-child{white-space:nowrap;min-width:120pt}
  .lulus{text-align:center;font-size:22pt;font-weight:bold;margin:16pt 0 8pt;letter-spacing:4pt}
  .sub{text-align:center;font-size:12pt;margin-bottom:6pt}
  p{margin-bottom:8pt;line-height:1.7;text-align:justify}
  table.biaya{width:100%;border-collapse:collapse;margin:10pt 0 16pt;font-size:11pt}
  table.biaya th{background:#ddd;padding:5px 8px;text-align:left;font-size:10pt}
  table.biaya tr:nth-child(even){background:#f5f5f5}
  table.biaya .tot td{font-weight:bold;border-top:2px solid #000}
  ol{padding-left:20pt;line-height:1.8}
  ol li{margin-bottom:6pt}
  .note{font-size:10pt;background:#fffbe6;border-left:4pt solid #e6a000;padding:8pt 12pt;margin:12pt 0}
  .fg{display:flex;justify-content:flex-end;margin-top:28pt}
  .fr{text-align:center}
  .ttd{margin-top:60pt}
</style>
</head>
<body>

<table class="ht">
  <tr>
    <td class="lc"><img src="/logo.png" alt="UIB"/></td>
    <td class="ac">
      <strong>Universitas Internasional Batam</strong>
      Jl. Gajah Mada, Baloi-Sei Ladi, Tiban Indah, Kec. Sekupang<br/>
      Kota Batam, Kepulauan Riau 29426 &nbsp;|&nbsp; www.uib.ac.id<br/>
      Tel +62 778 743 7111 &nbsp;|&nbsp; humas@uib.ac.id
    </td>
  </tr>
</table>
<hr/>

<div class="meta">
  <table>
    <tr><td>Nomor</td><td>: ${data.nomorSurat}</td></tr>
    <tr><td>Perihal</td><td>: Hasil Ujian Saringan Masuk Mahasiswa Baru TA ${data.tahunAkademik}</td></tr>
    <tr><td>Lampiran</td><td>: 1 bundel</td></tr>
  </table>
</div>

<p>Yth. Sdr/i <strong>${data.namaLengkap}</strong> / No Pendaftaran: ${data.nomorDaftar}<br/>
Siswa/i ${data.namaSekolah}</p>
<p>Dengan Hormat,</p>

<div class="lulus">SELAMAT, Saudara/i dinyatakan</div>
<div class="lulus" style="font-size:28pt;letter-spacing:6pt;">LULUS</div>
<div class="sub">
  Ujian Saringan Masuk Universitas Internasional Batam<br/>
  <strong>Gelombang ${data.gelombang}</strong> — TA ${data.tahunAkademik}<br/>
  Di <strong>${data.tempatUjian}</strong> pada <strong>${data.tanggalUjian}</strong>
</div>

<p style="margin-top:10pt;">Untuk terdaftar sebagai mahasiswa/i <strong>${data.namaBeasiswa}</strong>
Program Studi <strong>${data.prodi}, ${data.kelasKuliah}</strong>, mohon cermati informasi berikut:</p>

<p><strong>1. Rincian Biaya:</strong></p>
<table class="biaya">
  <thead>
    <tr><th>KETERANGAN KOMPONEN BIAYA</th><th style="text-align:right">JUMLAH</th></tr>
  </thead>
  <tbody>
    <tr><td colspan="2" style="padding:4px 8px;font-weight:bold;background:#eee">A. Biaya Mahasiswa Baru (sekali bayar tahun pertama)</td></tr>
    ${row("1) Sumbangan Penyelenggaraan Pendidikan (SPP) / Uang Gedung", formatRupiah(biaya.spp))}
    ${row("2) Biaya PPL (Penyelenggaraan Pendidikan &amp; Lain-lain)", formatRupiah(biaya.bppl))}
    <tr><td colspan="2" style="padding:4px 8px;font-weight:bold;background:#eee">B. Biaya Kuliah Semester I</td></tr>
    ${row("1) BPP Pokok", formatRupiah(biaya.bppPokok))}
    ${row("2) BPP SKS Semester I", formatRupiah(biaya.bppSks))}
    ${biaya.bppPraktikum > 0 ? row("3) BPP Praktikum", formatRupiah(biaya.bppPraktikum)) : ""}
    ${row("TOTAL SEBELUM BEASISWA", formatRupiah(calc.totalSebelumPotongan), true)}
    <tr><td colspan="2" style="padding:4px 8px;font-weight:bold;background:#eee">C. BEASISWA: ${data.namaBeasiswa}</td></tr>
    ${calc.potonganBppPokok > 0     ? row(`Potongan BPP Pokok (${potongan.potonganBppPokok}%)`,     formatRupiah(calc.potonganBppPokok)) : ""}
    ${calc.potonganBppSks > 0       ? row(`Potongan BPP SKS (${potongan.potonganBppSks}%)`,         formatRupiah(calc.potonganBppSks)) : ""}
    ${calc.potonganBppPraktikum > 0 ? row(`Potongan BPP Praktikum (${potongan.potonganBppPraktikum}%)`, formatRupiah(calc.potonganBppPraktikum)) : ""}
    ${calc.potonganSpp > 0          ? row(`Potongan SPP (${potongan.potonganSpp}%)`,                 formatRupiah(calc.potonganSpp)) : ""}
  </tbody>
  <tfoot>
    <tr class="tot">
      <td style="padding:6px 8px">TOTAL POTONGAN BEASISWA</td>
      <td style="padding:6px 8px;text-align:right">${formatRupiah(calc.totalPotongan)}</td>
    </tr>
    <tr class="tot" style="background:#dff0d8">
      <td style="padding:6px 8px">TOTAL YANG HARUS DIBAYAR</td>
      <td style="padding:6px 8px;text-align:right">${formatRupiah(calc.totalBayar)}</td>
    </tr>
  </tfoot>
</table>

<ol>
  <li>
    Daftar ulang paling lambat <strong>${data.tanggalDeadline}</strong> via:<br/><br/>
    Bank: <strong>${data.namaBank}</strong> &nbsp;|&nbsp;
    No. Rek: <strong>${data.noRekening}</strong> &nbsp;|&nbsp;
    A/N: <strong>${data.atasNama}</strong><br/><br/>
    Pembayaran minimal <strong>${cicilanMinimal},-</strong>. Sisa dicicil hingga
    <strong>${data.cicilanDeadline}</strong> (isi Surat Pernyataan Cicilan, Lampiran-3).<br/><br/>
    Wajib unggah dokumen daftar ulang di <strong>pendaftaran.uib.ac.id</strong> (Lampiran-2).
  </li>
</ol>

<div class="note">
  <strong>CATATAN:</strong> Pelunasan di periode daftar ulang mendapat potongan tambahan
  <strong>Rp 1.000.000,-</strong> (khusus Beasiswa I–IV dan reguler).
</div>

<p>Info lebih lanjut: <strong>0778-7437111</strong> / WA <strong>0821 7484 6764</strong></p>
<p>Terima kasih atas perhatian Saudara/i.</p>

<div class="fg">
  <div class="fr">
    <p>Batam, ${data.tanggalSurat}</p>
    <div class="ttd">
      <p><strong>Panitia PMB UIB TA ${data.tahunAkademik}</strong></p>
    </div>
  </div>
</div>
</body>
</html>`;
}
