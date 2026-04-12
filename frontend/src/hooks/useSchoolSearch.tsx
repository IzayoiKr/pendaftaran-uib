import { useState, useCallback } from "react";
import axios from "axios";

const NOT_FOUND_OPTION = "Sekolah tidak ditemukan";
const API_BASE = "/school-api";  // ✅ Use proxy instead of direct URL

export default function useSchoolSearch(
  formData: any,
  setFormData: (data: any) => void
) {
  const [query, setQuery] = useState(formData.asal_sekolah || "");
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const searchSchools = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setFiltered([]);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/sekolah`, {
          params: {
            sekolah: searchQuery,
            page: 1,
            perPage: 50,
          },
          timeout: 5000,
        });

        const schools = response.data?.dataSekolah || [];
                // ✅ FIX: langsung mapping saja
        const filtered_schools = Array.isArray(schools)
          ? schools.map((s: any) => s.sekolah)
          : [];

        setFiltered([...filtered_schools, NOT_FOUND_OPTION]);
      } catch (error) {
        console.error("School search error:", error);
        setFiltered([NOT_FOUND_OPTION]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setFormData({ ...formData, asal_sekolah: value });

    if (value.trim().length >= 2) {
      searchSchools(value);
    } else {
      setFiltered([]);
    }
  };

  const selectSchool = (name: string) => {
    if (name === NOT_FOUND_OPTION) {
      setFormData({ ...formData, asal_sekolah: query });
      setQuery(query);
      setOpen(false);
      return;
    }

    setFormData({ ...formData, asal_sekolah: name });
    setQuery(name);
    setOpen(false);
  };

  return {
    query,
    setQuery: handleQueryChange,
    open,
    setOpen,
    filtered,
    loading,
    selectSchool,
  };
}