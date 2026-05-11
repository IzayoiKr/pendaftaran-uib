"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

import { toast } from "sonner";
import { api } from "@/api";

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

type FormStateS1 = {
  type: "S1";
  data: Partial<FormDataS1>;
};

type FormStateS2 = {
  type: "S2";
  data: Partial<FormDataS2>;
};

type FormState = FormStateS1 | FormStateS2;

interface HookArgs {
  event: EventType;
  registrationKey: string;
  batchName: string;

  nomorDaftar?: string;
  isEditMode?: boolean;
}

/* =========================================================
   FLOWS
========================================================= */

const S1_FLOW: StepItem[] = [
  {
    key: "Step1S1",
    label: "BIODATA DIRI",
    sub: "PERSONAL DATA",
  },
  {
    key: "Step2S1",
    label: "DOKUMEN",
    sub: "DOCUMENT",
  },
  {
    key: "StepDoneS1",
    label: "SELESAI",
    sub: "DONE",
  },
];

const S2_FLOW: StepItem[] = [
  {
    key: "Step1S2",
    label: "BIODATA",
    sub: "PERSONAL DATA",
  },
  {
    key: "StepParentS2",
    label: "ORANG TUA",
    sub: "PARENT DATA",
  },
  {
    key: "Step2S2",
    label: "DOKUMEN",
    sub: "DOCUMENT",
  },
  {
    key: "StepDoneS2",
    label: "SELESAI",
    sub: "DONE",
  },
];

/* =========================================================
   CONSTANTS
========================================================= */

const PROGRAM_TYPE = {
  S1: "Program Sarjana",
  S2: "Program Magister",
} as const;

const STORAGE_SCHEMA_VERSION = 1;

/* =========================================================
   HOOK
========================================================= */

