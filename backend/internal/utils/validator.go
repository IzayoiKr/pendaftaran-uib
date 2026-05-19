package utils

import (
	"errors"
	"fmt"
	"reflect"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

var fieldLabels = map[string]string{
	"FullName": "Nama",
	"NIK": "NIK",
	"Email": "Email",
	"Password": "Password",
	"OldPassword": "Password Lama",
	"NewPassword": "Password Baru",
	"Token": "Link Verifikasi",
	"TurnstileToken": "Verifikasi CAPTCHA",
}

func fieldLabel(f string) string {
	if l, ok := fieldLabels[f]; ok {
		return l
	}
	return f
}

func InitValidator() error {
	v := validator.New()

	if err := v.RegisterValidation("alphanum_ascii", validateAlphanumASCII); err != nil {
		return fmt.Errorf("validator: register alphanum_ascii: %w", err)
	}

	validate = v
	return nil
}

func validateAlphanumASCII(fl validator.FieldLevel) bool {
	if fl.Field().Kind() != reflect.String {
		return false
	}

	s := fl.Field().String()
	// INFO: Allowing empty to be true, but it must be compose with `required`
	if s == "" {
		return true
	}
	for i := 0; i < len(s); i++ {
		c := s[i]
		if (c < 'a' || c > 'z') && (c < 'A' || c > 'Z') && (c < '0' || c > '9') {
			return false
		}
	}
	return true
}

func ValidateStruct(s any) error {
	if validate == nil {
		return errors.New("validator not initialized")
	}

	if err := validate.Struct(s); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			return errors.New(translateFieldError(ve[0]))
		}
		return err
	}

	return nil
}

func translateFieldError(fe validator.FieldError) string {
	f := fieldLabel(fe.Field())
	p := fe.Param()

	switch fe.Tag() {
	case "required":
		return fmt.Sprintf("%s wajib diisi", f)
	case "email":
		return fmt.Sprintf("format %s tidak valid", f)
	case "min":
		return fmt.Sprintf("%s minimal %s karakter", f, p)
	case "max":
		return fmt.Sprintf("%s maksimal %s karakter", f, p)
	case "alphanum_ascii":
		return fmt.Sprintf("%s hanya boleh mengandung huruf dan angka", f)
	case "nefield":
		return fmt.Sprintf("%s harus berbeda dari %s", f, fieldLabel(p))
	default:
		return fmt.Sprintf("%s tidak valid (%s)", f, fe.Tag())
	}
}

// INFO: This is reserved in case to split concern between NIK and passport
// func IsAllDigits(s string) bool {
// 	for i := 0; i < len(s); i++ {
// 		if s[i] < '0' || s[i] > '9' {
// 			return false
// 		}
// 	}
// 	return true
// }
