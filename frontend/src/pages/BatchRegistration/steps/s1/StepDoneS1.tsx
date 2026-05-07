"use client";

import { useRouter } from "next/navigation";

import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";

import {
  getProdiName,
} from "@/constants/registerOptions";

import RegistrationStatusSection, {
  buildS1StatusItems,
  DEFAULT_S1_STATUS,
} from "@/pages/BatchRegistration/components/RegistrationStatusSection";

import type {
  StepPropsS1,
} from "@/validation/schemaform";

type Props = StepPropsS1;

export default function StepDoneS1({
  data,
  currentStep,
  flow,
  goToStep,
}: Props) {
  const router = useRouter();

  /* ================= STATUS ================= */

  // sementara masih pakai default dummy status
  // nanti bisa diganti fetch API
  const statusData = DEFAULT_S1_STATUS;

  const statusItems =
    buildS1StatusItems(statusData);

  /* ================= RENDER ================= */

  return (
    <div className="formContainer">
      <div className="formWrapper">

        {/* ================= HEADER ================= */}
        <div className="formHeader">
          <h1 className="titleMain">
            KONFIRMASI DATA PENDAFTARAN
          </h1>

          <p className="titleSub">
            (Registration Data Confirmation)
          </p>

          <ProgressBar
            currentStep={currentStep}
            goToStep={goToStep}
            steps={flow}
          />
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="section">
          <h3 className="titleSection">
            Program Studi
          </h3>

          <div className="prodiCard">
            <div className="prodiLabel">
              Pilihan Anda
            </div>

            <div className="prodiName">
              {getProdiName(data.prodipil) || "-"}
            </div>
          </div>
        </div>

        {/* ================= STATUS ================= */}
        <div className="section">
          <RegistrationStatusSection
            title="Status Dokumen (Document Status)"
            items={statusItems}
          />
        </div>

        {/* ================= DONE BUTTON ================= */}
        <div
          className="buttonGroup"
          style={{
            justifyContent: "center",
            marginTop: "2rem",
          }}
        >
          <button
            type="button"
            className="btn btnPrimary"
            onClick={() =>
              router.push("/account")
            }
          >
            Selesai — Kembali ke Akun
          </button>
        </div>

      </div>
    </div>
  );
}