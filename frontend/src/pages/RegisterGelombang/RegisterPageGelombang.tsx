import { useState } from "react";
import { useParams } from "react-router-dom";
import { events } from "../../constants/data";
import Step1S1 from "./Step1S1";
// import Step1S2 from "./Step1S2";

export default function RegisterPageGelombang() {
  const { id } = useParams();
  const event = events.find(e => e.id === id);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const next = () => setStep(prev => prev + 1);

  if (!event) return <div>Data tidak ditemukan</div>;

  return (
    <div id="register" className="page-content">
      {step === 1 && event.programType === "Program Sarjana" && (
        <div className="register-box">
          <Step1S1
            formData={formData}
            setFormData={setFormData}
            next={next}
          />
        </div>
      )}

      {/* {step === 1 && event.programType === "Program Magister" && (
        <div className="register-box">
          <Step1S2
            formData={formData}
            setFormData={setFormData}
            next={next}
            event={event}
          />
        </div>
      )} */}
    </div>
  );
}

