// src/lib/loaTemplate.ts
// Generator HTML Surat Hasil / LoA UIB — serve sebagai HTML murni


import { hitungTotalBiaya, formatRupiah, type JenisBeasiswa, type KelasKuliah, DEFAULT_KELAS } from "@/constants/biaya";

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
    kelasKuliah:     KelasKuliah;
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
    const kelas = data.kelasKuliah ?? DEFAULT_KELAS;
    const cicilanMinimal = formatRupiah(Math.min(calc.totalBayar, 3_000_000));

    const row = (label: string, nilai: string, bold = false) =>
        `<tr><td style="padding:5px 10px;${bold?"font-weight:700;":""}">${label}</td><td style="padding:5px 10px;text-align:right;${bold?"font-weight:700;":""}">${nilai}</td></tr>`;

    const sec = (label: string) =>
        `<tr><td colspan="2" style="padding:5px 10px;font-weight:700;background:#e8e8e8;font-size:10pt;">${label}</td></tr>`;

    const style = `<style>
@media print{body{margin:0;padding:0}.no-print{display:none!important}}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Times New Roman",Times,serif;font-size:12pt;color:#000;background:#fff;padding:20pt 40pt;max-width:210mm;margin:0 auto}
.print-btn{position:fixed;top:16px;right:16px;background:#1a73e8;color:#fff;border:none;border-radius:6px;padding:10px 20px;font-size:14px;cursor:pointer;font-family:sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.2)}
.print-btn:hover{background:#1557b0}
.ht{width:100%;border-collapse:collapse;margin-bottom:14pt}
.ht td{vertical-align:top}
.lc{width:72pt}
.lc img{width:64pt}
.ac{padding-left:10pt;font-size:9pt;line-height:1.6}
.ac .un{font-size:13pt;font-weight:700;display:block;margin-bottom:2pt}
hr{border:none;border-top:2.5px solid #000;margin-bottom:14pt}
.mt{border-collapse:collapse;margin-bottom:12pt}
.mt td{vertical-align:top;padding:1pt 4pt 1pt 0;font-size:11pt}
.mt td:first-child{white-space:nowrap;min-width:80pt}
.lb{text-align:center;margin:14pt 0 6pt}
.lb .s1{font-size:14pt;font-weight:700;letter-spacing:2pt}
.lb .s2{font-size:26pt;font-weight:700;letter-spacing:6pt;margin:4pt 0}
.lb .s3{font-size:11pt;line-height:1.7}
p{margin-bottom:8pt;line-height:1.7;text-align:justify;font-size:11pt}
table.biaya{width:100%;border-collapse:collapse;margin:10pt 0 14pt;font-size:10.5pt}
table.biaya th{background:#bbb;padding:6px 10px;text-align:left;font-size:10pt;font-weight:700}
table.biaya tbody tr:nth-child(even){background:#f5f5f5}
table.biaya .tr td{font-weight:700;border-top:2px solid #000;padding:6px 10px}
table.biaya .fr td{font-weight:700;background:#d4edda;padding:6px 10px}
ol{padding-left:18pt;line-height:1.8;font-size:11pt}
ol li{margin-bottom:6pt}
.bi{margin-left:16pt;margin-top:4pt;line-height:2}
.nb{font-size:10pt;background:#fffbe6;border-left:4pt solid #e6a000;padding:8pt 12pt;margin:12pt 0;line-height:1.6}
.ft{margin-top:24pt;display:flex;justify-content:flex-end}
.fr2{text-align:center;min-width:180pt}
.ttd{height:60pt}
</style>`;

    return `<!DOCTYPE html>
<html lang="id">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Surat Hasil USM - ${data.nomorDaftar}</title>${style}</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
<table class="ht"><tr>
  <td class="lc"><img src="/logo.png" alt="UIB" onerror="this.style.display='none'"/></td>
  <td class="ac"><span class="un">Universitas Internasional Batam</span>
    Jl. Gajah Mada, Baloi-Sei Ladi, Tiban Indah, Kec. Sekupang<br/>
    Kota Batam, Kepulauan Riau 29426 | www.uib.ac.id | humas@uib.ac.id | Tel +62 778 743 7111
  </td>
</tr></table>
<hr/>
<table class="mt">
  <tr><td>Nomor</td><td>: ${data.nomorSurat}</td></tr>
  <tr><td>Perihal</td><td>: Hasil Ujian Saringan Masuk Mahasiswa Baru TA ${data.tahunAkademik}</td></tr>
  <tr><td>Lampiran</td><td>: 1 bundel</td></tr>
</table>
<p>Yth. Sdr/i <strong>${data.namaLengkap}</strong> / No. Pendaftaran: <strong>${data.nomorDaftar}</strong><br/>Siswa/i <strong>${data.namaSekolah}</strong></p>
<p>Dengan Hormat,</p>
<div class="lb">
  <div class="s1">SELAMAT, Saudara/i dinyatakan</div>
  <div class="s2">L U L U S</div>
  <div class="s3">Ujian Saringan Masuk Mahasiswa Baru Universitas Internasional Batam<br/>
    <strong>Gelombang ${data.gelombang}</strong> — Tahun Akademik <strong>${data.tahunAkademik}</strong><br/>
    Di <strong>${data.tempatUjian}</strong> pada tanggal <strong>${data.tanggalUjian}</strong>
  </div>
</div>
<p style="margin-top:12pt;">Untuk terdaftar sebagai mahasiswa/i <strong>${data.namaBeasiswa}</strong>
Program Studi <strong>${data.prodi}</strong>, <strong>${kelas}</strong>, mohon cermati informasi biaya berikut:</p>
<p><strong>1. Rincian Biaya Pendidikan:</strong></p>
<table class="biaya">
  <thead><tr><th>KETERANGAN KOMPONEN BIAYA</th><th style="text-align:right;width:140pt;">JUMLAH</th></tr></thead>
  <tbody>
    ${sec("A. Biaya Mahasiswa Baru (hanya sekali di tahun pertama)")}
    ${row("&nbsp;&nbsp;1) SPP / Uang Gedung", formatRupiah(biaya.spp))}
    ${row("&nbsp;&nbsp;2) Biaya PPL", formatRupiah(biaya.bppl))}
    ${sec("B. Biaya Kuliah Semester I")}
    ${row("&nbsp;&nbsp;1) BPP Pokok", formatRupiah(biaya.bppPokok))}
    ${row("&nbsp;&nbsp;2) BPP SKS Semester I", formatRupiah(biaya.bppSks))}
    ${biaya.bppPraktikum > 0 ? row("&nbsp;&nbsp;3) BPP Praktikum", formatRupiah(biaya.bppPraktikum)) : ""}
    ${row("SUBTOTAL (A + B)", formatRupiah(calc.totalSebelumPotongan), true)}
    ${sec(`C. BEASISWA: ${data.namaBeasiswa} — ${potongan.label}`)}
    ${calc.potonganBppPokok > 0     ? row(`&nbsp;&nbsp;Potongan BPP Pokok (${potongan.potonganBppPokok}%)`,     formatRupiah(calc.potonganBppPokok)) : ""}
    ${calc.potonganBppSks > 0       ? row(`&nbsp;&nbsp;Potongan BPP SKS (${potongan.potonganBppSks}%)`,         formatRupiah(calc.potonganBppSks)) : ""}
    ${calc.potonganBppPraktikum > 0 ? row(`&nbsp;&nbsp;Potongan BPP Praktikum (${potongan.potonganBppPraktikum}%)`, formatRupiah(calc.potonganBppPraktikum)) : ""}
    ${calc.potonganSpp > 0          ? row(`&nbsp;&nbsp;Potongan SPP (${potongan.potonganSpp}%)`,                 formatRupiah(calc.potonganSpp)) : ""}
  </tbody>
  <tfoot>
    <tr class="tr"><td>TOTAL POTONGAN BEASISWA</td><td style="text-align:right">${formatRupiah(calc.totalPotongan)}</td></tr>
    <tr class="fr"><td>✅ TOTAL BIAYA YANG HARUS DILUNASI</td><td style="text-align:right">${formatRupiah(calc.totalBayar)}</td></tr>
  </tfoot>
</table>
<ol>
  <li><strong>Daftar ulang paling lambat ${data.tanggalDeadline}</strong> melalui:
    <div class="bi">
      <strong>Bank &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</strong> ${data.namaBank}<br/>
      <strong>No. Rekening :</strong> ${data.noRekening}<br/>
      <strong>Atas Nama &nbsp;&nbsp;:</strong> ${data.atasNama}
    </div><br/>
    Petunjuk pembayaran pada <strong>Lampiran-1</strong>.
  </li>
  <li>Pembayaran minimal <strong>${cicilanMinimal},-</strong>. Sisa dicicil hingga <strong>${data.cicilanDeadline}</strong> (Lampiran-3).</li>
  <li>Wajib unggah dokumen daftar ulang di <strong>pendaftaran.uib.ac.id</strong> (Lampiran-2).</li>
  <li>Ketentuan pengunduran diri dan pengembalian pembayaran, lihat <strong>Lampiran-2</strong>.</li>
</ol>
<div class="nb"><strong>⚠ CATATAN:</strong> Pelunasan di periode daftar ulang mendapat potongan tambahan <strong>Rp 1.000.000,-</strong> (khusus Beasiswa I–IV dan reguler).</div>
<p>Info lebih lanjut: Humas UIB <strong>0778-7437111</strong> / WA <strong>0821 7484 6764</strong></p>
<p>Terima kasih atas perhatian Saudara/i.</p>
<div class="ft">
  <div class="fr2">
    <p>Batam, ${data.tanggalSurat}</p>
    <div class="ttd"></div>
    <p><strong>Panitia PMB UIB TA ${data.tahunAkademik}</strong></p>
  </div>
</div>
</body></html>`;
}