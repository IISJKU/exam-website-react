import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "./InfoBox/components/ToastMessage";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Exam, { ExamStatus } from "./classes/Exam";
import fetchAll from "./InfoBox/views/FetchAll";
import { useAuth } from "../hooks/AuthProvider";
import config from "../config";

export default function Calendar() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize useNavigate for navigation
  const [date, setDate] = useState(new Date());
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const user = useAuth();

  // Fetch data from Strapi API
  const fetchExams = async () => {
    try {
      let link = config.strapiUrl +"/api/exams";
      if (user.role == "Student" || user.role == "Tutor") link = config.strapiUrl +"/api/exams/me";

      const data = (await fetchAll(link, user.token)) as Exam[];
      const filteredExams = data.filter((exam) => exam.status !== ExamStatus.archived);
      setExams(filteredExams);
    } catch (error) {
      showToast({ message: `${t("Error fetching exams")}: ${error}.`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  if (loading) {
    return (
      <p aria-live="polite" aria-busy="true" role="status">
        {t("Loading exams...")}
      </p>
    );
  }

  function getWeekday(d: Date): string {
    let key = d.getDay();
    key = key - 1;
    if (key < 0) key = 6;
    return t(weekdays[key]);
  }

  function switchMonth(add: number): void {
    const newDate = new Date(date.getFullYear(), date.getMonth() + add, 1);
    setDate(newDate);
  }

  function getColorForExams(exams: Exam[]): string {
    const colors = exams.map((exam) => {
      const { status, room_id, registeredTutors, tutor_id } = exam;
  
      if (status === ExamStatus.NoEmailExaminer) {
        return "rgba(255, 99, 132, 0.5)"; //  darker red
      }
      if (status === ExamStatus.noMaterial) {
        return "rgba(255, 206, 86, 0.5)"; // darker yellow
      }
      if (!room_id) {
        return "rgba(255, 159, 64, 0.5)"; // darker orange
      }
      if (status === ExamStatus.noTutor) {
        return "rgba(75, 192, 192, 0.5)"; // darker green
      }
      if (registeredTutors && registeredTutors.length === 0 && !tutor_id) {
        return "rgba(30, 100, 180, 0.7)"; // dark blue
      }
      if (!tutor_id) {
        return "rgba(54, 162, 235, 0.5)"; // light blue
      }
      if (status === ExamStatus.noAction) {
        return "rgba(148, 163, 184, 0.8)";   // darker gray
      }
      return "rgba(201, 203, 207, 0.3)"; // Default slightly darker white
    });
  
    // Generate the gradient based on the colors
    if (colors.length === 1) {
      return colors[0]; // Single color
    }
  
    const gradientStops = colors.map((color, index) => {
      const percentage = (index / (colors.length - 1)) * 100;
      return `${color} ${percentage}%`;
    });
  
    return `linear-gradient(90deg, ${gradientStops.join(", ")})`;
  }  


  function getRows(month: number, year: number): string[][][] {
    const currentDate = new Date(year, month, 1);
    const numDays = new Date(year, month + 1, 0).getDate();
    const rows: string[][][] = [];
    let count = 1;

    while (count <= numDays) {
      const row: string[][] = [];
      for (let i = 0; i < 7; i++) {
        if (currentDate.getDate() === 1 && getWeekday(currentDate) !== t(weekdays[i])) {
          row.push(["", ""]);
        } else if (count <= numDays) {
          const matchingExams = exams.filter((exam) => {
            const examDate = new Date(exam.date);
            return (
              examDate.getDate() === currentDate.getDate() &&
              examDate.getMonth() === currentDate.getMonth() &&
              examDate.getFullYear() === currentDate.getFullYear()
            );
          })

          let backgroundStyle = "";
          if (matchingExams.length > 0) {
            if (user.role === "Admin") {
              backgroundStyle = matchingExams.length === 1
                ? getColorForExams(matchingExams) // Single color
                : getColorForExams(matchingExams); // Gradient for multiple exams
            } else {
              backgroundStyle = "rgba(148, 163, 184, 0.8)"; // Default gray for non-admin
            }
          }

          row.push([String(currentDate.getDate()), backgroundStyle]);
          currentDate.setDate(currentDate.getDate() + 1);
          count++;
        } else {
          row.push(["", ""]);
        }
      }
      rows.push(row);
    }
    return rows;
  }

  return (
    <div className="w-4/5 sm:w-2/4 md:bg-cyan-200 md:w-full aspect-square select-none" role="region" aria-label={t("Calendar View")}>
      <div className="bg-slate-100 border-2 border-grey p-1 aspect-square">
        <div className="bg-slate-300 w-full flex justify-center content-stretch my-1 text-xs md:text-sm " role="navigation" aria-label={t("Calendar View")}>
          <button
            className="basis-2/5 md:basis-1/5 text-left hover:underline"
            onClick={() => switchMonth(-1)}
            aria-label={`${t("Switch to previous month")}, ${t(month[(date.getMonth() + 11) % 12])}`}
          >
            &lt; {t("Prev")}
          </button>
          <div className="basis-3/5 text-center" aria-live="polite" aria-atomic="true">
            {t(month[date.getMonth()])} {date.getFullYear()}
          </div>
          <button
            onClick={() => switchMonth(1)}
            className="basis-2/5 md:basis-1/5 text-right hover:underline"
            aria-label={`${t("Switch to next month")}, ${t(month[(date.getMonth() + 1) % 12])}`}
          >
            {t("Next")} &gt;
          </button>
        </div>
        <table className="w-full text-sm text-left table-fixed bg-white" role="table" aria-label={t("Monthly Calendar")}>
          <thead>
            <tr>
              {weekdays.map((weekday, index) => (
                <th key={index} role="columnheader" aria-label={t(weekday)}>
                  {t(weekday.substring(0, 2))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getRows(date.getMonth(), date.getFullYear()).map((row, rowIndex) => (
              <tr key={rowIndex} role="row">
                {row.map((day, dayIndex) => (
                  <td
                    key={dayIndex}
                    tabIndex={day[1] ? 0 : undefined}
                    onClick={() => {
                      if (day[0]) {
                        // Use navigate to move to a new route for the specific date
                        navigate(`${user.role.toLowerCase()}/calendar/${date.getFullYear()}/${date.getMonth() + 1}/${day[0]}`);
                      }
                    }}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && day[0]) {
                        navigate(`${user.role.toLowerCase()}/calendar/${date.getFullYear()}/${date.getMonth() + 1}/${day[0]}`);
                      }
                    }}
                    className={`hover:bg-slate-500 active:bg-slate-700 align-top border-2 border-black aspect-square hover:cursor-pointer 
                      ${day[0] ? "" : "bg-white"}`}
                    style={{
                      background: day[0] ? day[1] : "",  // Use the gradient or single color here
                    }}
                    role="gridcell"
                    aria-label={day[0] ? `${t("Day")} ${day[0]} ${t(month[date.getMonth()])}` : t("Empty cell")}
                  >
                    {day[0]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
