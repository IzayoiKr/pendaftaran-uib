package loa

import (
	"fmt"
	"strings"
)

func formatRupiah(n int) string {
	if n == 0 {
		return "Rp 0,-"
	}
	s := fmt.Sprintf("%d", n)
	result := make([]byte, 0, len(s)+len(s)/3+3)
	offset := len(s) % 3
	for i, c := range s {
		if i != 0 && (i-offset)%3 == 0 {
			result = append(result, '.')
		}
		result = append(result, byte(c))
	}
	return "Rp " + string(result) + ",-"
}

func row(label, value string) string {
	return fmt.Sprintf("<tr><td>%s</td><td>%s</td></tr>", label, value)
}

func sectionHeader(label string) string {
	return fmt.Sprintf(`<tr class="section-header"><td colspan="2">%s</td></tr>`, label)
}

func buildBiayaRowsS1(f *S1FeeBreakdown) string {
	var b strings.Builder

	b.WriteString(sectionHeader("A. Biaya Mahasiswa Baru (sekali bayar tahun pertama)"))
	b.WriteString(row(
		"&nbsp;&nbsp;1) Sumbangan Penyelenggaraan Pendidikan (SPP) / Uang Gedung",
		formatRupiah(f.SPP),
	))
	b.WriteString(row(
		"&nbsp;&nbsp;2) Biaya PPL (Penyelenggaraan Pendidikan &amp; Lain-lain)",
		formatRupiah(f.PPL),
	))

	b.WriteString(sectionHeader("B. Biaya Kuliah Semester I"))
	b.WriteString(row("&nbsp;&nbsp;1) BPP Pokok", formatRupiah(f.BPPPokok)))
	b.WriteString(row("&nbsp;&nbsp;2) BPP SKS Semester I", formatRupiah(f.BPPSKS)))
	if f.BPPPraktikum > 0 {
		b.WriteString(row("&nbsp;&nbsp;3) BPP Praktikum / Laboratorium", formatRupiah(f.BPPPraktikum)))
	}

	b.WriteString(fmt.Sprintf(
		`<tr class="section-header"><td>SUBTOTAL SEBELUM BEASISWA</td><td>%s</td></tr>`,
		formatRupiah(f.TotalBefore),
	))

	if f.TotalDiscount > 0 {
		scholarshipLabel := f.ScholarshipName
		if scholarshipLabel == "" {
			scholarshipLabel = "Beasiswa"
		}
		b.WriteString(sectionHeader(fmt.Sprintf("C. BEASISWA: %s", scholarshipLabel)))
		if f.DiscountSPP > 0 {
			b.WriteString(row("&nbsp;&nbsp;Potongan SPP", formatRupiah(f.DiscountSPP)))
		}
		if f.DiscountPPL > 0 {
			b.WriteString(row("&nbsp;&nbsp;Potongan PPL", formatRupiah(f.DiscountPPL)))
		}
		if f.DiscountBPPPokok > 0 {
			b.WriteString(row("&nbsp;&nbsp;Potongan BPP Pokok", formatRupiah(f.DiscountBPPPokok)))
		}
		if f.DiscountBPPSKS > 0 {
			b.WriteString(row("&nbsp;&nbsp;Potongan BPP SKS", formatRupiah(f.DiscountBPPSKS)))
		}
	}

	return b.String()
}

func buildBiayaRowsS2(f *S2FeeBreakdown) string {
	var b strings.Builder

	b.WriteString(sectionHeader("A. Biaya Pendidikan Program Magister"))
	b.WriteString(row("&nbsp;&nbsp;Total Biaya Kuliah", formatRupiah(f.TotalTuition)))
	if f.IsMatriculation {
		b.WriteString(row("&nbsp;&nbsp;Biaya Matrikulasi", formatRupiah(f.MatriculationFee)))
	}

	b.WriteString(sectionHeader("B. Rencana Pembayaran per Semester"))
	b.WriteString(row("&nbsp;&nbsp;Semester 1", formatRupiah(f.Semester1)))
	b.WriteString(row("&nbsp;&nbsp;Semester 2", formatRupiah(f.Semester2)))
	b.WriteString(row("&nbsp;&nbsp;Semester 3", formatRupiah(f.Semester3)))

	return b.String()
}

