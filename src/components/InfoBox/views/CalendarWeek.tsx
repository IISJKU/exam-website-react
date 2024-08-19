import { LegacyRef, useEffect, useRef, useState } from "react";
import CalendarEntry from "../components/CalendarEntry";
import examData from "../../../TestData/Exams.json";
import Exam from "../../classes/Exam";

interface CalendarProps {
  date?: Date;
}

export default function CalendarWeek(props: CalendarProps) {
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];
  const times = [];

  let days: Date[] = [];

  function getActiveWeekDays() {
    let date = new Date();
    if (props.date) date = props.date;

    for (let i = 0; i < 7; i++) {
      let t = new Date();
      t.setMonth(date.getMonth());
      t.setDate(date.getDate() + (i - weekdays.indexOf(getWeekday(date))));

      days.push(t);
    }
  }

  const [examDateWidth, setExamDateWidth] = useState(1);

  const startTime = 8;
  const endTime = 25;

  for (let i = startTime; i < endTime; i++) times.push(i);

  const cellRef = useRef<HTMLTableCellElement>(null);
  const tableRef = useRef<HTMLTableCellElement>(null);

  let examsThisWeek: Exam[] = [];
  let examPositions: number[][] = [];

  let overLaps: string[][] = [];

  function getUniqueOverlaps() {
    let uniqueNames: [string, number][] = [];

    let count: number[] = [];

    overLaps.forEach((o, index) => {
      let found0 = false;
      let found1 = false;
      uniqueNames.forEach((unique, index) => {
        if (unique[0] == o[0]) {
          uniqueNames[index][1] = uniqueNames[index][1] + 1;
          found0 = true;
        }

        if (unique[0] == o[1]) {
          uniqueNames[index][1] = uniqueNames[index][1] + 1;
          found1 = true;
        }
      });

      if (!found0) {
        uniqueNames.push([o[0], 1]);
      }

      if (!found1) {
        uniqueNames.push([o[1], 1]);
      }
    });
    console.log("uniqueNames");
    console.log(uniqueNames);

    return uniqueNames;
  }

  function solveOverlap() {
    let overlap = true;

    for (let x = 0; x < examsThisWeek.length; x++) {
      for (let y = 0; y < examsThisWeek.length; y++) {
        //define points
        //square 1
        overlap = false;
        if (x != y) {
          let x1 = [examPositions[x][0], examPositions[x][1]];
          let x2 = [examPositions[x][0] + examPositions[x][2], examPositions[x][1] + examPositions[x][3]];

          //square 2
          let y1 = [examPositions[y][0], examPositions[y][1]];
          let y2 = [examPositions[y][0] + examPositions[y][2], examPositions[y][1] + examPositions[y][3]];

          if (y1[0] > x2[0] || y2[0] < x1[0]) {
            overlap = false;
            //console.log("no overlap " + examsThisWeek[x].name + " | " + examsThisWeek[y].name);
          } else overlap = true;

          if (y1[1] > x2[1] || y2[1] < x1[1]) {
            overlap = false;
            //console.log("no overlap " + examsThisWeek[x].name + " | " + examsThisWeek[y].name);
          }
          if (new Date(examsThisWeek[x].date).getDate() != new Date(examsThisWeek[y].date).getDate()) overlap = false;
          else overlap = true;

          if (overlap) {
            if (!overLaps.includes([examsThisWeek[y].name, examsThisWeek[x].name])) {
              let contains = false;

              overLaps.forEach((o) => {
                if (o[1] == examsThisWeek[x].name && o[0] == examsThisWeek[y].name) contains = true;
              });

              if (!contains) overLaps.push([examsThisWeek[x].name, examsThisWeek[y].name]);
            }
          }
        } else overlap = false;
      }
    }

    let uniqueOverlaps = getUniqueOverlaps();
    let positions: [position: number][] = [];

    let solved = false;

    examsThisWeek.forEach((exam, index) => {
      for (var i = 0; i < uniqueOverlaps.length; i++) {
        if (uniqueOverlaps[i][0] == exam.name) {
          examPositions[index][2] = examPositions[index][2] / (uniqueOverlaps[i][1] + 1);
        }
      }
    });
  }

  function getExams() {
    examsThisWeek = [];
    examPositions = [];

    examData.forEach((exam) => {
      let date = new Date(exam.date);

      let firstDay = days[0];
      firstDay.setHours(0, 0, 1);

      let lastDay = days[days.length - 1];
      lastDay.setHours(23, 59, 59); // set it to last possible second, to make comparison possible

      if (date >= firstDay && date <= lastDay) {
        examsThisWeek.push(exam);
        let x: number = 0;
        let y: number = 0;

        let width: number = 0;
        let height: number = 0;

        if (cellRef.current) {
          let index = weekdays.indexOf(getWeekday(date));

          let cellHeight = cellRef.current?.clientHeight + 1.7;
          x = cellRef.current?.clientWidth * index + cellRef.current?.clientWidth;

          y = cellHeight * 2 + cellHeight * (date.getHours() - 10) - 1 + (cellHeight / 60) * date.getMinutes() - 2;

          height = cellRef.current?.clientHeight ? (cellRef.current?.clientHeight / 60) * exam.duration : 1;

          width = examDateWidth;
        }

        examPositions.push([x, y, width, height]);
      }
    });

    solveOverlap();
  }
  getActiveWeekDays();
  getExams();

  useEffect(() => {
    //gets called when mounted, positions examns accordingly
    if (cellRef.current) {
      setExamDateWidth(cellRef.current?.clientWidth);
    }
  });

  function getWeekday(d: Date): string {
    let key = d.getDay();
    key = key - 1;
    if (key < 0) key = 6;
    return weekdays[key];
  }

  if (props.date == undefined) return <div className="w-full h-full">Something Went Wrong</div>;
  else {
    return (
      <table className="relative w-full text-l text-left text-center table-fixed select-none  display-block ">
        <thead>
          <tr>
            <th className="even:bg-slate-200 " ref={cellRef}>
              Time
            </th>
            {weekdays.map((weekday) => (
              <th className="even:bg-slate-200">{weekday.substring(0, 2)}</th>
            ))}
          </tr>
          <tr>
            <td className="even:bg-slate-200  " ref={cellRef}></td>
            {days.map((day) => (
              <td className="even:bg-slate-200 ">
                {day.getDate()}.{day.getMonth() + 1}.{day.getFullYear()}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr>
              <td className="border-2 even:bg-slate-200 even:border-slate-100">{time}:00</td>
              {weekdays.map((weekday) => (
                <td className="border-2 even:bg-slate-200 even:border-slate-100"></td>
              ))}
            </tr>
          ))}
        </tbody>
        {examsThisWeek.map((exam, index) => (
          <CalendarEntry x={examPositions[index][0]} y={examPositions[index][1]} width={examPositions[index][2]} height={examPositions[index][3]} exam={exam} />
        ))}
      </table>
    );
  }
}

/*

<table className="relative w-full text-l text-left text-center table-fixed select-none  display-block ">
          <thead>
            <tr>
              <th className="even:bg-slate-200">Time</th>
              {weekdays.map((weekday) => (
                <th className="even:bg-slate-200">{weekday.substring(0, 2)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr>
                <td className="border-2 even:bg-slate-200 even:border-slate-100">{time}:00</td>
                {weekdays.map((weekday) => (
                  <td className="border-2 even:bg-slate-200 even:border-slate-100"></td>
                ))}
              </tr>
            ))}
          </tbody>
          <div className="absolute left-2 top-0 bg-slate-300" >Calendar Element</div>
        </table>


*/
