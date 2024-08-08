import { useState } from "react";
import EditField from "../components/EditField";
import Tutor from "../../classes/Tutor";

interface IndividualTutorProps {
  tutor: Tutor;
}

export default function IndividualTutor(props: IndividualTutorProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  let editText = "Click to Edit";

  if (editMode) {
    editText = "Stop Editing";
  }

  return (
    <div>
      <div className="font-bold">First Name</div>
      <EditField editMode={editMode} text={props.tutor.firstName} />
      <div className="font-bold">Last Name</div>
      <EditField editMode={editMode} text={props.tutor.lastName} />
      <div className="font-bold">EMail</div>
      <EditField editMode={editMode} text={props.tutor.eMail} />
      <div className="font-bold">Phone</div>
      <EditField editMode={editMode} text={props.tutor.phone} />
      <div className="font-bold">Registration</div>
      <EditField editMode={editMode} text={props.tutor.registrationNumber} />
      <div className="font-bold">Course</div>
      <EditField editMode={editMode} text={props.tutor.course} /> <br />
      <button
        onClick={() => {
          setEditMode(!editMode);
        }}
        className="border-2 border-black p-1 hover:bg-slate-400 hover:underline"
      >
        {editText}
      </button>
    </div>
  );
}
