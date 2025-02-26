import moment from "moment-timezone";
import React from "react";
import { useTranslation } from "react-i18next";

interface DateFieldProps {
  editMode: boolean;
  title?: string;
  dateValue: string; // The full ISO date-time string
  onDateChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onTimeChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function DateField(props: DateFieldProps) {
  const { t } = useTranslation();
  // Format the date and time as per "en-GB" (DD/MM/YYYY HH:mm)
  const formattedDate = props.dateValue ? moment(props.dateValue).format("YYYY-MM-DD") : "";
  const formattedTime = props.dateValue ? moment(props.dateValue).format("HH:mm") : "";

  return (
    <div className="flex flex-col relative w-96" role="group" aria-labelledby={props.title ? `datefield-${props.title.replace(/\s+/g, "-").toLowerCase()}` : undefined} tabIndex={0}>
      {props.title ? (<label id={`datefield-${props.title.replace(/\s+/g, "-").toLowerCase()}`} className="font-bold">{t(props.title)}{" "}
        {props.required && <span className="text-red-500">{" "}*</span>}  
      </label>) : null}
      {props.editMode ? (
        <div>
          {/* Date Input */}
          <label htmlFor="date-input" className="sr-only">
          {t("Enter date")}
          </label>
          <input
            id="date-input"
            type="date"
            value={moment(props.dateValue).format("YYYY-MM-DD")} // Input expects YYYY-MM-DD format
            onChange={props.onDateChange}
            className="border border-gray-300 p-2 w-48 rounded-md"
            aria-required="true"
            aria-label={t("Enter date")}
            required={props.required} 
          />
          {props.onTimeChange && (
            <>
              {/* Time Input */}
              <label htmlFor="time-input" className="sr-only">
              {t("Enter time")}
              </label>
              <input id="time-input" type="time" value={formattedTime} onChange={props.onTimeChange} className="border border-gray-300 p-2 w-32 rounded-md ml-1" aria-required="true"
                    aria-label={t("Enter time")} required={props.required} /> 
            </>
          )}
        </div>
      ) : (
        <div>
          <span aria-label={`${t("Selected date and time")}: ${formattedDate} ${props.onTimeChange ? formattedTime : ""}`}>
            {formattedDate} {props.onTimeChange ? formattedTime : ""}
          </span>
        </div>
      )}
    </div>
  );
}
