import { t } from "i18next";
import React, { useState, useEffect, useRef } from "react";

interface Option {
  label: string;
  value: string | number;
}

interface MultiSelectProps {
  options: Option[];
  value: (string | number)[];
  onChange: (selected: (string | number)[]) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export default function MultiSelect(props: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(props.options);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  let classList = props.label ? "flex flex-col relative w-80 mt-1" : "flex flex-col relative w-full";


  useEffect(() => {
    if (searchTerm) {
      setFilteredOptions(
        props.options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(props.options);
    }
  }, [searchTerm, props.options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!props.disabled) setIsOpen(!isOpen);
  };

  const handleSelectOption = (selectedValue: string | number) => {
    if (props.value.includes(selectedValue)) {
        props.onChange(props.value.filter((v) => v !== selectedValue)); // Remove if already selected
    } else {
        props.onChange([...props.value, selectedValue]); // Add new selection
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev === null || prev >= filteredOptions.length - 1 ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev === null || prev <= 0 ? filteredOptions.length - 1 : prev - 1));
    } else if (e.key === "Enter" && highlightedIndex !== null) {
      e.preventDefault();
      handleSelectOption(filteredOptions[highlightedIndex].value);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={classList} ref={dropdownRef} tabIndex={0}>
        {props.label && <label className="block font-bold mb-1">{t(props.label)}</label>}
        {props.disabled ? (
        <div className="mb-2">
            {props.value
            .map((selected) => props.options.find((opt) => opt.value === selected)?.label)
            .filter(Boolean)
            .join(", ")}
        </div>
        ) : (
        <div className={`border border-gray-300 p-2 rounded-md cursor-pointer bg-white ${props.disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-500"}`}
          onClick={toggleDropdown}
        >
          <div className="flex flex-wrap gap-2">
            {props.value.length > 0 ? (
              props.value.map((selected) => (
                <span key={selected} className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm flex items-center" tabIndex={0}>
                  {props.options.find((opt) => opt.value === selected)?.label}
                    <button
                      className="ml-2 text-white hover:text-gray-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOption(selected);
                      }}
                      aria-label={t("Delete value")}
                      tabIndex={0}
                      >
                        ✕
                      </button>
                </span>
              ))
            ) : (
              <span tabIndex={0}>{props.placeholder || t("Select options...")}</span>
            )}
          </div>
        </div>
      )}
      {isOpen && (
        <div className="absolute top-full left-0 z-10 border border-gray-300 p-2 w-full rounded-md bg-white shadow-lg transition-all duration-200">
          <input
            type="text"
            className="w-full border-b"
            placeholder={t("Search...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          />
          <ul className="max-h-32 overflow-auto" tabIndex={-1}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  className={`p-2 cursor-pointer ${
                    props.value.includes(option.value) ? "bg-blue-100 font-bold" : ""
                  } ${highlightedIndex === index ? "bg-blue-500 text-white" : "hover:bg-white"}`}
                  onClick={() => handleSelectOption(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  tabIndex={0}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">{t("No options found")}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
