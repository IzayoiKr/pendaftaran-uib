import { useState } from "react";
import { schools } from "../constants/data";

const NOT_FOUND_OPTION = "Sekolah tidak ditemukan";

// School search works purely from the local list in constants/data.ts.
// There is no free global school API available.
// Strategy:
//   - Show matching schools from the local list as suggestions
//   - Always show "Sekolah tidak ditemukan" as last option
//   - If selected, save whatever the user typed as the value
//   - The input itself is always free-text so users can type any school name

export default function useSchoolSearch(
  formData: any,
  setFormData: (data: any) => void
) {
  const [query, setQuery] = useState("");
  const [open, setOpen]   = useState(false);

  const localMatches = query.trim().length > 0
    ? schools.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : [];

  // Always append tidak ditemukan so user can confirm their school isn't listed
  const filtered = query.trim().length > 0
    ? [...localMatches, NOT_FOUND_OPTION]
    : [];

  const selectSchool = (name: string) => {
    if (name === NOT_FOUND_OPTION) {
      // Save the raw text the user typed — not the "tidak ditemukan" string
      setFormData({ ...formData, asal_sekolah: query });
      setOpen(false);
      return;
    }
    setQuery(name);
    setFormData({ ...formData, asal_sekolah: name });
    setOpen(false);
  };

  // Also save on every keystroke so free-typed school names are captured
  // even if the user never picks from the dropdown
  const handleQueryChange = (value: string) => {
    setQuery(value);
    setFormData({ ...formData, asal_sekolah: value });
  };

  return {
    query,
    setQuery: handleQueryChange,  // replaces bare setQuery — saves on every keystroke
    open,
    setOpen,
    filtered,
    selectSchool,
  };
}