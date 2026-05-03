import {
  PENDIDIKAN_OPTIONS,
  PEKERJAAN_OPTIONS,
  PENGHASILAN_OPTIONS,
  STATUS_ORANG_TUA_OPTIONS,
} from "@/constants/registerOptions";

export type ParentType = "ayah" | "ibu";

export const PARENT_SECTIONS = [
  {
    type: "ayah",
    title: "BIODATA AYAH (BIOLOGICAL FATHER)",

    fields: {
      nik:        "nik_ayah",
      nama:       "nama_ayah",
      tgl:        "tanggallahir_ayah",
      telp:       "notelp_ayah",
      pendidikan: "pendidikan_ayah",
      pekerjaan:  "pekerjaan_ayah",
      penghasilan:"penghasilan_ayah",
      stat:       "status_ayah",
    },

    labels: {
      nik:        "NIK Ayah (Father's National Identification Number)",
      nama:       "Nama Ayah (Father's Name) *",
      tgl:        "Tanggal Lahir Ayah (Father's Date of Birth)",
      telp:       "No Telepon Ayah (Father's Phone Number) *",
      pendidikan: "Pendidikan Terakhir Ayah (Father's Highest Education)",
      pekerjaan:  "Pekerjaan Ayah (Father's Occupation)",
      penghasilan:"Pendapatan Ayah (Father's Income)",
      stat:       "Status Ayah (Father's Vital Status)",
    },
  },

  {
    type: "ibu",
    title: "BIODATA IBU (BIOLOGICAL MOTHER)",

    fields: {
      nik:        "nik_ibu",
      nama:       "nama_ibu",
      tgl:        "tanggallahir_ibu",
      telp:       "notelp_ibu",
      pendidikan: "pendidikan_ibu",
      pekerjaan:  "pekerjaan_ibu",
      penghasilan:"penghasilan_ibu",
      stat:       "status_ibu",
    },

    labels: {
      nik:        "NIK Ibu (Mother's National Identification Number)",
      nama:       "Nama Ibu (Mother's Name) *",
      tgl:        "Tanggal Lahir Ibu (Mother's Date of Birth)",
      telp:       "No Telepon Ibu (Mother's Phone Number) *",
      pendidikan: "Pendidikan Terakhir Ibu (Mother's Highest Education)",
      pekerjaan:  "Pekerjaan Ibu (Mother's Occupation)",
      penghasilan:"Pendapatan Ibu (Mother's Income)",
      stat:       "Status Ibu (Mother's Vital Status)",
    },
  },
] as const;

export const EXTRA_FIELDS = [
  {
    name: "alamat_ortu",
    label: "Alamat OrangTua (Parents' Home Address)",
    placeholder: "Masukkan alamat lengkap orang tua",
    helper: "Masukkan alamat lengkap sesuai domisili orang tua",
  },
] as const;

export const PARENT_SELECT_FIELDS = [
  {
    fieldKey: "pendidikan",
    options: PENDIDIKAN_OPTIONS,
    placeholder: "Pendidikan Terakhir (Highest Education)",
    helper: "Pendidikan formal terakhir",
  },
  {
    fieldKey: "pekerjaan",
    options: PEKERJAAN_OPTIONS,
    placeholder: "Pekerjaan (Occupation)",
    helper: "Pekerjaan utama saat ini",
  },
  {
    fieldKey: "penghasilan",
    options: PENGHASILAN_OPTIONS,
    placeholder: "Pendapatan (Income)",
    helper: "Perkiraan penghasilan per bulan",
  },
  {
    fieldKey: "stat",
    options: STATUS_ORANG_TUA_OPTIONS,
    placeholder: "Status (Vital Status)",
    helper: "Status hidup atau meninggal",
  },
] as const;