import SearchBar from "../components/SearchBar";
import { useState } from "react";
import SortableHeaders from "../components/SortableHeaders";
import { useTranslation } from "react-i18next";
import Pagination from "../components/Pagination";
import { useAuth } from "../../../hooks/AuthProvider";

interface ContentViewInterface<T> {
  title: string;
  fields: string[];
  keys: (keyof T)[];
  data: T[];
  buttonName?: string; 
  onRowClick?: (id: number) => void;
}

export default function ContentView<T extends { id?: number; confirmed?: boolean }>(props: ContentViewInterface<T>) {
  const { t } = useTranslation();
  const [filtered, setFiltered] = useState<T[]>(props.data);
  const entriesPerPage = 20;
  const [page, setPage] = useState(1);
  const user = useAuth();

  function setFilteredData(data: T[]) {
    setFiltered(data);
  }

  function isDate(t: string): boolean {
    return !isNaN(Date.parse(t)) && t.includes("T");
  }

  const start = (page - 1) * entriesPerPage;
  const numPages = Math.ceil(filtered.length / entriesPerPage);
  const entries: T[] = filtered.slice(start, start + entriesPerPage);

  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  const className = "hover:bg-slate-300 even:bg-slate-200 odd:bg-slate-100 cursor-pointer focus:outline-none focus:ring-2";
  const dashedBorder = "hover:bg-red-100 border-dashed border-black border-2 bg-red-200 cursor-pointer focus:outline-none focus:ring-2";

  return (
    <div className="w-full h-full p-5 select-none" role="region" aria-labelledby="table-title">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 id="table-title" className="text-4xl w-full md:w-1/3 my-2">{t(props.title)}</h2>
        <SearchBar items={props.data} filter={setFilteredData} />
      </div>
       {/* Table Wrapper with Horizontal Scrolling */}
    <div className="overflow-x-auto" role="table" aria-label={`${props.title} Table`}>
      <table className="min-w-full table-auto text-left border-2">
        <thead>
          <SortableHeaders fields={props.fields} keys={props.keys} elements={filtered} setElements={setFilteredData} />
        </thead>
        <tbody>
          {entries.map((element: T, index) => (
            <tr
              key={`${element.id}-${index}`}
              className={
                element["confirmed"] != undefined
                  ? element["confirmed"] === false
                    ? dashedBorder
                    : className
                  : className
              }
              tabIndex={0}
              role="row"
              aria-label={`Row ${index + 1}`}
              onClick={() => {
                if (element.id && props.onRowClick) {
                  props.onRowClick(element.id);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (element.id && props.onRowClick) {
                    props.onRowClick(element.id);
                  }
                }
              }}
            >
              {props.keys.map((key, idx) => (
                <td key={`${String(key)}-${idx}`} className="pl-2" tabIndex={0} role="cell">
                  {typeof element[key] === "string"
                    ? !isDate(element[key] as string)
                      ? (element[key] as string)
                      : formatDateTime(element[key] as string)
                    : Array.isArray(element[key])
                    ? (element[key] as string[]).join(", ")
                    : typeof element[key] === "number"
                    ? (element[key] as number)
                    : " "}
                </td>
              ))}
              <td className="pr-3" key="editButton" role="cell">
                <button aria-label={`Edit ${props.title} Row ${index + 1}`} className="focus:outline-none focus:ring-2 focus:ring-blue-500 hover:underline">
                  {props.buttonName || "Edit"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Pagination */}
    <Pagination callback={setPage} pageNames={pages} activePage={page} />
  </div>
);
}

// Helper function to format the date
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);

  const dateOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
  const formattedTime = date.toLocaleTimeString("en-GB", timeOptions);

  return `${formattedDate} ${formattedTime}`;
};
