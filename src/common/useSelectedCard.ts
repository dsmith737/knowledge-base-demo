import { getRuntime } from "@yext/pages/util";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export const useSelectedCard = () => {
  if (getRuntime().isServerSide) return "";

  const [searchParams] = useSearchParams();
  const [selected, setSelected] = useState('');

  useEffect(() => {
    const selected = searchParams.get("selected") || '';
    setSelected(selected);
  }, []);

  return selected;
};