export default function useBatchRegistrationForm({
  event,
  registrationKey,
  batchName,
  nomorDaftar,
  isEditMode,
}: HookArgs) {

  /* ================= PROGRAM TYPE ================= */

  const isS1 =
    event.programType === PROGRAM_TYPE.S1;

  const isS2 =
    event.programType === PROGRAM_TYPE.S2;

  if (!isS1 && !isS2) {
    throw new Error("Invalid program type");
  }

  const flow = isS1 ? S1_FLOW : S2_FLOW;

  /* ================= STORAGE ================= */

  const STORAGE_KEY =
    `batch-registration-${registrationKey}`;

  /* ================= STATE ================= */

  const [step, setStep] = useState(1);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    isLoadingExisting,
    setIsLoadingExisting,
  ] = useState(false);

  const [filesWereLost, setFilesWereLost] =
    useState(false);

  const [formData, setFormData] =
    useState<FormState>(() => {

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

  /* ================= REFS ================= */

  const mountedRef = useRef(false);

  const dataRef = useRef(formData.data);

  useEffect(() => {
    dataRef.current = formData.data;
  }, [formData.data]);

  /* ================= AUTO RESTORE ================= */

  useEffect(() => {
    const saved =
      sessionStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {

      const parsed = JSON.parse(saved);

      if (
        parsed?.version !==
        STORAGE_SCHEMA_VERSION
      ) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      if (
        parsed?.formData &&
        typeof parsed.formData === "object"
      ) {
        setFormData(parsed.formData);
        setFilesWereLost(true);
      }

      if (
        typeof parsed?.step === "number" &&
        parsed.step >= 1
      ) {
        setStep(parsed.step);
      }

    } catch (err) {

      console.error(
        "[BatchRegistration] corrupted session:",
        err
      );

      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [STORAGE_KEY]);

  /* ================= AUTO SAVE ================= */

  useEffect(() => {

    const sanitizedData = Object.fromEntries(
      Object.entries(formData.data).filter(
        ([, value]) => !(value instanceof File)
      )
    );

    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_SCHEMA_VERSION,
        step,

        formData: {
          ...formData,
          data: sanitizedData,
        },
      })
    );

  }, [step, formData, STORAGE_KEY]);

  /* ================= SYNC PRIMITIVES ================= */

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

  /* ================= FETCH EXISTING ================= */

  useEffect(() => {

    if (!isEditMode || !nomorDaftar) {
      return;
    }

    setIsLoadingExisting(true);

    api.profile.getRegistration(nomorDaftar)
      .then((existingData) => {

        setFormData((prev) => ({
          ...prev,

          data: {
            ...prev.data,
            ...existingData,
          },
        }));

        setStep(1);
      })
      .catch((err) => {

        console.error(err);

        toast.error(
          "Gagal memuat data pendaftaran"
        );
      })
      .finally(() => {
        setIsLoadingExisting(false);
      });

  }, [isEditMode, nomorDaftar]);

  /* ================= MERGE DATA ================= */

  const mergeData = useCallback(
    (
      incoming:
        | Partial<FormDataS1>
        | Partial<FormDataS2>
    ) => {

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

  /* ================= HELPERS ================= */

  const buildFormData = (
    incoming:
      | Partial<FormDataS1>
      | Partial<FormDataS2>
  ) => {

    const fd = new FormData();

    const merged = {
      ...dataRef.current,
      ...incoming,
    };

    Object.entries(merged).forEach(
      ([key, val]) => {

        if (val instanceof File) {
          fd.append(key, val);
          return;
        }

        if (
          val !== undefined &&
          val !== null
        ) {
          fd.append(key, String(val));
        }
      }
    );

    return fd;
  };

    const parseApiError = async (
    res: Response,
    fallback: string
  ) => {

    try {

      const body = await res.json();

      return (
        body?.message ||
        body?.error ||
        fallback
      );

    } catch {
      return fallback;
    }
  };

  const requestWithTimeout = async (
    url: string,
    options: RequestInit
  ) => {

    const controller =
      new AbortController();

    const timeoutId = setTimeout(
      () => controller.abort(),
      30000
    );

    try {

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(
          await parseApiError(
            res,
            `HTTP ${res.status}`
          )
        );
      }

      return await res.json();

    } catch (err) {

      clearTimeout(timeoutId);

      if (
        (err as Error).name ===
        "AbortError"
      ) {
        throw new Error(
          "Koneksi timeout. Coba lagi."
        );
      }

      throw err;
    }
  };

  /* ================= API ================= */

  const submitToApi = useCallback(
    async (
      incoming:
        | Partial<FormDataS1>
        | Partial<FormDataS2>
    ) => {
      return api.profile.registerStudent(buildFormData(incoming));
    },
    []
  );

  const updateRegistration = useCallback(
    async (
      nomorDaftar: string,

      incoming:
        | Partial<FormDataS1>
        | Partial<FormDataS2>
    ) => {
      return api.profile.updateRegistration(nomorDaftar, buildFormData(incoming));
    },
    []
  );

  /* ================= STEP ORCHESTRATOR ================= */

  const handleStepResult = useCallback(
    async (
      result:
        | StepResultS1
        | StepResultS2
    ) => {

      if (result.action === "prev") {

        setStep((s) =>
          Math.max(s - 1, 1)
        );

        return;
      }

      if (result.action === "next") {

        mergeData(result.data);

        setStep((s) =>
          Math.min(s + 1, flow.length)
        );

        return;
      }

      if (result.action !== "submit") {
        return;
      }

      mergeData(result.data);

      setIsSubmitting(true);

      try {

        if (
          isEditMode &&
          nomorDaftar
        ) {

          await updateRegistration(
            nomorDaftar,
            result.data
          );

          toast.success(
            "Biodata berhasil diperbarui"
          );

        } else {

          await submitToApi(
            result.data
          );

          toast.success(
            "Pendaftaran berhasil dikirim"
          );
        }

        sessionStorage.removeItem(
          STORAGE_KEY
        );

        setStep((s) =>
          Math.min(s + 1, flow.length)
        );

      } catch (err) {

        toast.error(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan",
          {
            duration: 6000,
          }
        );

        console.error(
          "[BatchRegistration] submit failed:",
          err
        );

      } finally {

        setIsSubmitting(false);
      }
    },
    [
      flow.length,

      mergeData,

      submitToApi,
      updateRegistration,

      STORAGE_KEY,

      isEditMode,
      nomorDaftar,
    ]
  );

  /* ================= PUBLIC API ================= */

  const goToStep = (n: number) => {

    if (n >= 1 && n <= flow.length) {
      setStep(n);
    }
  };

  return {
    step,
    flow,

    totalStep: flow.length,

    data: formData.data,

    isS1,
    isSubmitting,

    filesWereLost,

    isLoadingExisting,
    isEditMode: !!isEditMode,

    handleStepResult,
    goToStep,
  };
}
