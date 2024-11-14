import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "./InfoBox/components/ToastMessage";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import { useAuth } from "../hooks/AuthProvider";

export default function TutorCalendar() {
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
      const response = await fetch(`http://localhost:1337/api/exams/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();

      console.log(data);
      setExams(data);
    } catch (error) {
      showToast({ message: `Error fetching exams: ${error}.`, type: "error" });
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  if (loading) {
    return <p>Loading exams...</p>; // Display loading indicator while fetching
  }

  function getWeekday(d: Date): string {
    let key = d.getDay();
    key = key - 1;
    if (key < 0) key = 6;
    return weekdays[key];
  }

  function switchMonth(add: number): void {
    const newDate = new Date(date.getFullYear(), date.getMonth() + add, 1); // Simplified switching
    setDate(newDate);
  }

  function getRows(month: number, year: number): string[][][] {
    const currentDate = new Date(year, month, 1);
    const numDays = new Date(year, month + 1, 0).getDate();
    const rows: string[][][] = [];
    let count = 1;

    while (count <= numDays) {
      const row: string[][] = [];
      for (let i = 0; i < 7; i++) {
        if (currentDate.getDate() === 1 && getWeekday(currentDate) !== weekdays[i]) {
          row.push(["", "invisible"]);
        } else if (count <= numDays) {
          let examString = exams.some((exam) => {
            const examDate = new Date(exam.date);
            return (
              examDate.getDate() === currentDate.getDate() &&
              examDate.getMonth() === currentDate.getMonth() &&
              examDate.getFullYear() === currentDate.getFullYear()
            );
          })
            ? "bg-slate-400"
            : "";

          if (examString != "") {
            examString = exams.some((exam) => {
              const examDate = new Date(exam.date);
              if (
                examDate.getDate() === currentDate.getDate() &&
                examDate.getMonth() === currentDate.getMonth() &&
                examDate.getFullYear() === currentDate.getFullYear()
              )
                if (exam.confirmed != undefined) {
                  if (exam.confirmed === false) return true;
                } else return false;
            })
              ? "bg-red-200"
              : "bg-slate-400";
          }

          row.push([String(currentDate.getDate()), examString]);
          currentDate.setDate(currentDate.getDate() + 1);
          count++;
        } else {
          row.push(["", "invisible"]);
        }
      }
      rows.push(row);
    }
    return rows;
  }

  return (
    <div className="w-full aspect-square select-none">
      <div className="bg-slate-100 border-2 border-black p-1 aspect-square">
        <div className="bg-slate-300 w-full flex justify-center content-stretch my-1 text-sm">
          <button className="basis-1/5 text-left hover:underline" onClick={() => switchMonth(-1)}>
            &lt; Prev
          </button>
          <div className="basis-3/5 text-center">
            {t(month[date.getMonth()])} {date.getFullYear()}
          </div>
          <button onClick={() => switchMonth(1)} className="basis-1/5 text-right hover:underline">
            Next &gt;
          </button>
        </div>
        <table className="w-full text-sm text-left table-fixed">
          <thead>
            <tr>
              {weekdays.map((weekday, index) => (
                <th key={index}>{weekday.substring(0, 2)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getRows(date.getMonth(), date.getFullYear()).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((day, dayIndex) => (
                  <td
                    key={dayIndex}
                    onClick={() => {
                      if (day[1] !== "invisible" && day[0]) {
                        // Use navigate to move to a new route for the specific date
                        navigate(`tutor/calendar/${date.getFullYear()}/${date.getMonth() + 1}/${day[0]}`);
                      }
                    }}
                    className={`hover:bg-slate-500 active:bg-slate-700 align-top border-2 border-black aspect-square ${day[1]}`}
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
