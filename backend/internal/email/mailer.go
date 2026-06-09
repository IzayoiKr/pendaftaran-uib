package email

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"
	"log/slog"
	"os"
	"strconv"

	"github.com/vanng822/go-premailer/premailer"
	gomail "gopkg.in/mail.v2"
)

//go:embed templates
var templateFS embed.FS

type emailData struct {
	FullName string
	URL      string
	CSS      template.CSS
}

var (
	host       string
	port       int
	user       string
	pass       string
	from       string
	appURL     string
	disableTLS bool

	verifyTmpl *template.Template
	resetTmpl  *template.Template
	css        template.CSS
)

func InitMailer() error {
	var missing []string

	req := func(key string) string {
		v := os.Getenv(key)
		if v == "" {
			missing = append(missing, key)
		}
		return v
	}

	smtpHost := req("SMTP_HOST")
	smtpPort := req("SMTP_PORT")
	smtpFrom := req("SMTP_FROM")
	appURLEnv := req("APP_URL")

	if len(missing) > 0 {
		return fmt.Errorf("missing required email env vars: %v", missing)
	}

	p, err := strconv.Atoi(smtpPort)
	if err != nil {
		return fmt.Errorf("SMTP_PORT must be an integer, got %q", smtpPort)
	}

	cssBytes, err := templateFS.ReadFile("templates/styles.css")
	if err != nil {
		return fmt.Errorf("reading email CSS: %w", err)
	}

	vt, err := template.New("").ParseFS(
		templateFS,
		"templates/base.html",
		"templates/verify.html",
	)
	if err != nil {
		return fmt.Errorf("parse verify email template: %w", err)
	}

	rt, err := template.New("").ParseFS(
		templateFS,
		"templates/base.html",
		"templates/reset.html",
	)
	if err != nil {
		return fmt.Errorf("parse reset email template: %w", err)
	}

	host = smtpHost
	port = p
	user = os.Getenv("SMTP_USERNAME")
	pass = os.Getenv("SMTP_PASSWORD")
	from = smtpFrom
	appURL = appURLEnv
	disableTLS = os.Getenv("SMTP_DISABLE_TLS") == "true"
	verifyTmpl = vt
	resetTmpl = rt
	css = template.CSS(cssBytes)

	return nil
}

func render(tmpl *template.Template, data emailData) (string, error) {
	var buf bytes.Buffer
	if err := tmpl.ExecuteTemplate(&buf, "base", data); err != nil {
		return "", fmt.Errorf("execute template: %w", err)
	}

	prem, err := premailer.NewPremailerFromString(buf.String(), premailer.NewOptions())
	if err != nil {
		return "", fmt.Errorf("create premailer: %w", err)
	}

	inlined, err := prem.Transform()
	if err != nil {
		return "", fmt.Errorf("premailer transform: %w", err)
	}

	return inlined, nil
}

func send(to, subject, htmlBody string) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", from)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", htmlBody)

	dialer := gomail.NewDialer(host, port, user, pass)

	if disableTLS {
		dialer.SSL = false
		dialer.TLSConfig = nil
	}

	if user == "" {
		dialer.Auth = nil
	}

	if err := dialer.DialAndSend(msg); err != nil {
		slog.Error("email send failed",
			"to", to,
			"subject", subject,
			"error", err,
		)
		return fmt.Errorf("send email: %w", err)
	}

	slog.Info("email sent", "to", to, "subject", subject)
	return nil
}

func SendVerificationEmail(toEmail, fullName, rawToken string) error {
	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", appURL, rawToken)
	data := emailData{
		FullName: fullName,
		URL: verifyURL,
		CSS: css,
	}

	html, err := render(verifyTmpl, data)
	if err != nil {
		return fmt.Errorf("render verification email: %w", err)
	}

	return send(toEmail, "Verifikasi Email — Universitas Internasional Batam", html)
}

func SendPasswordResetEmail(toEmail, fullName, rawToken string) error {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", appURL, rawToken)
	data := emailData{
		FullName: fullName,
		URL: resetURL,
		CSS: css,
	}

	html, err := render(resetTmpl, data)
	if err != nil {
		return fmt.Errorf("render reset email: %w", err)
	}

	return send(toEmail, "Reset Password — Universitas Internasional Batam", html)
}
