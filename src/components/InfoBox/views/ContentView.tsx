import SearchBar from "../components/SearchBar";
import { useState } from "react";
import SortableHeaders from "../components/SortableHeaders";
import { useTranslation } from "react-i18next";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

interface ContentViewInterface<T> {
  title: string;
  fields: string[];
  keys: (keyof T)[];
  data: T[];
  onRowClick?: (id: number) => void; // Add this prop for handling row clicks
}

export default function ContentView<T extends { id?: number }>(
  props: ContentViewInterface<T>
) {
  const { t } = useTranslation();
  const [filtered, setFiltered] = useState<T[]>(props.data);
  const entriesPerPage = 20;
  const [page, setPage] = useState(1);

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

        <tbody>
          {entries.map((element: T) => (
            <tr
              key={element.id} // Add key for each row
              className="hover:bg-slate-300 even:bg-slate-200 odd:bg-slate-100 cursor-pointer"
              onClick={() => {
                if (element.id && props.onRowClick) {
                  props.onRowClick(element.id); // Use the onRowClick prop if available
                }
              }}
            >
              {props.keys.map((key) => (
                <td key={key as string} className="pl-2">
                  {typeof element[key] === "string" ? (
                    !isDate(element[key] as string) ? (
                      element[key] as string
                    ) : (
                      formatDate(element[key] as string)
                    )
                  ) : Array.isArray(element[key]) ? (
                    (element[key] as string[]).join(", ")
                  ) : typeof element[key] === "number" ? (
                    element[key] as number
                  ) : (
                    " "
                  )}
                </td>
              ))}

              <td>
                <button>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
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