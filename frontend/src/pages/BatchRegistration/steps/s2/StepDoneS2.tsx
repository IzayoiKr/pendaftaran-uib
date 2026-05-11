"use client";

import { useRouter } from "next/navigation";

import ProgressBar from "@/pages/BatchRegistration/components/ProgressBar";
import useProgramStudiOptions from "@/pages/BatchRegistration/hooks/useProgramStudiOptions";

import RegistrationStatusSection, {
  buildS2StatusItems,
  DEFAULT_S2_STATUS,
} from "@/pages/BatchRegistration/components/RegistrationStatusSection";

import type {
  StepPropsS2,
} from "@/validation/schemaform";

type Props = StepPropsS2;

export default function StepDoneS2({
  data,
  currentStep,
  flow,
  goToStep,
}: Props) {
  const router = useRouter();
  const { options: prodiOptions } = useProgramStudiOptions("S2");

  const getProdiLabel = (id?: string) => {
    if (!id) return "-";
    return prodiOptions.find((o) => o.value === id)?.label || "Loading...";
  };

  /* ================= STATUS ================= */

  // sementara masih pakai default status
  // nanti bisa diganti fetch API
  const statusData =
    DEFAULT_S2_STATUS;

  const statusItems =
    buildS2StatusItems(
      statusData
    );

  /* ================= RENDER ================= */

  return (
    <div className="formContainer">
      <div className="formWrapper">

        {/* ================= HEADER ================= */}
        <div className="formHeader">
          <h1 className="titleMain">
            KONFIRMASI PENDAFTARAN
          </h1>

          <p className="titleSub">
            (Registration Confirmation)
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
            Ringkasan Data
          </h3>

          <div className="table">

            <div className="tableRowHeader">
              <span>Field</span>
              <span>Data</span>
            </div>

            <div className="tableRow">
              <span>Nama</span>

              <strong>
                {data.nama || "-"}
              </strong>
            </div>

            <div className="tableRow">
              <span>Email</span>

              <strong>
                {data.email || "-"}
              </strong>
            </div>

            <div className="tableRow">
              <span>No HP</span>

              <strong>
                {data.nohp || "-"}
              </strong>
            </div>

            <div className="tableRow">
              <span>Program</span>

              <strong>
                {getProdiLabel(data.prodipil)}
              </strong>
            </div>

            <div className="tableRow">
              <span>Nama Ayah</span>

              <strong>
                {data.nama_ayah ||
                  "-"}
              </strong>
            </div>

            <div className="tableRow">
              <span>Nama Ibu</span>

              <strong>
                {data.nama_ibu ||
                  "-"}
              </strong>
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
            justifyContent:
              "center",
            marginTop: "2rem",
          }}
        >
          <button
            type="button"
            className="btn btnPrimary"
            onClick={() =>
              router.push(
                "/account"
              )
            }
          >
            Selesai — Kembali ke Akun
          </button>
        </div>

      </div>
    </div>
  );
}