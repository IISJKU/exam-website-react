import React, { useState, useEffect, useRef } from "react";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownWithSearchProps {
  label: string;
  options: DropdownOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function DropdownWithSearch(props: DropdownWithSearchProps) {
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
    setIsDropdownOpen(false); // Close dropdown after selection
    setSearchTerm(""); // Clear search term after selection
  };

  // Get the label of the currently selected value (if any)
  const selectedOptionLabel = props.options.find((option) => option.value === props.value)?.label || "";

  return (
    <div className="relative w-96" ref={dropdownRef}>
      {" "}
      {/* Add ref to the dropdown container */}
      {props.label !== undefined ? <div className="font-bold">{props.label + " "}</div> : null}
      {props.disabled ? (
        <div className="mb-2 inline-block ">{selectedOptionLabel}</div>
      ) : (
        <div className="relative mt-1">
          <input
            type="text"
            placeholder={selectedOptionLabel || props.placeholder} // Show selected label or placeholder
            value={searchTerm} // Show search term while typing
            onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown on click
            className={`block mb-2 bg-slate-100 focus:ring-2 border-2 border-black px-1 placeholder-black ${
              searchTerm === "" && props.value ? "text-black" : "text-gray-500"
            }`}
          />
          {isDropdownOpen && (
            <ul className="absolute mb-2 bg-slate-100 inline-block focus:ring-2 border-2 border-black px-1 z-50">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <li
                    key={option.value}
                    onClick={() => handleSelectOption(option.value)} // Select the option
                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                      option.value === props.value ? "bg-gray-100 text-black font-bold" : "text-gray-900"
                    } hover:bg-indigo-500 hover:text-white`}
                  >
                    {option.label}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 cursor-default select-none relative py-2 pl-3 pr-9">No options found</li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
