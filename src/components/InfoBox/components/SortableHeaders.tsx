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
  const [states, setStates] = useState<SorterState[]>(Array(props.fields.length).fill(SorterState.off));

  function sortByKey(array: T[], key: keyof T, direction: SorterState): T[] {
    return [...array].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      if (direction === SorterState.off) return 0; 

      // Check if values are numbers for numeric sorting
      const isNumericA = typeof valueA === "number";
      const isNumericB = typeof valueB === "number";

      if (isNumericA && isNumericB) {
        return direction === SorterState.up ? valueA - valueB : valueB - valueA;
      }

      // Fall back to string sorting for non-numeric values
      const keyA = String(valueA).toLowerCase();
      const keyB = String(valueB).toLowerCase();

      if (direction === SorterState.up) {
        return keyA.localeCompare(keyB);
      } else {
        return keyB.localeCompare(keyA);
      }
    });
  }

  function sortElements(tStates: SorterState[]) {
    let activeSortKey: keyof T = "id" as keyof T;
    let activeSortState: SorterState = SorterState.off;

    tStates.forEach((state, index) => {
      if (state !== SorterState.off) {
        activeSortKey = props.keys[index];
        activeSortState = state;
      }
    });

    const sortedElements = sortByKey(props.elements, activeSortKey, activeSortState);
    props.setElements(sortedElements);
  }

  function setActiveKey(key: keyof T) {
    const updatedStates = [...states];
    const keyIndex = props.keys.indexOf(key);

    if (keyIndex !== -1) {
      updatedStates[keyIndex] =
        updatedStates[keyIndex] === SorterState.off
          ? SorterState.up
          : updatedStates[keyIndex] === SorterState.up
          ? SorterState.down
          : SorterState.off;

      updatedStates.forEach((_, index) => {
        if (index !== keyIndex) updatedStates[index] = SorterState.off;
      });

      setStates(updatedStates);
      sortElements(updatedStates);
    }
  }

  return (
    <tr className="select-none border-2 border-grey ">
      {props.fields.map((field, index) => (
        <Sorter
          key={index}
          onClick={() => setActiveKey(props.keys[index])}
          id={props.keys[index]}
          name={props.fields[index].toString()}
          state={states[index]}
        />
      ))}
    </tr>
  );
}

