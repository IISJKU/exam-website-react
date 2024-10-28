import { useEffect, useState } from "react";

import i18n from "../../../i18n";
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
  onClick: Function;
  activeKey?: string;
}

export default function Sorter(props: SorterProps) {
  const { t, i18n } = useTranslation();
  //<div>▲▼</div>

  const [symbol, setSymbol] = useState(" ");

  let className = "hover:bg-slate-300 pl-2 whitespace-nowrap ";

  //const sorterText = ["", "▲", "▼"];

  useEffect(() => {
    if (props.state == SorterState.down) {
      setSymbol("▼");
    } else if (props.state == SorterState.up) {
      setSymbol("▲");
    } else {
      setSymbol("‌‌ ");
    }
  }, [props.state]);

  return (
    <th id={String(props.id)} className={className} onClick={() => props.onClick(props.id)}>
      {t(props.name)}
      <div className="w-4 inline-block ">{symbol}</div>
    </th>
  );
}
