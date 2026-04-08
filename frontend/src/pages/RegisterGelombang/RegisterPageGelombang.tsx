import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Wajib ditambahkan
import { events } from "../../constants/data";
import { getStoredUser } from "../../api"; // Ambil data session user
import { toast } from "sonner"; // Notifikasi

import Step1S1 from "./Step1S1";
import Step2S1 from "./Step2S1";

import Step1S2 from "./Step1S2";
import StepParentS2 from "./StepParentS2";
import Step2S2 from "./Step2S2";

import Step3DoneS1 from "./Step3DoneS1";
import Step3DoneS2 from "./Step3DoneS2";

import type { ComponentType } from "react";

export default function RegisterPageGelombang() {
  const { id } = useParams();
  const navigate = useNavigate(); // Untuk memindahkan user
  const event = events.find(e => e.id === id);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});

  if (!event) return <div>Data tidak ditemukan</div>;

  const isS1 = event.programType === "Program Sarjana";

  const flow = isS1
    ? [Step1S1, Step2S1, Step3DoneS1]
    : [Step1S2, StepParentS2, Step2S2, Step3DoneS2];

  const totalStep = flow.length;
  const CurrentStep = flow[step - 1] as ComponentType<any>;

  const next = () => {
    if (step < totalStep) setStep(s => s + 1);
  };

  const prev = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const goToStep = (n: number) => {
    if (n <= step) setStep(n);
  };

  // INI ADALAH FUNGSI YANG AKAN BERJALAN SAAT TOMBOL SUBMIT FINAL DITEKAN
  const submitFinal = () => {
    const user = getStoredUser();
    if (!user) {
        toast.error("Sesi telah habis, silakan login kembali.");
        navigate("/login");
        return;
    }

    // Menggabungkan pilihan 1, 2, dan 3 menjadi teks rapi (dipisah koma)
    const prodiChoices = [formData.prodipil, formData.prodipil2, formData.prodipil3]
        .filter(Boolean)
        .join(", ");

    // Membuat objek struktur tabel untuk Akun Saya
    const newRegistration = {
        nomorDaftar: "REG" + Math.floor(100000 + Math.random() * 900000), // Random ID contoh: REG847192
        periode: new Date().getFullYear(),
        gelombang: event.title,
        jurusan: prodiChoices || "Belum Memilih Program Studi",
        biodata: "Telah Lengkap",
        pembayaran: "Belum Lunas",
        usm: "Menunggu Jadwal",
        passwordUSM: "-"
    };

    // Menyimpan ke Local Storage dengan Key Spesifik ke User ID yang sedang login
    const storageKey = `registrations_${user.id}`;
    const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
    existing.push(newRegistration);
    localStorage.setItem(storageKey, JSON.stringify(existing));

    // Menampilkan Notifikasi Sukses dan Pindah ke Halaman Akun Saya
    toast.success("Pendaftaran berhasil disubmit!");
    navigate("/account");
  };

  return (
    <div id="register" className="page-content">
      <CurrentStep
        formData={formData}
        setFormData={setFormData}
        next={next}
        prev={prev}
        submit={next}
        submitFinal={submitFinal} // Lempar fungsi ini ke Step3DoneS1
        goToStep={goToStep}
        currentStep={step}
        totalStep={totalStep}
      />
    </div>
  );
}
