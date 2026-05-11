"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/api";
import BatchRegistrationForm from "@/pages/BatchRegistration/BatchRegistrationForm";
import type { EventType, ProgramType } from "@/validation/schemaform";
import { toast } from "sonner";

export default function UbahBiodataPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nomorDaftar = searchParams.get("nomorDaftar");

  const [regData, setRegData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!nomorDaftar) {
      router.push("/account");
      return;
    }

    api.profile.getRegistration(nomorDaftar)
      .then(data => {
        setRegData(data);
      })
      .catch(err => {
        console.error("Failed to fetch registration details", err);
        toast.error("Gagal mengambil data pendaftaran");
        router.push("/account");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [nomorDaftar, router]);

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "80vh" }}>
        <p>Memuat data pendaftaran...</p>
      </div>
    );
  }

  if (!regData) return null;

  const event: EventType = {
    programType: (regData.type === "S2" ? "Program Magister" : "Program Sarjana") as ProgramType,
    batchName: regData.batchName,
  };

  return (
    <BatchRegistrationForm 
      registrationKey={regData.registrationKey} 
      event={event} 
      nomorDaftar={nomorDaftar} 
    />
  );
}
