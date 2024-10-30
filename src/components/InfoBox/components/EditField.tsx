import { ChangeEvent, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface EditFieldProps {
  editMode: boolean;
  text: string | number;
  title?: string;
  hideTitle?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EditField(props: EditFieldProps) {
  const [value, setValue] = useState<string | number>(props.text);
  const { t } = useTranslation();
  let hide = true;
  let classList = "";
  let additionalText = "";

  // Synchronize internal state with props.text whenever it changes
  useEffect(() => {
    setValue(props.text);
  }, [props.text]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (props.onChange) {
      props.onChange(e); // Call the onChange prop if provided
    }
  }

  if (props.hideTitle !== undefined) hide = props.hideTitle;

  if (
    (props.title === "First Name" ||
      props.title === "Last Name" ||
      props.title === "Exam Title") &&
    !props.editMode
  )
    classList = "inline-block pr-2 text-3xl";
  if (props.title === "Duration") additionalText = " min";

  return (
    <div className={classList}>
      {props.title && (props.editMode || !hide) && (
        <div className="font-bold">{t(props.title) + " "}</div>
      )}
      {props.editMode ? (
        <input
          onChange={handleChange}
          className="mb-2 bg-slate-100 inline-block focus:ring-2 border-2 border-black px-1"
          type="text"
          value={value}
        />
      ) : (
        <div className="mb-2 inline-block ">
          {value}
          {additionalText}
        </div>
      )}
    </div>
  );
}