func GenerateHTML(d *LoaData) (string, error) {
	if d.FeeS1 == nil && d.FeeS2 == nil {
		return "", fmt.Errorf("loa: fee breakdown not set on LoaData")
	}

	var biayaRows string
	var totalPotongan, totalBayar string

	if d.FeeS1 != nil {
		biayaRows = buildBiayaRowsS1(d.FeeS1)
		totalPotongan = formatRupiah(d.FeeS1.TotalDiscount)
		totalBayar = formatRupiah(d.FeeS1.TotalPayable)
	} else {
		biayaRows = buildBiayaRowsS2(d.FeeS2)
		totalPotongan = formatRupiah(0)
		totalBayar = formatRupiah(d.FeeS2.TotalPayable)
	}

	cicilanMinimal := d.TanggalDeadline
	if d.FeeS1 != nil {
		minAmount := d.FeeS1.TotalPayable
		if minAmount > 3_000_000 {
			minAmount = 3_000_000
		}
		cicilanMinimal = formatRupiah(minAmount)
	}

	kelasLabel := d.KelasKuliah
	if kelasLabel == "PAGI" {
		kelasLabel = "Kelas Pagi"
	} else if kelasLabel == "MALAM" {
		kelasLabel = "Kelas Malam"
	}

	html := loaHTMLTemplate
	html = strings.ReplaceAll(html, "{{__BIAYA_ROWS__}}", biayaRows)
	html = strings.ReplaceAll(html, "{{__LOGO_BASE64__}}", "./uib-192.png")
	html = strings.ReplaceAll(html, "{{nomorDaftar}}", d.NomorDaftar)
	html = strings.ReplaceAll(html, "{{nomorSurat}}", d.NomorSurat)
	html = strings.ReplaceAll(html, "{{tahunAkademik}}", d.TahunAkademik)
	html = strings.ReplaceAll(html, "{{namaLengkap}}", d.NamaLengkap)
	html = strings.ReplaceAll(html, "{{namaSekolah}}", d.NamaSekolah)
	html = strings.ReplaceAll(html, "{{gelombang}}", d.Gelombang)
	html = strings.ReplaceAll(html, "{{tempatUjian}}", d.TempatUjian)
	html = strings.ReplaceAll(html, "{{tanggalUjian}}", d.TanggalUjian)
	html = strings.ReplaceAll(html, "{{namaBeasiswa}}", d.NamaBeasiswa)
	html = strings.ReplaceAll(html, "{{prodi}}", d.Prodi)
	html = strings.ReplaceAll(html, "{{kelasKuliah}}", kelasLabel)
	html = strings.ReplaceAll(html, "{{totalPotongan}}", totalPotongan)
	html = strings.ReplaceAll(html, "{{totalBayar}}", totalBayar)
	html = strings.ReplaceAll(html, "{{tanggalDeadline}}", d.TanggalDeadline)
	html = strings.ReplaceAll(html, "{{namaBank}}", d.NamaBank)
	html = strings.ReplaceAll(html, "{{noRekening}}", d.NoRekening)
	html = strings.ReplaceAll(html, "{{atasNama}}", d.AtasNama)
	html = strings.ReplaceAll(html, "{{cicilanMinimal}}", cicilanMinimal)
	html = strings.ReplaceAll(html, "{{cicilanDeadline}}", d.CicilanDeadline)
	html = strings.ReplaceAll(html, "{{tanggalSurat}}", d.TanggalSurat)

	return html, nil
}

const loaHTMLTemplate = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surat Hasil USM - {{nomorDaftar}}</title>
  <style>
