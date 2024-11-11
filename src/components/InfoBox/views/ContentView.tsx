import SearchBar from "../components/SearchBar";
import { useState } from "react";
import SortableHeaders from "../components/SortableHeaders";
import { useTranslation } from "react-i18next";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useAuth } from "../../../hooks/AuthProvider";

interface ContentViewInterface<T> {
  title: string;
  fields: string[];
  keys: (keyof T)[];
  data: T[];
  buttonName?: string; // New prop for the button text
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

  const className = "hover:bg-slate-300 even:bg-slate-200 odd:bg-slate-100 cursor-pointer ";
  const dashedBorder = "hover:bg-red-100 border-dashed border-black border-2 bg-red-200 cursor-pointer ";

  return (
    <div className="w-full h-full p-5 select-none">
      <div className="flex w-full content-center items-center ">
        <h2 className="text-4xl w-1/3 my-2 ">{t(props.title)}</h2>
        <SearchBar items={props.data} filter={setFilteredData} />
      </div>
      <div className="h-5"></div>
      <table className="w-full table-auto text-left border-2">
        <tbody key={"tableBody"}>
          <SortableHeaders fields={props.fields} keys={props.keys} elements={filtered} setElements={setFilteredData} />
          {entries.map((element: T, index) => (
            <tr
              key={element.id + "" + index} // Add key for each row
              className={element["confirmed"] != undefined ? (element["confirmed"] === false ? dashedBorder : className) : className}
              onClick={() => {
                if (element.id && props.onRowClick && user.role == "Admin") {
                  props.onRowClick(element.id); // Use the onRowClick prop if available
                }
              }}
            >
              {props.keys.map((key, index) => (
                <td key={(key as string) + index} className="pl-2">
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

              <td key="editButton">
                <button
                  className="hover:underline"
                  onClick={() => {
                    if (element.id && props.onRowClick) {
                      props.onRowClick(element.id); // Use the onRowClick prop if available
                    }
                  }}
                >
                  Edit
                </button>
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
