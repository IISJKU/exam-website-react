import studentData from "../../../TestData/Students.json";
import Student from "../../classes/Student";
import examData from "../../../TestData/Exams.json";
import SearchBar from "../components/SearchBar";
import { ReactNode, useState } from "react";
import SortableHeaders from "../components/SortableHeaders";

interface ContentViewInterface<T> {
  title: string;
  callback: Function;
  fields: string[];
  keys: (keyof T)[];
  data: T[];
}

export default function ContentView<T extends { id?: number }>(props: ContentViewInterface<T>) {
  const [filtered, setFiltered] = useState<T[]>(props.data);

  //<div>▲▼</div>

  function setFilteredData(data: T[]) {
    setFiltered(data);
  }

  function isDate(t: string): boolean {
    if (!isNaN(Date.parse(t))) {
      if (t.includes("T")) return true;
    }

    return false;
  }

  return (
    <div className="w-full h-full overflow-auto p-5">
      <div className="flex w-full content-center items-center">
        <h2 className="text-4xl w-1/3 my-2 underline">{props.title}</h2>
        <SearchBar items={props.data} filter={setFilteredData} />
      </div>
      <table className="w-full table-auto text-left ">
        <SortableHeaders fields={props.fields} keys={props.keys} elements={filtered} setElements={setFilteredData} />

        {filtered.map((element: T) => (
          <tr
            className="hover:bg-slate-300"
            onClick={() => {
              props.callback(element);
            }}
          >
            {props.keys.map((key) => (
              <td>
                {typeof element[key] === "string"
                  ? !isDate(element[key] as string)
                    ? (element[key] as string)
                    : (element[key] as string).substring(0, (element[key] as string).indexOf("T"))
                  : Array.isArray(element[key])
                  ? (element[key] as string[])[0]
                  : " "}
              </td>
            ))}

            <td>
              <button>Edit</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
