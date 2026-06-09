package loa

import (
	_ "embed"
	"encoding/base64"
	"fmt"
	"strings"
)

//go:embed loa.css
var cssTemplate string

//go:embed loa.html
var htmlTemplate string

//go:embed uib-192.png
var logoBytes []byte

var logoDataURI string

func init() {
	b64 := base64.StdEncoding.EncodeToString(logoBytes)
	logoDataURI = fmt.Sprintf("data:image/png;base64,%s", b64)
}

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

	html := htmlTemplate
	html = strings.ReplaceAll(html, "{{__CSS__}}", cssTemplate)
	html = strings.ReplaceAll(html, "{{__LOGO_BASE64__}}", logoDataURI)
	html = strings.ReplaceAll(html, "{{__BIAYA_ROWS__}}", biayaRows)
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
