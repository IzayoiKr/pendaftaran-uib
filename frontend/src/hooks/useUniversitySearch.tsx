import { useState, useEffect } from "react";

const NOT_FOUND_OPTION = "Universitas tidak ditemukan";

// The Hipolabs API only serves over http:// (not https://).
// To avoid mixed-content browser blocks we proxy it through Vite.
// Add this to your vite.config.ts server.proxy:
//
//   '/uni-api': {
//     target: 'http://universities.hipolabs.com',
//     changeOrigin: true,
//     rewrite: (path) => path.replace(/^\/uni-api/, ''),
//   },
//
// Then we call /uni-api/search?name=... instead of the direct http URL.

export default function useUniversitySearch(
  formData: any,
  setFormData: (data: any) => void
) {
  const [queryUni, setQueryUni]       = useState("");
  const [openUni, setOpenUni]         = useState(false);
  const [filteredUni, setFilteredUni] = useState<string[]>([]);
  const [loading, setLoading]         = useState(false);

  useEffect(() => {
    if (queryUni.trim().length < 2) {
      setFilteredUni([]);
      return;
    }

    const controller = new AbortController();

    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        // Uses Vite proxy — avoids http/https mixed content block
        const res = await fetch(
          `/uni-api/search?name=${encodeURIComponent(queryUni)}`,
          { signal: controller.signal }
        );

        if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

        const data: { name: string }[] = await res.json();
        const names = [...new Set(data.map((u) => u.name))].slice(0, 10);
        setFilteredUni(names);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setFilteredUni([]);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [queryUni]);

  const selectUniversity = (name: string) => {
    setQueryUni(name === NOT_FOUND_OPTION ? "" : name);
    setFormData({ ...formData, universitas: name });
    setOpenUni(false);
  };

  const options =
    queryUni.trim().length >= 2
      ? [...filteredUni, NOT_FOUND_OPTION]
      : [];

  return {
    queryUni,
    setQueryUni,
    openUni,
    setOpenUni,
    filteredUni: options,
    loading,
    selectUniversity,
  };
}