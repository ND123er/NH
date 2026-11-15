import { useOutletContext } from "react-router-dom";

export default function useAuthReadOnly() {
  return useOutletContext()?.authReadOnly === true;
}