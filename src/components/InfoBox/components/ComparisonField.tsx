import React, { useState, useEffect, useRef } from "react";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface ComparisonField {
  label: string;
  options: DropdownOption[];
  value: string | number;
  proposedVal: string | number | undefined;
}

export default function ComparisonField(props: ComparisonField) {
  // Get the label of the currently selected value (if any)
  const selectedOptionLabel = props.options.find((option) => option.value === props.value)?.label || "";

  console.log(props.proposedVal);

  if (props.proposedVal != undefined)
    return (
      <div className="relative w-96">
        {/* Add ref to the dropdown container */}
        {props.label !== undefined ? <div className="font-bold">{props.label + " "}</div> : null}
        <div className="mb-2 inline-block ">
          <div className="line-through">{selectedOptionLabel}</div>
          <div className="text-red-400">{props.proposedVal}</div>
        </div>
      </div>
    );
  else {
    return (
      <div className="relative w-96">
        {/* Add ref to the dropdown container */}
        {props.label !== undefined ? <div className="font-bold">{props.label + " "}</div> : null}
        <div className="mb-2 inline-block ">{selectedOptionLabel}</div>
      </div>
    );
  }
}
