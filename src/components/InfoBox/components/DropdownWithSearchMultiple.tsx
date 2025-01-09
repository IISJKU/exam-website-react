import { useState, useRef } from "react";
import DropdownWithSearch from "./DropdownWithSearch";
import { useTranslation } from "react-i18next";
import Tutor from "../../classes/Tutor";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownWithSearchMultipleProps {
  tableName: string;
  label: string;
  options: DropdownOption[];
  value: string | number;
  values: Tutor[];
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  submit?: boolean;
  required?: boolean;
}

export default function DropdownWithSearchMultiple(props: DropdownWithSearchMultipleProps) {
  const { t } = useTranslation();
  const initValue = useRef(props.value);
  const [dropdownValue, setDropdownValue] = useState<number>();
  const [checked, setChecked] = useState<boolean[]>(
    new Array<boolean>(props.values.length + 1).fill(false)
  );

  const checkIfContainsTutor = (): any[] => {
    let val = props.options[Number(initValue.current) - 1];

    if (props.options.length == 0 || !initValue || !val) return [];

    let contains = false;

    props.values.forEach((el) => {
      if (el.first_name + " " + el.last_name == val.label) contains = true;
    });

    if (contains) return [];
    else {
      let name = val.label;
      let id = val.value;
      return [{ id: id, first_name: name.substring(0, name.indexOf(" ")).trim(), last_name: name.substring(name.indexOf(" "), name.length).trim() }];
    }
  };

  let values = props.values;

  if (checkIfContainsTutor().length != 0) values = checkIfContainsTutor().concat(values);

  const click = (index: number) => {
    let temp = new Array<boolean>(values.length + 1).fill(false);
    if (!checked[index]) temp[index] = true;
    setChecked(temp);

    if (index == values.length) {
      props.onChange(dropdownValue || "");
      return;
    }

    props.options.forEach((el) => {
      if (values[index].first_name + " " + values[index].last_name == el.label) {
        props.onChange(el.value);
      }
    });
  };

  const dropdownValueChanged = (num: number) => {
    setDropdownValue(num);
    let temp = new Array<boolean>(values.length + 1).fill(false);
    temp[values.length] = true;
    setChecked(temp);

    props.onChange(num);
  };

  const isChecked = (elem: Tutor): boolean => {
    if (props.options && elem.first_name + " " + elem.last_name == props.options[Number(props.value) - 1].label) {
      return true;
    }

    return false;
  };

  let filteredDropDownOptions = (): any[] => {
    let t = new Array();
    props.options.forEach((el1) => {
      let add = true;
      values.forEach((el2) => {
        if (el1.label == el2.first_name + " " + el2.last_name) {
          add = false;
        }
      });

      if (add) t.push(el1);
    });

    return t;
  };

  return (
    <div
      className={`relative w-96`}
      role="combobox"
      aria-haspopup="listbox"
      aria-owns="dropdown-list"
      aria-labelledby={`dropdown-label-${props.label}`}
      tabIndex={0}
    >
      {props.label && (
        <label id={`dropdown-label-${props.label}`} className="font-bold" htmlFor="dropdown-input">
          {t(props.label)}
          {props.required && <span className="text-red-500"> *</span>}
        </label>
      )}
      {props.disabled ? (
        <div className={`${props.value && "grid grid-flow-col border border-slate-200"}`}>
          {props.value && props.options.length != 0 ? (
            <div className="bg-slate-100 p-1 m-1">
              <div className="font-light">{t("Selected Tutor")}: </div>
              <div>{props.options[Number(props.value) - 1]?.label}</div>
            </div>
          ) : (
            <div></div>
          )}
          <div className="p-1 m-1 border ">
            {values.length != 0 ? (
              <div className="font-light">{t("Registered Tutor(s)")}:</div>
            ) : (
              <div className="italic font-light">🚨 {t("No Tutors assigned themselves yet")}</div>
            )}
            {
              /* All of the fields */
              values.map((elem: Tutor, index) =>
                <div key={index}>{elem["first_name"] + " " + elem["last_name"]}</div>
              )
            }
          </div>
        </div>
      ) : (
          <>
          <div className={`${!props.disabled ? "mt-1 bg-slate-100 border border-gray-300 rounded-md p-2" : ""}`}>
            {values.map((elem: Tutor, index) => (
              
              <div key={index} className="align-middle w-full hover:bg-slate-300 rounded-md group-focus:bg-slate-300">
                <input
                  className="align-middle inline-block w-5 h-5"
                  type="checkbox"
                  id={"tutorCheckbox" + index}
                  name={"tutorCheckbox" + index}
                  checked={isChecked(elem)}
                  onClick={() => {
                    click(index);
                  }}
                />
                <label htmlFor={"tutorCheckbox" + index} className="align-middle inline-block pl-3">
                  {elem["first_name"] + " " + elem["last_name"]}
                </label>
              </div>
            ))}
            <div className="inline-block w-full">
              <input
                className="align-middle inline-block w-5 h-5 mr-3"
                type="checkbox"
                id={"nuTutorCheckbox"}
                checked={checked[values.length]}
                onChange={() => {}}
                onClick={() => {
                  click(values.length);
                }}
                disabled={!dropdownValue}
              />
              <div className="align-middle inline-block w-80">
                <DropdownWithSearch
                  tableName="tutors"
                  options={filteredDropDownOptions()}
                  value={dropdownValue || ""}
                  onChange={(newValue) => dropdownValueChanged(Number(newValue))}
                  placeholder={t("Add tutor")}
                  disabled={props.disabled}
                  aria-label={t("Exam Tutor")}
                />
              </div>
            </div>
          </div>   
        </>
      )}
    </div>
  );
}
