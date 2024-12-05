import moment from "moment-timezone";
import React from "react";

interface DateFieldProps {
  editMode: boolean;
  title?: string;
  dateValue: string; // The full ISO date-time string
  onDateChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DateField(props: DateFieldProps) {
  // Format the date and time as per "en-GB" (DD/MM/YYYY HH:mm)
  const formattedDate = props.dateValue ? moment(props.dateValue).format("YYYY-MM-DD") : "";
  const formattedTime = props.dateValue ? moment(props.dateValue).format("HH:mm") : "";

  return (
    <div role="group" aria-labelledby={props.title ? `datefield-${props.title.replace(/\s+/g, "-").toLowerCase()}` : undefined} >
      {props.title ? <label id={`datefield-${props.title.replace(/\s+/g, "-").toLowerCase()}`} className="font-bold">{props.title + " "}</label> : null}
      {props.editMode ? (
        <div>
          {/* Date Input */}
          <label htmlFor="date-input" className="sr-only">
            Enter date
          </label>
          <input
            id="date-input"
            type="date"
            value={moment(props.dateValue).format("YYYY-MM-DD")} // Input expects YYYY-MM-DD format
            onChange={props.onDateChange}
            className="border border-gray-300 p-2 w-48 rounded-md"
            aria-required="true"
            aria-label="Enter date"
          />
          {/* Time Input */}
          <label htmlFor="time-input" className="sr-only">
            Enter time
          </label>
          <input id="time-input" type="time" value={formattedTime} onChange={props.onTimeChange} className="border border-gray-300 p-2 w-32 rounded-md ml-1" aria-required="true"
            aria-label="Enter time" />
        </div>
      ) : (
        <div>
          <span aria-label={`Selected date and time: ${formattedDate} ${formattedTime}`}>
            {formattedDate} {formattedTime}
          </span>
        </div>
      )}
    </div>
  );
}
