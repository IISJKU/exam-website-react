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
    <div className="">
      <EditField
        title={"First Name"}
        editMode={editMode}
        text={props.tutor.first_name}
      />
      <EditField
        title={"Last Name"}
        editMode={editMode}
        text={props.tutor.last_name}
      />
      <EditField title={"EMail"} editMode={editMode} text={props.tutor.email} />
      <EditField title={"Phone"} editMode={editMode} text={props.tutor.phone} />
      <EditField
        title={"Registration"}
        editMode={editMode}
        text={props.tutor.matrikel_number}
      />
      <EditField
        title={"Course"}
        editMode={editMode}
        text={props.tutor.course}
      />{" "}
      <br />
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
