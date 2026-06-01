package models

type DocType string

const (
	DocPP                 DocType = "pp"
	DocKTP                DocType = "ktp"
	DocKK                 DocType = "kk"
	DocTranskripNilai     DocType = "transkripNilai"
	DocIjazahDok          DocType = "ijazahDok"
	DocSktmKip            DocType = "sktmKip"
	DocFotoRumah          DocType = "fotoRumah"
	DocTagihanListrik     DocType = "tagihanListrik"
	DocTagihanAir         DocType = "tagihanAir"
	DocSertifikatPrestasi DocType = "sertifikatPrestasi"
	DocRapot1             DocType = "rapot1"
	DocRapot2             DocType = "rapot2"
	DocRapot3             DocType = "rapot3"
	DocRapot4             DocType = "rapot4"
	DocAL                 DocType = "al"
	DocR1                 DocType = "r1"
	DocR2                 DocType = "r2"
	DocPaymentProof 	  DocType = "paymentProof"
)

func (f *RegistrationForm) IsValidDocumentField(dt DocType) bool {
	switch dt {
	case DocPP, 
	     DocKTP, 
	     DocKK, 
	     DocTranskripNilai, 
	     DocIjazahDok, 
	     DocSktmKip, 
	     DocFotoRumah, 
	     DocTagihanListrik, 
	     DocTagihanAir, 
	     DocSertifikatPrestasi, 
	     DocRapot1, 
	     DocRapot2, 
	     DocRapot3, 
	     DocRapot4, 
	     DocAL, 
	     DocR1, 
		 DocR2,
		 DocPaymentProof:
		return true
	default:
		return false
	}
}

func stringPtr(s string) *string {
	return &s
}

func (f *RegistrationForm) SetDocumentField(dt DocType, val string) bool {
	ptr := stringPtr(val)
	switch dt {
	case DocPP:                 f.Pp = ptr; return true
	case DocKTP:                f.Ktp = ptr; return true
	case DocKK:                 f.Kk = ptr; return true
	case DocTranskripNilai:     f.TranskripNilai = ptr; return true
	case DocIjazahDok:          f.IjazahDok = ptr; return true
	case DocSktmKip:            f.SktmKip = ptr; return true
	case DocFotoRumah:          f.FotoRumah = ptr; return true
	case DocTagihanListrik:     f.TagihanListrik = ptr; return true
	case DocTagihanAir:         f.TagihanAir = ptr; return true
	case DocSertifikatPrestasi: f.SertifikatPrestasi = ptr; return true
	case DocRapot1:             f.Rapot1 = ptr; return true
	case DocRapot2:             f.Rapot2 = ptr; return true
	case DocRapot3:             f.Rapot3 = ptr; return true
	case DocRapot4:             f.Rapot4 = ptr; return true
	case DocAL:                 f.Al = ptr; return true
	case DocR1:                 f.R1 = ptr; return true
	case DocR2:                 f.R2 = ptr; return true
	case DocPaymentProof:		f.PaymentProof = ptr; return true
	default:                    return false
	}
}

func (f *RegistrationForm) GetDocumentFieldPointer(dt DocType) (*string, bool) {
	switch dt {
	case DocPP:                 return f.Pp, true
	case DocKTP:                return f.Ktp, true
	case DocKK:                 return f.Kk, true
	case DocTranskripNilai:     return f.TranskripNilai, true
	case DocIjazahDok:          return f.IjazahDok, true
	case DocSktmKip:            return f.SktmKip, true
	case DocFotoRumah:          return f.FotoRumah, true
	case DocTagihanListrik:     return f.TagihanListrik, true
	case DocTagihanAir:         return f.TagihanAir, true
	case DocSertifikatPrestasi: return f.SertifikatPrestasi, true
	case DocRapot1:             return f.Rapot1, true
	case DocRapot2: 			return f.Rapot2, true
	case DocRapot3: 			return f.Rapot3, true
	case DocRapot4: 			return f.Rapot4, true
	case DocAL:     			return f.Al, true
	case DocR1:     			return f.R1, true
	case DocR2:     			return f.R2, true
	case DocPaymentProof:		return f.PaymentProof, true
	default:        			return nil, false
	}
}
