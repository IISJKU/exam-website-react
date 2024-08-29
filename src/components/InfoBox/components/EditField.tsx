import { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";

interface EditFieldProps {
  editMode: boolean;
  text: string;
  title?: string;
  hideTitle?: boolean;
}

export default function EditField(props: EditFieldProps) {
  let [value, setValue] = useState(props.text);
  const { t } = useTranslation();
  let hide = true;
  let classList = "";
  let additionalText = "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }

  if (props.hideTitle != undefined) hide = props.hideTitle;

  if ((props.title === "First Name" || props.title === "Last Name" || props.title === "Exam Name") && !props.editMode) classList = "inline-block pr-2 text-3xl";
  if (props.title === "Duration") additionalText = " min";

  return (
    <div className={classList}>
      {props.title != undefined && (props.editMode || !hide) ? <div className="font-bold">{t(props.title) + " "}</div> : <></>}
      {props.editMode ? (
        <input
          onChange={(e) => handleChange(e)}
          className="mb-2 bg-slate-100 inline-block focus:ring-2 border-2 border-black px-1"
          type="text"
          value={value}
        ></input>
      ) : (
        <div className="mb-2 inline-block ">
          {value}
          {additionalText}
        </div>
      )}
    </div>
  );
}
