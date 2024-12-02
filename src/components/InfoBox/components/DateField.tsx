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
    <div>
      {props.title !== undefined ? <div className="font-bold">{props.title + " "}</div> : null}
      {props.editMode ? (
        <div>
          {/* Date Input */}
          <input
            type="date"
            value={moment(props.dateValue).format("YYYY-MM-DD")} // Input expects YYYY-MM-DD format
            onChange={props.onDateChange}
            className="border border-gray-300 p-2 w-48 rounded-md"
          />
          {/* Time Input */}
          <input type="time" value={formattedTime} onChange={props.onTimeChange} className="border border-gray-300 p-2 w-32 rounded-md ml-1"/>
        </div>
      ) : (
        <div>
          <span>
            {formattedDate} {formattedTime}
          </span>
        </div>
      )}
    </div>
  );
}
