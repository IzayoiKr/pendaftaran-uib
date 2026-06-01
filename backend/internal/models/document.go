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
	DocPaymentProof       DocType = "paymentProof"
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

func (f *RegistrationForm) SetDocumentField(dt DocType, val string) bool {
	switch dt {
	case DocPP:                 f.Pp = val; return true
	case DocKTP:                f.Ktp = val; return true
	case DocKK:                 f.Kk = val; return true
	case DocTranskripNilai:     f.TranskripNilai = val; return true
	case DocIjazahDok:          f.IjazahDok = val; return true
	case DocSktmKip:            f.SktmKip = val; return true
	case DocFotoRumah:          f.FotoRumah = val; return true
	case DocTagihanListrik:     f.TagihanListrik = val; return true
	case DocTagihanAir:         f.TagihanAir = val; return true
	case DocSertifikatPrestasi: f.SertifikatPrestasi = val; return true
	case DocRapot1:             f.Rapot1 = val; return true
	case DocRapot2:             f.Rapot2 = val; return true
	case DocRapot3:             f.Rapot3 = val; return true
	case DocRapot4:             f.Rapot4 = val; return true
	case DocAL:                 f.Al = val; return true
	case DocR1:                 f.R1 = val; return true
	case DocR2:                 f.R2 = val; return true
	case DocPaymentProof:       f.PaymentProof = val; return true
	default:                    return false
	}
}

func (f *RegistrationForm) GetDocumentFieldValue(dt DocType) (string, bool) {
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
	case DocRapot2:             return f.Rapot2, true
	case DocRapot3:             return f.Rapot3, true
	case DocRapot4:             return f.Rapot4, true
	case DocAL:                 return f.Al, true
	case DocR1:                 return f.R1, true
	case DocR2:                 return f.R2, true
	case DocPaymentProof:       return f.PaymentProof, true
	default:                    return "", false
	}
}
