"use client";

import dynamic from "next/dynamic";
import useBatchRegistrationForm from "./hooks/useBatchRegistrationForm";

import type {
  EventType,
  StepKey,
  BaseStepProps,
} from "@/validation/schemaform";

interface Props {
  registrationKey: string;
  event: EventType;
  nomorDaftar?: string;
  isEditMode?: boolean;
}

const loading = () => (
  <div className="pageLoader">
    <p>Memuat formulir...</p>
  </div>
);

type StepComponentMap = Record<
  StepKey,
  React.ComponentType<BaseStepProps>
> & {
  fallback: React.ComponentType<BaseStepProps>;
};

const STEP_COMPONENTS: StepComponentMap = {
  Step1S1: dynamic(() => import("./steps/s1/Step1S1"), {
    ssr: false,
    loading,
  }),

  Step2S1: dynamic(() => import("./steps/s1/Step2S1"), {
    ssr: false,
    loading,
  }),

  StepDoneS1: dynamic(() => import("./steps/s1/StepDoneS1"), {
    loading,
  }),

  Step1S2: dynamic(() => import("./steps/s2/Step1S2"), {
    ssr: false,
    loading,
  }),

  Step2S2: dynamic(() => import("./steps/s2/Step2S2"), {
    ssr: false,
    loading,
  }),

  StepParentS2: dynamic(
    () => import("./steps/s2/StepParentS2"),
    {
      ssr: false,
      loading,
    }
  ),

  StepDoneS2: dynamic(
    () => import("./steps/s2/StepDoneS2"),
    {
      loading,
    }
  ),

  fallback: dynamic(
    () => import("./steps/fallback"),
    {
      ssr: false,
      loading,
    }
  ),
};

export default function BatchRegistrationForm({
  registrationKey,
  event,
  nomorDaftar,
  isEditMode,
}: Props) {
  const form = useBatchRegistrationForm({
    event,
    registrationKey,
    batchName: event.batchName ?? "",
    nomorDaftar,
    isEditMode,
  });

  if (form.isLoadingExisting) {
    return loading();
  }

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
        filesWereLost={form.filesWereLost}
        isEditMode={form.isEditMode}
      />
    </div>
  );
}