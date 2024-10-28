import { useRef } from "react";
import Exam from "../../classes/Exam";

interface EntryProps {
  width: number | undefined;
  height: number | undefined;
  x: number | undefined;
  y: number | undefined;
  exam: Exam;
}

export default function CalendarEntry(props: EntryProps) {
  const classNames = ["bg-orange-400", "bg-amber-300", "bg-red-300", "bg-teal-200"];

  let width = 0;
  let y = 0;

  let staticCSS = "absolute overflow-hidden border-2 border-black hover:opacity-70 hover:ring-4";

  if (props.width != undefined) width = props.width - 2;
  return (
    <div
      className={classNames[Math.floor(Math.random() * classNames.length)] + " " + staticCSS}
      style={{
        width: `calc(${props.width}px - 3px)`,
        height: `calc(${props.height}px )`,
        left: `${props.x}px`,
        top: `calc(${props.y}px)`,
      }}
    >
      <div className="text-sm">{props.exam.major.toString()}</div>
      <div className="text-sm">aadgfg</div>
    </div>
  );
}
