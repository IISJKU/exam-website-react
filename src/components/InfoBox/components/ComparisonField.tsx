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

  if (props.options.length == 0) selectedOptionLabel = props.value;

  //console.log(props.proposedVal);

  const makeString = (t: any) => {
    if (t == undefined || t == null) return "";

    if (typeof t === "string") return t;
    if (t["name"] != undefined) return t["name"];
    if (t["first_name"] && t["last_name"]) return t["first_name"] + " " + t["last_name"];

    return t.getName();
  };

  if (props.proposedVal != undefined && props.proposedVal != "")
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
