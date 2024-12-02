import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../hooks/AuthProvider";
import Notification from "../../classes/Notification";
import { showToast } from "./ToastMessage";

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
}

export default function DropdownWithSearch(props: DropdownWithSearchProps) {
  const user = useAuth();
  const [searchTerm, setSearchTerm] = useState<string>(""); // For search term
  const [filteredOptions, setFilteredOptions] = useState<DropdownOption[]>([]); // For filtered options
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // Track if dropdown is open
  const dropdownRef = useRef<HTMLDivElement>(null); // Create a ref for the dropdown container

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

    console.log("optionValue");
    console.log(optionValue);
    console.log("end");

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
    /*
    if (newRec != "") {
      // Function to handle adding a new record to the database
      try {
        const response = await fetch(`http://localhost:1337/api/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          //body: JSON.stringify({ label: searchTerm, value: searchTerm }), // Adjust payload as necessary
          body: JSON.stringify({ data: new Notification("{}", "{" + props.label + ":" + newRec + "}", user.user) }),
        });

        if (!response.ok) {
          throw new Error("Failed to add new record");
        }

        const newRecord = await response.json();

        showToast({ message: `New record added: ` + newRec, type: "info" });

        // Add the new option to the dropdown list
        props.onChange(searchTerm); // Set the new record as the selected value
        //setSearchTerm(""); // Clear the search input
        setIsDropdownOpen(false); // Close dropdown
      } catch (error) {
        showToast({ message: `Error while adding new notification`, type: "error" });
      }
    } */
  };

  // Get the label of the currently selected value (if any)
  const selectedOptionLabel = props.options.find((option) => option.value === props.value)?.label || "";

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      handleAddNewRecord();
    }
  };

  return (
    <div className="relative w-96" ref={dropdownRef} onKeyDown={handleKeyPress}>
      {props.label && <div className="font-bold">{props.label}</div>}
      {props.disabled ? (
        <div className="mb-2 inline-block">{selectedOptionLabel}</div>
      ) : (
        <div className="relative mt-1">
          <input
            type="text"
            placeholder={selectedOptionLabel || props.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
              className={`mb-2 border border-gray-300 p-2 w-80 rounded-md px-1 placeholder-black ${
                searchTerm === "" && props.value ? "text-black" : "text-black"
              }`}
          />
          {isDropdownOpen && (
            <ul className="absolute bg-white shadow-lg z-50 w-80">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelectOption(option.value)}
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
                >
                  "{searchTerm}"
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );  
}
