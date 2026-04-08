import { useState } from "react";
import { useParams } from "react-router-dom";
import { events } from "../../constants/data";

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

  const submitFinal = () => {
    console.log("FINAL SUBMIT:", formData);
    // TODO: fetch API / axios ke backend Laravel
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
