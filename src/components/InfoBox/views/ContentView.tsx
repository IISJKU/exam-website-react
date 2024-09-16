import SearchBar from "../components/SearchBar";
import { useState } from "react";
import SortableHeaders from "../components/SortableHeaders";

import { useTranslation } from "react-i18next";

import Pagination from "../components/Pagination";

interface ContentViewInterface<T> {
  title: string;
  callback: Function;
  fields: string[];
  keys: (keyof T)[];
  data: T[];
}

export default function ContentView<T extends { id?: number }>(
  props: ContentViewInterface<T>
) {
  const { t, i18n } = useTranslation();
  const [filtered, setFiltered] = useState<T[]>(props.data);
  const entriesPerPage = 20;

  const [page, setPage] = useState(1);

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

  let entries: T[] = [];
  let start = (page - 1) * entriesPerPage;

  let numPages = Math.ceil(filtered.length / entriesPerPage);

  let pages = [];

  for (let i = start; i < entriesPerPage + start; i++) {
    if (filtered[i] == undefined) break;
    entries.push(filtered[i]);
  }

  for (let i = 0; i < numPages; i++) {
    pages.push(i + 1);
  }
  return (
    <div className="w-full h-full overflow-hidden p-5 select-none">
      <div className="flex w-full content-center items-center ">
        <h2 className="text-4xl w-1/3 my-2 ">{t(props.title)}</h2>
        <SearchBar items={props.data} filter={setFilteredData} />
      </div>
      <div className="h-5"></div>
      <table className="w-full table-auto text-left border-2">
        <SortableHeaders
          fields={props.fields}
          keys={props.keys}
          elements={filtered}
          setElements={setFilteredData}
        />

        {entries.map((element: T) => (
          <tr
            className="hover:bg-slate-300 even:bg-slate-200 odd:bg-slate-100"
            onClick={() => {
              props.callback(element);
            }}
          >
            {props.keys.map((key) => (
              <td className="pl-2">
                {typeof element[key] === "string"
                  ? !isDate(element[key] as string)
                    ? (element[key] as string)
                    : formatDate(element[key] as string)
                  : Array.isArray(element[key])
                  ? (element[key] as string[]).join(", ")
                  : typeof element[key] === "number"
                  ? (element[key] as number)
                  : " "}
              </td>
            ))}

            <td>
              <button>Edit</button>
            </td>
          </tr>
        ))}
      </table>

      <Pagination callback={setPage} pageNames={pages} activePage={page} />
    </div>
  );
}

// Helper function to format the date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  // Options for the date part (day/month/year)
  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  // Options for the time part (hour/minute)
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  };

  const formattedDate = date.toLocaleDateString("en-GB", dateOptions); // DD/MM/YYYY format
  const formattedTime = date.toLocaleTimeString("en-GB", timeOptions); // HH:mm format

  return `${formattedDate} ${formattedTime}`;
};
