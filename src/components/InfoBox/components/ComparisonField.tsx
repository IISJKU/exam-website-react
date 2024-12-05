import React, { useState, useEffect, useRef } from "react";
import EntryBase from "../../classes/EntryBase";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface ComparisonField {
  label: string;
  options: DropdownOption[];
  value: string | number;
  proposedVal: string;
}

export default function ComparisonField(props: ComparisonField) {
  // Get the label of the currently selected value (if any)
  let selectedOptionLabel: string | number | undefined = props.options.find((option) => option.value === props.value)?.label || "";

  if (props.options.length == 0) {
    selectedOptionLabel = props.value;
  }

  const makeString = (t: any) => {
    if (t == undefined || t == null) return "";

    if (typeof t === "string") return t;
    if (t["name"] != undefined) return t["name"];
    if (t["first_name"] && t["last_name"]) return t["first_name"] + " " + t["last_name"];

    return t.getName();
  };

  return (
    <div
      className="relative w-96"
      role="region" // Defines this as a distinct region for screen readers
      aria-labelledby={`comparison-field-${props.label?.toLowerCase()}`}
    >
      {/* Label for the dropdown */}
      {props.label && (
        <label
          id={`comparison-field-${props.label?.toLowerCase()}`}
          className="font-bold"
        >
          {props.label}
        </label>
      )}
      
      {/* Current and Proposed Values */}
      <div className="mb-2 inline-block">
        {props.proposedVal ? (
          <>
            <div className="line-through" aria-label={`Current value: ${selectedOptionLabel}`}>
              {selectedOptionLabel}
            </div>
            <div
              className="text-red-400"
              aria-label={`Proposed value: ${props.proposedVal}`}
            >
              {props.proposedVal}
            </div>
          </>
        ) : (
          <div
            aria-label={`Current value: ${selectedOptionLabel}`}
          >
            {selectedOptionLabel}
          </div>
        )}
      </div>
    </div>
  );
}
