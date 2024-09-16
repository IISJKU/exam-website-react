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
    <div className="m-10 ">
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
      <EditField
        title={"EMail"}
        editMode={editMode}
        text={props.tutor.email}
        hideTitle={false}
      />
      <EditField
        title={"Phone"}
        editMode={editMode}
        text={props.tutor.phone}
        hideTitle={false}
      />
      <EditField
        title={"Matrikel Nr"}
        editMode={editMode}
        text={props.tutor.matrikel_number}
        hideTitle={false}
      />
      <EditField
        title={"Course"}
        editMode={editMode}
        text={props.tutor.course}
        hideTitle={false}
      />
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
