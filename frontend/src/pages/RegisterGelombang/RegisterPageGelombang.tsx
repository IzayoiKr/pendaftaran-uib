import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { events } from "../../constants/data";
import { toast } from "sonner";
import useAuthStore from "../../store/useAuthStore";

import Step1S1 from "./Step1S1";
import Step2S1 from "./Step2S1";

import Step1S2 from "./Step1S2";
import StepParentS2 from "./StepParentS2";
import Step2S2 from "./Step2S2";

import Step3DoneS1 from "./Step3DoneS1";
import Step3DoneS2 from "./Step3DoneS2";

import type { ComponentType } from "react";

const PRODI_MAP: Record<string, string> = {
  "42": "Akuntansi (Accounting)",
  "12": "Arsitektur (Architecture)",
  "71": "Biologi (Biology)",
  "72": "Gizi (Nutrition)",
  "51": "Ilmu Hukum (Law Science)",
  "81": "Kedokteran (Medicine)",
  "41": "Manajemen (Management)",
  "46": "Pariwisata (Tourism)",
  "61": "Pendidikan Bahasa Inggris",
  "82": "Profesi Kedokteran (Medicine)",
  "31": "Sistem Informasi (Information System)",
  "11": "Teknik Sipil (Civil Engineering)",
  "32": "Teknologi Informasi (Information Technology)",
  "52": "Magister Hukum (Master of Law)",
  "44": "Magister Manajemen (Master of Management)"
};

export default function RegisterPageGelombang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = events.find(e => e.id === id);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  
  const user = useAuthStore((state) => state.user);

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

  const submitFinal = () => {

    if (!user) {
        toast.error("Your session has expired. Please log in again.");
        navigate("/login");
        return;
    }

    try {

        const prodiChoices = [formData.prodipil, formData.prodipil2, formData.prodipil3]
            .filter(Boolean)
            .map(code => PRODI_MAP[code as string] || code) // Translates "31" -> "Sistem Informasi"
            .join(", ");

        const newRegistration = {
            nomorDaftar: "REG" + Math.floor(100000 + Math.random() * 900000),
            periode: new Date().getFullYear(),
            gelombang: event.batchName,
            jurusan: prodiChoices || "Belum Memilih Program Studi",
            biodata: "Telah Lengkap",
            pembayaran: "Belum Lunas",
            usm: "Menunggu Jadwal",
            passwordUSM: "-"
        };

        const storageKey = `registrations_${user.id}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || "[]");
        existing.push(newRegistration);
        localStorage.setItem(storageKey, JSON.stringify(existing));

        toast.success("Registration submitted successfully!");
        navigate("/account"); 

    } catch (error) {
        console.error("Failed to submit registration:", error);
        toast.error("Failed to submit registration. Please try again.");
    }
  };

  return (
    <div id="register" className="page-content">
      <CurrentStep
        formData={formData}
        setFormData={setFormData}
        next={next}
        prev={prev}
        submit={next}
        submitFinal={submitFinal}
        goToStep={goToStep}
        currentStep={step}
        totalStep={totalStep}
      />
    </div>
  );
}
