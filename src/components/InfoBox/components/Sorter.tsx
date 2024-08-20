import { useEffect, useState } from "react";

export enum SorterState {
  off,
  up,
  down,
}

interface SorterProps {
  id: string;
  name: string;
  state?: SorterState;
  onClick: Function;
}

export default function Sorter(props: SorterProps) {
  //<div>▲▼</div>

  const [symbol, setSymbol] = useState("");

  //const sorterText = ["", "▲", "▼"];

  useEffect(() => {
    if (props.state == SorterState.down) {
      setSymbol("▼");
    }
    if (props.state == SorterState.up) {
      setSymbol("▲");
    } else {
      setSymbol("");
    }
  }, [props]);

  return (
    <th className="hover:bg-slate-300" onClick={() => props.onClick(props.id)}>
      {props.name} {symbol}
    </th>
  );
}
