import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/AuthProvider";
import Notification from "../../classes/Notification";
import { showToast } from "./ToastMessage";
import DropdownWithSearch from "./DropdownWithSearch";
import { useTranslation } from "react-i18next";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownWithSearchProps {
  tableName: string;
  label: string;
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  submit?: boolean;
  required?: boolean;
}

export default function DropdownWithSearchMultiple(props: DropdownWithSearchProps) {
  let testData = ["a", "b", "c", "d"];
  let selected = [];
  const { t } = useTranslation();

  let checkBoxStates = [false, true, false, false];

  let [checked, setChecked] = useState(checkBoxStates);

  return (
    <div
      className={`relative w-96 ${!props.disabled ? "bg-slate-100 border border-gray-300 rounded-md p-2" : ""}`}
      role="combobox"
      aria-haspopup="listbox"
      aria-owns="dropdown-list"
      aria-labelledby={`dropdown-label-${props.label}`}
      tabIndex={0}
    >
      {props.label && (
        <label id={`dropdown-label-${props.label}`} className="font-bold" htmlFor="dropdown-input">
          {props.label}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {props.disabled ? (
        /* All of the fields */
        testData.map((elem) => <div>{elem}</div>)
      ) : (
        <>
          {testData.map((elem, index) => (
            <div className="align-middle w-full hover:bg-slate-300 rounded-md group-focus:bg-slate-300">
              <input
                className="align-middle inline-block w-5 h-5"
                type="checkbox"
                id={"tutorCheckbox" + index}
                name={"tutorCheckbox" + index}
                checked={checked[index]}
                onClick={() => {
                  let temp = new Array<boolean>(testData.length + 1).fill(false);
                  if (!checked[index]) temp[index] = true;
                  setChecked(temp);

                  console.log(checked[index]);
                }}
              />
              <label htmlFor={"tutorCheckbox" + index} className="align-middle inline-block pl-3">
                {elem}
              </label>
            </div>
          ))}
          <div className="inline-block w-full">
            <input className="align-middle inline-block w-5 h-5 mr-3" type="checkbox" id={"nuTutorCheckbox"} name={"nuTutorCheckbox"} />
            <div className="align-middle inline-block w-80">
              <DropdownWithSearch
                tableName="tutors"
                options={props.options}
                value={props.value}
                onChange={props.onChange}
                placeholder={t("Add tutor")}
                disabled={props.disabled}
                aria-label={t("Exam Tutor")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
