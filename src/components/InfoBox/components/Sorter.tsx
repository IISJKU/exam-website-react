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
  const className = "hover:bg-slate-300 pl-2 whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <th
      id={String(props.id)}
      className={className}
      onClick={() => props.onClick(props.id)}
      tabIndex={0}
      role="button"
      aria-sort={
      props.state === SorterState.up
        ? "ascending"
        : props.state === SorterState.down
        ? "descending"
        : "none"
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") props.onClick(props.id); 
      }}
    >
      {t(props.name)} 
      <span aria-hidden="true" className="inline-block w-4 text-center">{symbol}</span>
    </th>
  );
}
