package receipt

import (
	"bytes"
	_ "embed"
	"encoding/base64"
	"fmt"
	"html/template"
)

//go:embed receipt.css
var cssTemplate string

//go:embed receipt.html
var htmlTemplate string

//go:embed uib-192.png
var logoBytes []byte

var logoDataURI string

func init() {
	b64 := base64.StdEncoding.EncodeToString(logoBytes)
	logoDataURI = fmt.Sprintf("data:image/png;base64,%s", b64)
}

func formatRupiah(n uint64) string {
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

func GenerateHTML(d *ReceiptData) (string, error) {
	funcMap := template.FuncMap{
		"formatRupiah": formatRupiah,
		"safe": func(s string) template.HTML {
			return template.HTML(s)
		},
	}

	tmpl, err := template.New("receipt").Funcs(funcMap).Parse(htmlTemplate)
	if err != nil {
		return "", err
	}

	templateData := struct {
		*ReceiptData
		CSS         template.CSS
		LogoDataURI template.URL
	}{
		ReceiptData: d,
		CSS:         template.CSS(cssTemplate),
		LogoDataURI: template.URL(logoDataURI),
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, templateData); err != nil {
		return "", err
	}

	return buf.String(), nil
}
