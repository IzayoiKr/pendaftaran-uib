package utils

import (
	"errors"
	"fmt"
	"reflect"
	"strconv"

	"pendaftaran-uib/backend/internal/i18n"

	"github.com/go-playground/validator/v10"
)

var validate *validator.Validate

func getStringValue(fl validator.FieldLevel) (string, bool) {
	val := fl.Field()
	if val.Kind() == reflect.Pointer {
		if val.IsNil() {
			return "", false
		}
		val = val.Elem()
	}

	if val.Kind() == reflect.String {
		return val.String(), true
	}
	return "", false
}

func InitValidator() error {
	v := validator.New()

	if err := v.RegisterValidation("alphanum_ascii", validateAlphanumASCII); err != nil {
		return fmt.Errorf("validator: register alphanum_ascii: %w", err)
	}

	if err := v.RegisterValidation("gpa", validateGpa); err != nil {
		return fmt.Errorf("validator: register gpa: %w", err)
	}

	if err := v.RegisterValidation("highschool_gpa", validateHighschoolGpa); err != nil {
		return fmt.Errorf("validator: register highschool_gpa: %w", err)
	}

	validate = v
	return nil
}

func validateAlphanumASCII(fl validator.FieldLevel) bool {
	s, ok := getStringValue(fl)
	if !ok || s == "" {
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

func validateGpa(fl validator.FieldLevel) bool {
	s, ok := getStringValue(fl)
	if !ok || s == "" {
		return true
	}
	if s[0] == ' ' || s[len(s)-1] == ' ' {
		return false
	}
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return false
	}
	return val >= 0.0 && val <= 4.0
}

func validateHighschoolGpa(fl validator.FieldLevel) bool {
	s, ok := getStringValue(fl)
	if !ok || s == "" {
		return true
	}
	if s[0] == ' ' || s[len(s)-1] == ' ' {
		return false
	}
	val, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return false
	}
	return val >= 0.0 && val <= 100.0
}

func ValidateStruct(s any, lang string) error {
	if validate == nil {
		return errors.New("validator not initialized")
	}

	if err := validate.Struct(s); err != nil {
		var ve validator.ValidationErrors
		if errors.As(err, &ve) {
			return errors.New(translateFieldError(ve[0], lang))
		}
		return err
	}

	return nil
}

func translateFieldError(fe validator.FieldError, lang string) string {
	key := "validation." + fe.Tag()

	replacements := []string{
		"{field}", fe.Field(),
	}

	if fe.Param() != "" {
		replacements = append(replacements, "{param}", fe.Param())

		if fe.Tag() == "nefield" {
			replacements = append(replacements, "{target}", fe.Param())
		}
	}

	msg := i18n.T(key, lang, replacements...)

	if msg == key {
		friendlyField := i18n.T("field."+fe.Field(), lang)
		return fmt.Sprintf("%s tidak valid (%s)", friendlyField, fe.Tag())
	}

	return msg
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
