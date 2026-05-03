"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  EventType,
  FormDataS1,
  FormDataS2,
  StepItem,
  StepResultS1,
  StepResultS2,
} from "@/validation/schemaform";

/* =========================================================
   TYPES
========================================================= */

type FormStateS1 = { type: "S1"; data: Partial<FormDataS1> };
type FormStateS2 = { type: "S2"; data: Partial<FormDataS2> };
type FormState = FormStateS1 | FormStateS2;

interface HookArgs {
  event: EventType;
  registrationKey: string;
  batchName: string;
}

/* =========================================================
   FLOWS
========================================================= */

const S1_FLOW: StepItem[] = [
  { key: "Step1S1", label: "BIODATA DIRI", sub: "PERSONAL DATA" },
  { key: "Step2S1", label: "DOKUMEN", sub: "DOCUMENT" },
  { key: "StepDoneS1", label: "SELESAI", sub: "DONE" },
];

const S2_FLOW: StepItem[] = [
  { key: "Step1S2", label: "BIODATA", sub: "PERSONAL DATA" },
  { key: "StepParentS2", label: "ORANG TUA", sub: "PARENT DATA" },
  { key: "Step2S2", label: "DOKUMEN", sub: "DOCUMENT" },
  { key: "StepDoneS2", label: "SELESAI", sub: "DONE" },
];

/* =========================================================
   HOOK
========================================================= */

export default function useBatchRegistrationForm({
  event,
  registrationKey,
  batchName,
}: HookArgs) {
  const isS1 = event.programType === "Program Sarjana";
  const flow = isS1 ? S1_FLOW : S2_FLOW;

  /* ================= STATE ================= */

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormState>(() => {
    if (isS1) {
      return {
        type: "S1",
        data: {
          registrationKey,
          batchName,
        } as Partial<FormDataS1>,
      };
    }

    return {
      type: "S2",
      data: {
        registrationKey,
        batchName,
      } as Partial<FormDataS2>,
    };
  });

  /* ================= SYNC PRIMITIVES ================= */

  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    setFormData((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        registrationKey,
        batchName,
      },
    }));
  }, [registrationKey, batchName]);

  /* ================= TYPE-SAFE MERGE ================= */

  const mergeData = useCallback(
    (incoming: Partial<FormDataS1> | Partial<FormDataS2>) => {
      setFormData((prev) => {
        if (prev.type === "S1") {
          return {
            ...prev,
            data: {
              ...prev.data,
              ...(incoming as Partial<FormDataS1>),
            },
          };
        }

        return {
          ...prev,
          data: {
            ...prev.data,
            ...(incoming as Partial<FormDataS2>),
          },
        };
      });
    },
    []
  );

  /* ================= API ================= */

  const submitToApi = useCallback(
    async (incoming: Partial<FormDataS1> | Partial<FormDataS2>) => {
      const fd = new FormData();
      const merged = { ...formData.data, ...incoming };

      Object.entries(merged).forEach(([key, val]) => {
        if (val instanceof File) fd.append(key, val);
        else if (val !== undefined && val !== null)
          fd.append(key, String(val));
      });

      const res = await fetch("/api/register", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Submit failed");
    },
    [formData.data]
  );

  /* ================= ORCHESTRATOR ================= */

  const handleStepResult = useCallback(
    async (result: StepResultS1 | StepResultS2) => {
      if (result.action === "prev") {
        setStep((s) => Math.max(s - 1, 1));
        return;
      }

      // 🔥 TYPE GUARD BASED ON FLOW
      if (isS1) {
        const r = result as StepResultS1;

        if (r.action === "next") {
          mergeData(r.data);
          setStep((s) => Math.min(s + 1, flow.length));
          return;
        }

        if (r.action === "submit") {
          mergeData(r.data);

          setIsSubmitting(true);
          try {
            await submitToApi(r.data);
            setStep((s) => Math.min(s + 1, flow.length));
          } finally {
            setIsSubmitting(false);
          }
        }
      } else {
        const r = result as StepResultS2;

        if (r.action === "next") {
          mergeData(r.data);
          setStep((s) => Math.min(s + 1, flow.length));
          return;
        }

        if (r.action === "submit") {
          mergeData(r.data);

          setIsSubmitting(true);
          try {
            await submitToApi(r.data);
            setStep((s) => Math.min(s + 1, flow.length));
          } finally {
            setIsSubmitting(false);
          }
        }
      }
    },
    [isS1, mergeData, submitToApi, flow.length]
  );

  /* ================= PUBLIC API ================= */

  const goToStep = (n: number) => {
    if (n >= 1 && n <= flow.length) setStep(n);
  };

  return {
    step,
    flow,
    totalStep: flow.length,
    data: formData.data,
    isS1,
    isSubmitting,
    handleStepResult,
    goToStep,
  };
}