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
	URL string
	CSS template.CSS
}

type Mailer struct {
	host string
	port int
	user string
	pass string
	from string
	appURL string
	disableTLS bool

	verifyTmpl *template.Template
	resetTmpl *template.Template
	css template.CSS
}

func NewMailer() (*Mailer, error) {
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
	appURL := req("APP_URL")

	if len(missing) > 0 {
		return nil, fmt.Errorf("missing required email env vars: %v", missing)
	}

	port, err := strconv.Atoi(smtpPort)
	if err != nil {
		return nil, fmt.Errorf("SMTP_PORT must be an integer, got %q", smtpPort)
	}

	cssBytes, err := templateFS.ReadFile("templates/styles.css")
	if err != nil {
		return nil, fmt.Errorf("reading email CSS: %w", err)
	}

	verifyTmpl, err := template.New("").ParseFS(
		templateFS,
		"templates/base.html",
		"templates/verify.html",
	)
	if err != nil {
		return nil, fmt.Errorf("parse verify email template: %w", err)
	}

	resetTmpl, err := template.New("").ParseFS(
		templateFS,
		"templates/base.html",
		"templates/reset.html",
	)
	if err != nil {
		return nil, fmt.Errorf("parse reset email template: %w", err)
	}

	return &Mailer{
		host: smtpHost,
		port: port,
		user: os.Getenv("SMTP_USERNAME"),
		pass: os.Getenv("SMTP_PASSWORD"),
		from: smtpFrom,
		appURL: appURL,
		disableTLS: os.Getenv("SMTP_DISABLE_TLS") == "true",
		verifyTmpl: verifyTmpl,
		resetTmpl: resetTmpl,
		css: template.CSS(cssBytes),
	}, nil
}

func (m *Mailer) render(tmpl *template.Template, data emailData) (string, error) {
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

func (m *Mailer) send(to, subject, htmlBody string) error {
	msg := gomail.NewMessage()
	msg.SetHeader("From", m.from)
	msg.SetHeader("To", to)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", htmlBody)

	dialer := gomail.NewDialer(m.host, m.port, m.user, m.pass)

	if m.disableTLS {
		dialer.SSL = false
		dialer.TLSConfig = nil
	}

	if m.user == "" {
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

func (m *Mailer) SendVerificationEmail(toEmail, fullName, rawToken string) error {
	verifyURL := fmt.Sprintf("%s/verify-email?token=%s", m.appURL, rawToken)
	data := emailData{
		FullName: fullName,
		URL: verifyURL,
		CSS: m.css,
	}

	html, err := m.render(m.verifyTmpl, data)
	if err != nil {
		return fmt.Errorf("render verification email: %w", err)
	}

	return m.send(toEmail, "Verifikasi Email — Universitas Internasional Batam", html)
}

func (m *Mailer) SendPasswordResetEmail(toEmail, fullName, rawToken string) error {
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", m.appURL, rawToken)
	data := emailData{
		FullName: fullName,
		URL: resetURL,
		CSS: m.css,
	}

	html, err := m.render(m.resetTmpl, data)
	if err != nil {
		return fmt.Errorf("render reset email: %w", err)
	}

	return m.send(toEmail, "Reset Password — Universitas Internasional Batam", html)
}
