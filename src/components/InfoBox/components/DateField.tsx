import moment from "moment";
import React from "react";

interface DateFieldProps {
  editMode: boolean;
  dateValue: string; // The full ISO date-time string
  onDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DateField(props: DateFieldProps) {
  // Format the date and time as per "en-GB" (DD/MM/YYYY HH:mm)
  const formattedDate = props.dateValue ? moment(props.dateValue).format("DD/MM/YYYY") : "";
  const formattedTime = props.dateValue ? moment(props.dateValue).format("HH:mm"): "";

  return (
    <div>
      {props.editMode ? (
        <div>
          {/* Date Input */}
          <input
            type="date"
            value={moment(props.dateValue).utc().format("YYYY-MM-DD")} // Input expects YYYY-MM-DD format
            onChange={props.onDateChange}
            className="border-2 border-black p-1"
          />
          {/* Time Input */}
          <input
            type="time"
            value={formattedTime}
            onChange={props.onTimeChange}
            className="border-2 border-black p-1 ml-2"
          />
        </div>
      ) : (
        <div>
          <span>{formattedDate} {formattedTime}</span>
        </div>
      )}
    </div>
  );
}
