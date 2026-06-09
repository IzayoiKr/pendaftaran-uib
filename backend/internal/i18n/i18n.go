package i18n

import (
	"embed"
	"encoding/json"
	"strings"
)

//go:embed locales/*.json
var localeFS embed.FS

var configs = make(map[string]map[string]map[string]string)

func init() {
	for _, lang := range []string{"id", "en"} {
		file, err := localeFS.Open("locales/" + lang + ".json")
		if err != nil {
			continue
		}
		var cfg map[string]map[string]string
		if err := json.NewDecoder(file).Decode(&cfg); err == nil {
			configs[lang] = cfg
		}
		file.Close()
	}
}

func T(key, lang string, replacements ...string) string {
	parts := strings.SplitN(key, ".", 2)
	if len(parts) < 2 {
		return key
	}
	category, subKey := parts[0], parts[1]

	cfg, ok := configs[lang]
	if !ok {
		cfg = configs["id"]
	}

	var msg string
	if block, ok := cfg[category]; ok {
		if val, exists := block[subKey]; exists {
			msg = val
		}
	}
	if msg == "" {
		return key
	}

	if len(replacements) > 0 {
		if fieldBlock, hasFields := cfg["field"]; hasFields {
			for i := 0; i < len(replacements); i += 2 {
				if i+1 < len(replacements) {
					rawValue := replacements[i+1]
					if friendlyLabel, found := fieldBlock[rawValue]; found {
						replacements[i+1] = friendlyLabel
					}
				}
			}
		}

		replacer := strings.NewReplacer(replacements...)
		msg = replacer.Replace(msg)
	}

	return msg
}
