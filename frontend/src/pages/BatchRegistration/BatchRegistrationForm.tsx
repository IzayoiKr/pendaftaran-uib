"use client";

import dynamic from "next/dynamic";
import useBatchRegistrationForm from "./hooks/useBatchRegistrationForm";
import type { EventType, StepKey } from "@/validation/schemaform";

interface Props {
  registrationKey: string;
  event: EventType;
}

const loading = () => (
  <div
    style={{
      display: "grid",
      placeItems: "center",
      minHeight: "calc(100vh - var(--header-height,80px))",
      padding: "clamp(1rem,3vw,2rem)",
      textAlign: "center",
    }}
  >
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.4rem",
      }}
    >
      <div
        style={{
          width: "clamp(32px,5vw,42px)",
          height: "clamp(32px,5vw,42px)",
          border: "4px solid #e0e0e0",
          borderTop: "4px solid #1a56db",
          borderRadius: "50%",
          animation: "spin .8s linear infinite",
        }}
      />
      <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>
        Memuat formulir...
      </p>
    </div>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

type StepComponentMap = Record<
  StepKey,
  React.ComponentType<any> // keep for now (no blocker)
> & {
  fallback: React.ComponentType<any>;
};

const STEP_COMPONENTS: StepComponentMap = {
  Step1S1: dynamic(() => import("./steps/s1/Step1S1").then((m) => m.default), {
    ssr: false,
    loading,
  }),
  Step2S1: dynamic(() => import("./steps/s1/Step2S1").then((m) => m.default), {
    ssr: false,
    loading,
  }),
  StepDoneS1: dynamic(
    () => import("./steps/s1/StepDoneS1").then((m) => m.default),
    { ssr: false, loading }
  ),
  Step1S2: dynamic(() => import("./steps/s2/Step1S2").then((m) => m.default), {
    ssr: false,
    loading,
  }),
  Step2S2: dynamic(() => import("./steps/s2/Step2S2").then((m) => m.default), {
    ssr: false,
    loading,
  }),
  StepParentS2: dynamic(
    () => import("./steps/s2/StepParentS2").then((m) => m.default),
    { ssr: false, loading }
  ),
  StepDoneS2: dynamic(
    () => import("./steps/s2/StepDoneS2").then((m) => m.default),
    { ssr: false, loading }
  ),
  fallback: dynamic(() => import("./steps/fallback").then((m) => m.default), {
    ssr: false,
    loading,
  }),
};

export default function BatchRegistrationForm({ registrationKey, event }: Props) {
  const form = useBatchRegistrationForm({
    event,
    registrationKey,
    batchName: event.batchName ?? "",
  });

  const stepItem = form.flow[form.step - 1];

  const StepComponent = stepItem
    ? STEP_COMPONENTS[stepItem.key]
    : STEP_COMPONENTS.fallback;

  return (
    <div id="register" className="page-content">
    <StepComponent
      data={form.data}
      onResult={form.handleStepResult}
      goToStep={form.goToStep}
      currentStep={form.step}
      totalStep={form.totalStep}
      flow={form.flow}
      isSubmitting={form.isSubmitting} 
    />
    </div>
  );
}