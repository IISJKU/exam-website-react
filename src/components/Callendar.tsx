import { HTMLInputTypeAttribute } from "react";
import { useState } from "react";

interface CalendarProps {}

export default function Callendar(props: CalendarProps) {
  const [date, setDate] = useState<Date>(new Date());
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];

  let activeDate = new Date();
  let activeMonth = month[date.getMonth()];

  function getWeekday(d: Date): string {
    let key = d.getDay();
    key = key - 1;
    if (key < 0) key = 6;
    return weekdays[key];
  }

  function getRows(month: number, year: number): String[][][] {
    let currentDate = new Date(year, month, 1);
    let count = 1;
    let numDays = new Date(year, month, 0).getDate();

    let row: String[][] = [];

    let rows: String[][][] = [];

    while (count < numDays) {
      row = [];
      for (let i = 0; i < 7; i++) {
        if (currentDate.getDate() == 1 && getWeekday(currentDate) != weekdays[i]) {
          row.push(["", "invisible"]);
        } else if (count < numDays) {
          row.push([String(currentDate.getDate()), "align-top border-2 border-black"]);
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
      className="bg-slate-100
        w-full xl:w-2/6 lg:w-1/2 md:w-3/5 sm:w-4/5 
        aspect-square "
    >
      <div
        className="
            bg-slate-100 border-2 border-black 
            p-1 m-2 aspect-square
            "
      >
        <div className="w-full flex content-center justify-center content-stretch m-1 text-2xl">
          <button>&lt; Prev</button>
          <div>
            {month[date.getMonth()]} {date.getFullYear()}{" "}
          </div>
          <button>Next &gt;</button>
        </div>
        <table className=" w-full text-sm text-left text-xl table-fixed ">
          <thead>
            <tr>
              {weekdays.map((weekday) => (
                <th className="bg-slate-300">{weekday.substring(0, 2)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getRows(date.getMonth(), date.getFullYear()).map((row) => (
              <tr className="h-20">
                {row.map((day) => (
                  <td className={"" + day[1]}>{day[0]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