:root{--primary:#1a3e6f;--accent:#e6a000;--green:#28a745;--border:#dee2e6;--text:#212529}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Georgia","Times New Roman",serif;font-size:13pt;line-height:1.6;color:var(--text);background:#e9ecef;display:flex;justify-content:center;align-items:flex-start;min-height:100vh;padding:30px 20px}
.letter{max-width:800px;width:100%;background:white;padding:50px 60px;box-shadow:0 .5rem 1.5rem rgba(0,0,0,.05);border-radius:4px;border-top:6px solid var(--primary)}
.print-btn{position:fixed;top:20px;right:20px;background:var(--primary);color:white;border:none;border-radius:6px;padding:10px 22px;font-size:13pt;cursor:pointer;font-family:sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.2);z-index:100}
.print-btn:hover{background:#122d52}
.header{display:flex;align-items:flex-start;gap:20px;margin-bottom:25px}
.logo{flex:0 0 90px}.logo img{width:100%;height:auto;border-radius:8px}
.school-info{flex:1;font-size:10pt;line-height:1.6}
.school-info strong{font-size:14pt;display:block;margin-bottom:4px;color:var(--primary);letter-spacing:.5px}
hr{border:none;border-top:2px solid var(--primary);margin:20px 0 25px;opacity:.8}
.meta-info{margin-bottom:20px}.meta-row{display:flex;margin-bottom:4px;font-size:12pt}
.meta-label{min-width:110px;font-weight:bold;color:#333}.meta-value{flex:1}
.addressee{margin:20px 0 15px}.addressee p{margin:4px 0}
.salutation{margin:10px 0 20px;font-weight:bold;color:var(--primary)}
.congrats{text-align:center;margin:30px 0}
.congrats-line{font-size:18pt;font-weight:bold;text-transform:uppercase;letter-spacing:2px;color:var(--primary)}
.congrats-lulus{font-size:38pt;font-weight:bold;color:var(--green);letter-spacing:6px;margin:10px 0}
.exam-detail{font-size:13pt;margin:10px 0 25px;line-height:1.6}
.section-title{font-weight:bold;margin:20px 0 10px;font-size:13pt;color:var(--primary);border-bottom:1px solid var(--border);padding-bottom:4px}
table.biaya{width:100%;border-collapse:collapse;margin:15px 0 25px;font-size:11pt;background:white}
table.biaya th{background:var(--primary);color:white;padding:12px 10px;text-align:left;font-weight:600}
table.biaya th:last-child{text-align:right}
table.biaya td{padding:10px;border-bottom:1px solid var(--border);vertical-align:middle}
table.biaya td:last-child{text-align:right;font-weight:500}
table.biaya tr.section-header td{background:#f1f3f5;font-weight:bold;color:var(--primary);padding:10px;border-top:2px solid var(--primary)}
table.biaya tfoot tr.tot td{font-weight:bold;border-top:2px solid var(--primary);padding:12px 10px;font-size:13pt}
table.biaya tfoot tr.tot td:last-child{text-align:right}
table.biaya tfoot tr.tot-highlight td{background:#d4edda;color:#155724;font-size:14pt}
.payment-instruction{margin:20px 0;padding-left:25px;line-height:1.8}.payment-instruction li{margin-bottom:10px}
.note-box{background:#fff3cd;border-left:5px solid var(--accent);padding:15px 20px;margin:25px 0;border-radius:0 6px 6px 0;font-size:11pt;color:#856404}
.contact-info{margin:25px 0 15px;font-size:12pt;line-height:1.6}
.signature{display:flex;justify-content:flex-end;margin-top:50px;text-align:center;font-size:12pt}
.signature .position{margin-top:60px;font-weight:bold;color:var(--primary)}
@media print{body{background:white;padding:0}.letter{box-shadow:none;border-radius:0;border-top:none;padding:15mm 20mm}.print-btn{display:none!important}}
@media(max-width:600px){.letter{padding:30px 20px}.header{flex-direction:column;align-items:center}}
  </style>
</head>
<body>

<div class="letter">

  <div class="header">
    <div class="logo">
      <img src="{{__LOGO_BASE64__}}" alt="Logo UIB" onerror="this.style.display='none'"/>
    </div>
    <div class="school-info">
      <strong>Universitas Internasional Batam</strong>
      Jl. Gajah Mada, Baloi-Sei Ladi, Tiban Indah, Kec. Sekupang<br/>
      Kota Batam, Kepulauan Riau 29426 &nbsp;|&nbsp; www.uib.ac.id<br/>
      Tel +62 778 743 7111 &nbsp;|&nbsp; humas@uib.ac.id
    </div>
  </div>

  <hr/>

  <div class="meta-info">
    <div class="meta-row">
      <span class="meta-label">Nomor</span>
      <span class="meta-value">: {{nomorSurat}}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Perihal</span>
      <span class="meta-value">: Hasil Ujian Saringan Masuk Mahasiswa Baru TA {{tahunAkademik}}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Lampiran</span>
      <span class="meta-value">: 1 bundel</span>
    </div>
  </div>

  <div class="addressee">
    <p>Yth. Sdr/i <strong>{{namaLengkap}}</strong> / No Pendaftaran: <strong>{{nomorDaftar}}</strong></p>
    <p>Siswa/i {{namaSekolah}}</p>
  </div>

  <p class="salutation">Dengan Hormat,</p>

  <div class="congrats">
    <div class="congrats-line">SELAMAT, Saudara/i dinyatakan</div>
    <div class="congrats-lulus">LULUS</div>
    <div class="exam-detail">
      Ujian Saringan Masuk Universitas Internasional Batam<br/>
      <strong>{{gelombang}}</strong> &#8212; TA {{tahunAkademik}}<br/>
      Di <strong>{{tempatUjian}}</strong> pada <strong>{{tanggalUjian}}</strong>
    </div>
  </div>

  <p>Untuk terdaftar sebagai mahasiswa/i <strong>{{namaBeasiswa}}</strong>
  Program Studi <strong>{{prodi}}, {{kelasKuliah}}</strong>, mohon cermati informasi berikut:</p>

  <div class="section-title">1. Rincian Biaya</div>
  <table class="biaya">
    <thead>
      <tr>
        <th>KETERANGAN KOMPONEN BIAYA</th>
        <th>JUMLAH</th>
      </tr>
    </thead>
    <tbody>
      {{__BIAYA_ROWS__}}
    </tbody>
    <tfoot>
      <tr class="tot">
        <td>TOTAL POTONGAN BEASISWA</td>
        <td>{{totalPotongan}}</td>
      </tr>
      <tr class="tot tot-highlight">
        <td>TOTAL YANG HARUS DIBAYAR</td>
        <td>{{totalBayar}}</td>
      </tr>
    </tfoot>
  </table>

  <div class="section-title">2. Petunjuk Daftar Ulang</div>
  <ol class="payment-instruction">
    <li>
      Lakukan pembayaran paling lambat <strong>{{tanggalDeadline}}</strong> melalui:<br/><br/>
      Bank: <strong>{{namaBank}}</strong> &nbsp;|&nbsp;
      No. Rekening: <strong>{{noRekening}}</strong> &nbsp;|&nbsp;
      Atas Nama: <strong>{{atasNama}}</strong>
    </li>
    <li>
      Pembayaran minimal sebesar <strong>{{cicilanMinimal}},-</strong>.
      Sisa tagihan dapat dicicil per bulan hingga <strong>{{cicilanDeadline}}</strong>
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

  <div class="signature">
    <div>
      <p>Batam, {{tanggalSurat}}</p>
      <div class="position">
        <p>Panitia PMB Universitas Internasional Batam</p>
        <p>TA {{tahunAkademik}}</p>
      </div>
    </div>
  </div>

</div>
</body>
</html>`
