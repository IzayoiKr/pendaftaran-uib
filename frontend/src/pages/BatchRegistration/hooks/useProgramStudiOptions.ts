import { useState, useEffect } from "react";
import type { SelectOption } from "@/constants/registerOptions";
import { api } from "@/api";

/**
 * Hook to fetch Program Studi options from the database.
 * @param degree The degree level (e.g., 'S1', 'S2')
 */
export default function useProgramStudiOptions(degree: string = "S1") {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    api.prodi.getProgramStudi(degree)
      .then((data) => {
        if (!mounted) return;

        if (Array.isArray(data)) {
          // Map backend data to SelectOption format
          const mapped = data.map((p: any) => ({
            value: p.id,
            label: p.title,
          }));
          setOptions(mapped);
        }
      })
      .catch((err) => {
        console.error("[useProgramStudiOptions] error:", err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [degree]);

  return { options, isLoading };
}
