import React from "react";
import { ExamStatus } from "../../classes/Exam";

interface StatusSelectorProps {
  title?: string;
  value: ExamStatus;
  disabled?: boolean;
  onChange: (newValue: ExamStatus) => void;
  description?: string;  // Optional description for the dropdown
}

export default function StatusSelector(props: StatusSelectorProps) {
    const options = Object.values(ExamStatus);
    let classList = (props.title) ? "flex flex-col relative w-96 mt-2" : "flex flex-col relative w-full";

  return (
      <div className={classList}>
        {props.title ?
        <label 
            htmlFor="status" 
            className="font-bold"
            id="status-label"
        >
            {props.title}
        </label> : null}
      {props.description && (
        <p id="status-description" className="text-sm text-gray-500">
          {props.description}
        </p>
      )}
       {props.disabled ? (
        <div className="mb-2">{props.value}</div>
      ) : (
        <select
          id="status"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value as ExamStatus)}
          className={`mt-1 mb-2 border border-gray-300 p-2 w-80 rounded-md px-1 w-full rounded-md`}
          aria-labelledby="status-label"
          aria-describedby={props.description ? "status-description" : undefined}
        >
          {options.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)} {/* Capitalized */}
            </option>
          ))}
          </select>
      )}
    </div>
  );
};

