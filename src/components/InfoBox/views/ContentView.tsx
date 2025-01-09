import SearchBar from "../components/SearchBar";
import { useState } from "react";
import SortableHeaders from "../components/SortableHeaders";
import { useTranslation } from "react-i18next";
import Pagination from "../components/Pagination";
import { useAuth } from "../../../hooks/AuthProvider";
import { ExamStatus } from "../../classes/Exam";
import Tutor from "../../classes/Tutor";

interface ContentViewInterface<T> {
  title: string;
  fields: string[];
  keys: (keyof T)[];
  data: T[];
  buttonName?: string; 
  coloring?: boolean;
  onRowClick?: (id: number) => void;
}

export default function ContentView<T extends { id?: number; status?: ExamStatus; room_id?: number; registeredTutors?: Tutor[]; tutor_id?: number}>(props: ContentViewInterface<T>) {
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

  const getBorderColor = (status?: ExamStatus, room_id?: number, registeredTutors?: Tutor[], tutor_id?: number): string => {
    if (status === ExamStatus.NoEmailExaminer) {
      return "hover:bg-red-100 border-dashed border-black border-2 bg-red-200 cursor-pointer focus:outline-none focus:ring-2"; // Light red
    }
    if (status === ExamStatus.noMaterial) {
      return "hover:bg-yellow-100 border-dashed border-black border-2 bg-yellow-200 cursor-pointer focus:outline-none focus:ring-2"; // Yellow
    }
    if (!room_id) {
      return "hover:bg-orange-100 border-dashed border-black border-2 bg-orange-200 cursor-pointer focus:outline-none focus:ring-2"; // Light orange
    }
    if (status === ExamStatus.noTutor) {
      return "hover:bg-green-100 border-dashed border-black border-2 bg-green-200 cursor-pointer focus:outline-none focus:ring-2" // Green 
    }
    if (registeredTutors && registeredTutors.length === 0 && !tutor_id) {
      return "hover:bg-blue-300 border-dashed border-black border-2 bg-blue-400 cursor-pointer focus:outline-none focus:ring-2"; // Dark blue
    }
    if (!tutor_id) {
      return "hover:bg-blue-100 border-dashed border-black border-2 bg-blue-200 cursor-pointer focus:outline-none focus:ring-2"; // light blue
    }
    if (status === ExamStatus.noAction) {
      return "hover:bg-slate-100 even:bg-slate-300 odd:bg-slate-200 cursor-pointer focus:outline-none focus:ring-2"; // No color
    }
    return "hover:bg-slate-100 even:bg-slate-300 odd:bg-slate-200 cursor-pointer focus:outline-none focus:ring-2"; // Default (no border color)
  };
  
  const start = (page - 1) * entriesPerPage;
  const numPages = Math.ceil(filtered.length / entriesPerPage);
  const entries: T[] = filtered.slice(start, start + entriesPerPage);

  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  const className = "hover:bg-slate-100 even:bg-slate-300 odd:bg-slate-200 cursor-pointer focus:outline-none focus:ring-2";

  return (
    <div className="w-full h-full p-5 select-none" role="region" aria-labelledby="table-title">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 id="table-title" className="text-4xl w-full md:w-1/3 my-2">{t(props.title)}</h2>
        <SearchBar items={props.data} filter={setFilteredData} />
      </div>
       {/* Color Legend for Admin */}
      {user.role === "Admin" && props.coloring && (
        <div className="mb-4 p-4 bg-gray-100 rounded-md" role="region" aria-labelledby="legend-title">
          <h6 id="legend-title" className="text-lg font-semibold mb-2 sr-only">
            {t("Color Legend for Exam Statuses")}
          </h6>
          <ul className="flex flex-wrap gap-4" role="list" aria-label={t("Exam status color legend")}>
          {[
              { color: "bg-red-300", label: t("Email Examiner Needed") },
              { color: "bg-yellow-300", label: t("Material Needed") },
              { color: "bg-orange-300", label: t("No Room Assigned") },
              { color: "bg-green-300", label: t("No Tutor Needed") },
              { color: "bg-blue-400", label: t("No Tutors Assigned") },
              { color: "bg-blue-200", label: t("No Tutor Picked Yet") },
              { color: "bg-slate-300", label: t("No Action Required") },
            ].map((item, index) => (
              <li key={index} className="flex items-center" role="listitem" aria-label={item.label}>
                <span className={`w-6 h-6 ${item.color} border-dashed border-black border-2 inline-block mr-2`} role="presentation" aria-hidden="true"></span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    {/* Table Wrapper with Horizontal Scrolling */}
    <div className="overflow-x-auto" role="table" aria-label={`${t(props.title)} ${t("Table")}`}>
      <table className="min-w-full table-auto text-left border-2">
        <thead>
          <SortableHeaders fields={props.fields.map((field) => t(field))} keys={props.keys} elements={filtered} setElements={setFilteredData} />
        </thead>
        <tbody>
          {entries.map((element: T, index) => (
            <tr
              key={`${element.id}-${index}`}
              className={`${user.role == "Admin" && props.coloring ? getBorderColor( element.status, element.room_id, element.registeredTutors, element.tutor_id) : className}`}
              tabIndex={0}
              role="row"
              aria-label={`${t("Row")} ${index + 1}`}
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
                      ? t(element[key] as string)
                      : formatDateTime(element[key] as string)
                    : Array.isArray(element[key])
                    ? (element[key] as string[]).join(", ")
                    : typeof element[key] === "number"
                    ? element[key]
                    : " "}
                </td>
              ))}
              <td className="pr-3" key="editButton" role="cell">
                <button aria-label={`${t("Edit")} ${props.title} ${t("Row")} ${index + 1}`} className="focus:outline-none focus:ring-2 focus:ring-blue-500 hover:underline">
                  {t(props.buttonName || "Edit")}
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
