import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/AuthProvider";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownWithSearchProps {
  tableName: string;
  label?: string;
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
  submit?: boolean;
  required?: boolean;
}

export default function DropdownWithSearch(props: DropdownWithSearchProps) {
  const user = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>(""); // For search term
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>([]); // For filtered options
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // Track if dropdown is open
  const dropdownRef = useRef<HTMLDivElement>(null); // Create a ref for the dropdown container
  const inputFieldRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false); // Close the dropdown if clicked outside
      }
    };

    // Attach the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Filter options based on the search term
    const filtered = props.options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredOptions(filtered);
  }, [searchTerm, props.options]);

  const handleSelectOption = (optionValue: string | number) => {
    props.onChange(optionValue); // Call onChange function passed from the parent component
    if (typeof optionValue == "string") optionValue = JSON.parse(optionValue).searchTerm;
    setIsDropdownOpen(false); // Close dropdown after selection
    if (typeof optionValue == "number") setSearchTerm(""); // Clear search term after selection
  };

  function newRecord() {
    let t = "";
    if (filteredOptions.length == 0) {
      if (props.tableName != "") t = t + ' "table" : "' + props.tableName + '",';
      if (props.label != "") t = t + ' "label" : "' + props.label + '",';
      if (searchTerm != "") t = t + ' "searchTerm" : "' + searchTerm + '",';
    }

    if (t != "") {
      t = t.substring(0, t.length - 1);
      t = "{" + t + "}";
    }

    return t;
  }

  const handleAddNewRecord = async () => {
    let newRec = newRecord();
    setIsDropdownOpen(false);
    handleSelectOption(newRec);
  };

  // Get the label of the currently selected value (if any)
  const selectedOptionLabel = props.options.find((option) => option.value === props.value)?.label || "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (isDropdownOpen) {
        if (filteredOptions.length > 0) {
          //handleSelectOption(filteredOptions[0].value); // Select the first filtered option}
        } else handleAddNewRecord(); // Add a new record if no option is selected
      } else setIsDropdownOpen(true);
    } else if (e.key === "Tab") {
      if (e.shiftKey) {
        // If Shift + Tab is pressed, close dropdown if focus moves to the input
        if (document.activeElement === inputFieldRef.current) {
          setIsDropdownOpen(false);
        }
      } else {
        // Close the dropdown when focus moves past the last option
        const lastItem = document.querySelector(`#dropdown-list li:last-child`) as HTMLElement;
        if (document.activeElement === lastItem) {
          setIsDropdownOpen(false);
        }
      }
    }
  };

  return (
    <div
      className="flex flex-col relative w-96 mt-1"
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isDropdownOpen}
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
        <div className="mb-2">{selectedOptionLabel}</div>
      ) : (
        <div className="relative mt-1">
          <input
            id="dropdown-input"
            type="text"
            ref={inputFieldRef}
            tabIndex={0}
            placeholder={selectedOptionLabel || props.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`mb-2 border border-gray-300 p-2 w-80 rounded-md px-1 placeholder-black ${
              searchTerm === "" && props.value ? "text-black" : "text-black"
            }`}
            aria-autocomplete="list"
            aria-controls="dropdown-list"
            aria-activedescendant={isDropdownOpen && filteredOptions.length > 0 ? `option-${filteredOptions[0].value}` : undefined}
            aria-disabled={props.disabled || false}
            required={props.required}
          />
          {isDropdownOpen && (
            <ul id="dropdown-list" role="listbox" className="absolute bg-white shadow-lg z-50 w-80 max-h-40 overflow-auto" tabIndex={-1}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    tabIndex={0}
                    key={option.value}
                    id={`option-${option.value}`}
                    role="option"
                    onClick={() => handleSelectOption(option.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSelectOption(option.value);
                      }
                    }}
                    className={`cursor-pointer select-none py-2 pl-3 pr-9 ${
                      option.value === props.value ? "bg-gray-100 text-black font-bold" : "text-gray-900"
                    } hover:bg-indigo-500 hover:text-white`}
                  >
                    {option.label}
                  </li>
                ))
              ) : (
                <li
                  className="text-black-500 cursor-pointer select-none py-2 pl-3 pr-9 hover:text-indigo-500"
                  onClick={handleAddNewRecord}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddNewRecord();
                    }
                  }}
                >
                  {searchTerm}
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
