import { useState } from "react";
import { useTranslation } from "react-i18next";

interface DateFieldProps {
  editMode: boolean;
  text: string;
  hideTitle?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DateField(props: DateFieldProps) {
  const monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let dateString = props.text;

  let defaultDate = new Date(dateString);

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(
    props.text
      .substring(props.text.lastIndexOf(" "), props.text.length)
      .replaceAll("-", ":")
      .trim()
  );

  const { t } = useTranslation();
  const title = "Date/Time";
  let hide = true;
  let classList = "";

  if (props.hideTitle != undefined) hide = props.hideTitle;

  const onSetDate = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(new Date(event.target.value));
    if (props.onChange) {
      props.onChange(event); // Call the onChange prop if provided
    }
  };

  const onSetTime = (event: React.ChangeEvent<HTMLInputElement>) => {
    /*
    let val = event.target.value;
    let hours = +val.substring(0, val.indexOf(":"));
    let minutes = +val.substring(val.indexOf(":"), val.length).replaceAll(":", "");
    let t = date;
    t.setHours(hours, minutes); */

    setTime(event.target.value);
  };

  return (
    <div className={classList}>
      {props.editMode || !hide ? (
        <div className="font-bold">{t(title) + " "}</div>
      ) : (
        <></>
      )}
      {props.editMode ? (
        <div>
          <input
            aria-label="Date"
            className="border-2 border-black focus:ring-2 bg-slate-100 "
            type="date"
            value={date.toLocaleDateString("en-CA")}
            onChange={onSetDate}
          />{" "}
          <input
            aria-label="Time"
            onChange={onSetTime}
            className="border-2 border-black focus:ring-2 bg-slate-100 "
            type="time"
            value={time}
            step="900"
          />
        </div>
      ) : (
        <div className="mb-2 inline-block ">{props.text}</div>
      )}
    </div>
  );
}
