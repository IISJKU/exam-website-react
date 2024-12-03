import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export enum SorterState {
  off,
  up,
  down,
}

interface SorterProps {
  id: string | number | symbol;
  name: string;
  state: SorterState;
  onClick: (id: string | number | symbol) => void;
}

export default function Sorter(props: SorterProps) {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState<string>("");

  useEffect(() => {
    if (props.state === SorterState.down) {
      setSymbol("▼");
    } else if (props.state === SorterState.up) {
      setSymbol("▲");
    } else {
      setSymbol("");
    }
  }, [props.state]);

  // Apply hover effects and responsiveness
  const className = "hover:bg-slate-300 pl-2 whitespace-nowrap cursor-pointer";

  return (
    <th id={String(props.id)} className={className} onClick={() => props.onClick(props.id)}>
      {t(props.name)} 
      <span className="inline-block w-4 text-center">{symbol}</span>
    </th>
  );
}
