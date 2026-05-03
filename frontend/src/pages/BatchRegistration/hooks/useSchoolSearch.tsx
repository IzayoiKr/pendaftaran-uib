import useEntitySearch from "./useEntitySearch";
import { SCHOOL_OPTIONS } from "@/constants/schoolOptions";

export default function useSchoolSearch() {
  return useEntitySearch({
    localList: SCHOOL_OPTIONS,
    endpoint: "/api/school",
  });
}