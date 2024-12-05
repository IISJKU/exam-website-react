import { t } from "i18next";
import React, { useState } from "react";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownProps {
  label: string;
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
    <div role="group" aria-labelledby={`dropdown-label-${props.label.toLowerCase()}`}>
      {props.label ? (
        <label id={`dropdown-label-${props.label.toLowerCase()}`} className="font-bold">{t(props.label) + " "}</label>
      ) : (
        <></>
          )}
        <div className="mb-2 inline-block ">
            <select
                value={value}
                onChange={handleChange}
                disabled={props.disabled}
                className="form-control border border-gray-300 p-2 rounded-md"
                aria-labelledby={`dropdown-label-${props.label.toLowerCase()}`} 
                aria-required="false"
                aria-disabled={props.disabled ? "true" : undefined} 
            >
                <option value="" disabled>
                {t(`Select a ${props.label.toLowerCase()}`)}
                </option>
                {props.options.map((option) => (
                  <option key={option.value} value={option.value}>
                      {option.label}
                  </option>
                ))}
            </select>
        </div>
    </div>
  );
}
