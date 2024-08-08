import { useState } from "react";

interface EditFieldProps {
  editMode: boolean;
  text: string;
}

export default function EditField(props: EditFieldProps) {
  if (props.editMode) return <input className="py-1 mb-2" type="text" defaultValue={props.text}></input>;
  else {
    return <div className="py-1 mb-2">{props.text}</div>;
  }
}
