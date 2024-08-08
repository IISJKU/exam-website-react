import { HTMLInputTypeAttribute, MouseEventHandler } from "react";
import { useState } from "react";
import examData from "../TestData/Exams.json";
import { InfoBoxView } from "./InfoBox/InfoBox";

interface CalendarProps {
  callback: Function;
}

export default function Calendar(props: CalendarProps) {
  const [date, setDate] = useState(new Date());
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];

  function getWeekday(d: Date): string {
    let key = d.getDay();
    key = key - 1;
    if (key < 0) key = 6;
    return weekdays[key];
  }

  function switchMonth(add: number): void {
    let newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    newDate.setMonth(date.getMonth() + add);
    setDate(newDate);
  }

  function getRows(month: number, year: number): string[][][] {
    let currentDate = new Date(year, month, 1);
    let count = 1;
    let numDays = new Date(year, month + 1, 0).getDate() + 1;

    let row: string[][] = [];

    let rows: string[][][] = [];

    while (count < numDays) {
      row = [];
      for (let i = 0; i < 7; i++) {
        if (currentDate.getDate() == 1 && getWeekday(currentDate) != weekdays[i]) {
          row.push(["", "invisible"]);
        } else if (count < numDays) {
          let examString = "";
          examData.forEach((exam) => {
            let examDate = new Date(exam.date);

            if (
              examDate.getDate() == currentDate.getDate() &&
              examDate.getMonth() == currentDate.getMonth() &&
              examDate.getFullYear() == currentDate.getFullYear()
            ) {
              examString = "bg-slate-400";
            }
          });
          row.push([String(currentDate.getDate()), " " + examString]); //i put the class text here, because this allows us to add class names individually
          currentDate.setDate(currentDate.getDate() + 1);
          count++;
        } else {
          row.push(["", "invisible"]);
          count++;
        }
      }
      rows.push(row);
    }

    return rows;
  }

  //month[date.getMonth()] <div className="text-2xl">{getWeekday(date)}</div>
  return (
    <div
      className="
        w-full
        aspect-square select-none "
    >
      <div
        className="
            bg-slate-100 border-2 border-black 
            p-1 aspect-square
            "
      >
        <div className="bg-slate-300 w-full flex content-center justify-center content-stretch my-1 text-sm">
          <button
            className="basis-1/5 text-left hover:underline"
            onClick={() => {
              switchMonth(-1);
            }}
          >
            &lt; Prev
          </button>
          <div className="basis-3/5 text-center">
            {month[date.getMonth()]} {date.getFullYear()}{" "}
          </div>
          <button
            onClick={() => {
              switchMonth(1);
            }}
            className="basis-1/5 text-right hover:underline"
          >
            Next &gt;
          </button>
        </div>
        <table className="w-full text-sm text-left text-l table-fixed ">
          <thead>
            <tr>
              {weekdays.map((weekday) => (
                <th className="">{weekday.substring(0, 2)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getRows(date.getMonth(), date.getFullYear()).map((row) => (
              <tr className={""}>
                {row.map((day) => (
                  <td
                    onClick={() => {
                      if (day[1] != "invisible" && day[1] != "" && day[1] != undefined)
                        props.callback(InfoBoxView.CalendarBig, new Date(date.getFullYear(), date.getMonth(), parseInt(day[0])));
                    }}
                    className={"hover:bg-slate-500 active:bg-slate-700 align-top border-2 border-black aspect-square" + day[1]}
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
