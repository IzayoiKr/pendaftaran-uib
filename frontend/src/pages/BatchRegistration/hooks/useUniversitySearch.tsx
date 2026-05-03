import useEntitySearch from "./useEntitySearch";
import { UNIVERSITIES } from "@/constants/universityOptions";

export default function useUniversitySearch() {
  return useEntitySearch({
    localList: UNIVERSITIES,
    endpoint: "/api/university",
  });
}