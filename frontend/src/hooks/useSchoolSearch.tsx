import { useState } from "react";
import { schools } from "../constants/data";

export default function useSchoolSearch(setFormData: any) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = schools.filter(s =>
    s.toLowerCase().includes(query.toLowerCase())
  );

  const selectSchool = (name: string) => {
    setQuery(name);
    setFormData((prev: any) => ({
      ...prev,
      asal_sekolah: name
    }));
    setOpen(false);
  };

  return {
    query,
    setQuery,
    open,
    setOpen,
    filtered,
    selectSchool
  };
}
