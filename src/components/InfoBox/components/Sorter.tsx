import { useEffect, useState } from "react";

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
  //<div>▲▼</div>

  const [symbol, setSymbol] = useState(" ");

  let className = "hover:bg-slate-300 ";

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
      {props.name} <div className="inline-block w-1">{symbol}</div>
    </th>
  );
}
