import { useState } from "react";
import Sorter from "./Sorter";
import { SorterState } from "./Sorter";

interface SHProps<T> {
  fields: string[];
  keys: (keyof T)[];
  elements: any[];
  setElements: Function;
}

export default function SortableHeaders<T extends { id?: number }>(props: SHProps<T>) {
  //<div>▲▼</div>

  const [activeKey, setKey] = useState<string>("");

  let keyStates: SorterState[] = [];

  if (keyStates.length == 0) {
    props.fields.forEach((element) => {
      keyStates.push(SorterState.off);
    });
  }

  const [states, setStates] = useState<SorterState[]>(keyStates);

  function sortByKey(array: T[], key: keyof T, direction: SorterState): any[] {
    let arr = array.sort((a, b) => {
      let tKey = key;

      if (direction == SorterState.off) tKey = "id";

      const keyA = String(a[tKey]).toLowerCase(); // Convert to lowercase to ensure case-insensitive sorting
      const keyB = String(b[tKey]).toLowerCase();

      if (direction == SorterState.up || direction == SorterState.off) {
        if (keyA < keyB) {
          return -1; // a comes before b
        }
        if (keyA > keyB) {
          return 1; // a comes after b
        }
        return 0; // a and b are equal
      } else {
        if (keyA < keyB) {
          return 1; // a comes before b
        }
        if (keyA > keyB) {
          return -1; // a comes after b
        }
        return 0; // a and b are equal
      }
    });

    return arr;
  }

  function sortElements(tStates: SorterState[]) {
    let key: keyof T = props.keys[0]; // should be initialized as something different
    let tState: SorterState = SorterState.off;

    tStates.forEach((state, index) => {
      if (state != SorterState.off) {
        key = props.keys[index];
        tState = state;
      }
    });

    let tElem = [...props.elements];
    let t = sortByKey(tElem, key, tState);

    props.setElements(t);
  }

  function setActiveKey(key: keyof T) {
    let tKey = "";

    keyStates = [...states];

    let skip: number | undefined = undefined;
    props.keys.forEach((element, index) => {
      if (element === key) {
        if (keyStates[index] == SorterState.off) {
          keyStates[index] = SorterState.up;
        } else if (keyStates[index] == SorterState.up) {
          keyStates[index] = SorterState.down;
        } else {
          keyStates[index] = SorterState.off;
        }

        skip = index;
      }
    });

    keyStates.forEach((keyState, index) => {
      if (skip === undefined || skip !== index) keyStates[index] = SorterState.off;
    });

    setStates(keyStates);
    sortElements(keyStates);
  }

  return (
    <>
      <tr className="select-none border-2 border-black">
        {props.fields.map((field, index) => (
          <Sorter onClick={() => setActiveKey(props.keys[index])} id={props.keys[index]} name={props.fields[index].toString()} state={states[index]} />
        ))}
      </tr>
    </>
  );
}
