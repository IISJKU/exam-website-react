import { t } from "i18next";
import React from "react";

interface BooleanDropdownProps {
  label?: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export default function BooleanDropdown(props: BooleanDropdownProps) {
  const options = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value === "true";
    props.onChange(selectedValue);
  };

  return (
    <div className="flex flex-col relative w-96 mt-1">
      {props.label && (
        <label className="font-bold">
          {props.label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}
       {props.disabled ? (
        <div className="mb-2">{t(String(props.value))}</div>
      ) : (
        <div className="relative mt-1">
          <select
            className={`mt-1 mb-2 border border-gray-300 p-2 w-80 rounded-md px-1 rounded-md`}
            value={props.value !== null ? props.value.toString() : ""}
            onChange={handleChange}
            disabled={props.disabled}
            required={props.required}
          >
            {options.map((option) => (
              <option key={option.value.toString()} value={option.value.toString()}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        )}
    </div>
  );
}
