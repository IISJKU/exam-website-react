import { useState } from "react";
import Sorter from "./Sorter";
import { SorterState } from "./Sorter";

interface SHProps {
  fields: string[];
  keys: string[];
}

export default function SortableHeaders(props: SHProps) {
  //<div>▲▼</div>

  const [activeKey, setKey] = useState<string>("");

  function setActiveKey(key: string) {
    console.log(key);
  }

  return (
    <tr className="select-none">
      {props.fields.map((field, index) => (
        <Sorter onClick={() => setActiveKey(props.keys[index])} id={props.keys[index]} name={field} state={SorterState.off} />
      ))}
    </tr>
  );
}
