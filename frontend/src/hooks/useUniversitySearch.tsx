import { useState } from "react";
import { universities } from "@/constants/data";

export default function useUniversitySearch(setFormData: any) {
    const [queryUni, setQueryUni] = useState("");
    const [openUni, setOpenUni] = useState(false);

    const filteredUni = universities.filter((u) =>
        u.toLowerCase().includes(queryUni.toLowerCase())
    );

    const selectUniversity = (name: string) => {
        setQueryUni(name);
        setFormData((prev: any) => ({
            ...prev,
            universitas: name,
        }));
        setOpenUni(false);
    };

    return {
        queryUni,
        setQueryUni,
        openUni,
        setOpenUni,
        filteredUni,
        selectUniversity,
    };
}
