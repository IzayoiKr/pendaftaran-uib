package audit

import (
	"net/http"
	"pendaftaran-uib/backend/internal/utils"

	"github.com/go-chi/chi/v5/middleware"
)

func EntryFromRequest(r *http.Request) Entry {
	return Entry{
		IP: utils.RealIP(r),
		UserAgent: r.Header.Get("User-Agent"),
		RequestID: middleware.GetReqID(r.Context()),
	}
}
