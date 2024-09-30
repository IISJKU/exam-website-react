import { t } from "i18next";
import React, { useState } from "react";

interface DropdownOption {
  value: string | number;
  title: string;
}

interface DropdownProps {
  title: string;
  options: DropdownOption[];
  value: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
}

export default function Dropdown(props: DropdownProps) {
  const [value, setValue] = useState<string | number>(props.value);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newValue = e.target.value;
    setValue(newValue); 
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div className="">
      {props.title !== undefined ? (
        <div className="font-bold">{t(props.title) + " "}</div>
      ) : (
        <></>
          )}
        <div className="mb-2 inline-block ">
            <select
                value={props.value}
                onChange={handleChange}
                disabled={props.disabled}
                className="form-control"
            >
                <option value="" disabled>
                Select a {props.title.toLowerCase()}
                </option>
                {props.options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.title}
                </option>
                ))}
            </select>
        </div>
    </div>
  );
}
