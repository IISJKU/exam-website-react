import { ChangeEvent, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface EditFieldProps {
  editMode: boolean;
  text: string | number;
  title?: string;
  type?: string;
  hideTitle?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
}

export default function EditField(props: EditFieldProps) {
  const [value, setValue] = useState<string | number>(props.text);
  const { t } = useTranslation();
  let hide = true;
  let classList = "mt-1";
  let additionalText = "";

  // Synchronize internal state with props.text whenever it changes
  useEffect(() => {
    setValue(props.text);
  }, [props.text]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValue(e.target.value);
    if (props.onChange) {
      props.onChange(e); // Call the onChange prop if provided
    }
  }

  if (props.hideTitle !== undefined) hide = props.hideTitle;

  if (
    (props.title === "First Name" ||
      props.title === "Last Name" ||
      props.title === "Exam Title" ||
      props.title === "Vorname" ||
      props.title === "Nachname" ||
      props.title === "Prüfungstitel") &&
    !props.editMode
  ) {
    classList = "relative inline-block pr-2 text-3xl";
  }

  if (props.title === "Duration") additionalText = " min";

  return (
    <div className={classList} tabIndex={0}>
      {props.title && (props.editMode || !hide) && (
        <label htmlFor={`edit-field-${props.title.replace(/\s+/g, "-").toLowerCase()}`} className="font-bold">
          {t(props.title) + " "}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <div className="relative mt-1">
        {props.editMode ? (
          props.title === "Notes" || props.title === "Misc" || props.title === "Updates" ? (
            <textarea
              id={`edit-field-${props.title?.replace(/\s+/g, "-").toLowerCase()}`}
              onChange={handleChange}
              className="mb-2 border border-gray-300 p-2 w-80 rounded-md px-1"
              rows={4}
              cols={40}
              value={value}
              aria-label={t(props.title || "Field")}
              required={props.required}
            />
          ) : (
            <input
              id={`edit-field-${props.title?.replace(/\s+/g, "-").toLowerCase()}`}
              onChange={handleChange}
              className="mb-2 border border-gray-300 p-2 w-80 rounded-md px-1"
              type={props.type || "text"}
              value={value}
              aria-label={t(props.title || "Field")}
              required={props.required}
            />
          )
        ) : (
          <div className="mb-2 inline-block" role="textbox" aria-readonly="true" aria-label={t(props.title || "Field")}>
            {value}
            {additionalText}
          </div>
        )}
      </div>
    </div>
  );
}
