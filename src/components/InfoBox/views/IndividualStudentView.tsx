import { useState } from "react";
import EditField from "../components/EditField";
import Student from "../../classes/Student";

interface IndividualStudentProps {
  student: Student;
}

export default function IndividualStudent(props: IndividualStudentProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  let editText = "Click to Edit";

  if (editMode) {
    editText = "Stop Editing";
  }

  return (
    <div className="m-10 ">
      <EditField
        title="First Name"
        editMode={editMode}
        text={props.student.first_name}
      />
      <EditField
        title="Last Name"
        editMode={editMode}
        text={props.student.last_name}
      />
      <EditField title="EMail" editMode={editMode} text={props.student.email} />
      <EditField title="Phone" editMode={editMode} text={props.student.phone} />
      <EditField
        title="Registration"
        editMode={editMode}
        text={props.student.matrikel_number}
      />
      <EditField
        title="Emergency Contact"
        hideTitle={false}
        editMode={editMode}
        text={props.student.emergency_contact}
      />
      <EditField
        title="Overtime"
        hideTitle={false}
        editMode={editMode}
        text={props.student.bouns_time}
      />{" "}
      <br />
      <EditField
        title="Misc"
        editMode={editMode}
        text={props.student.misc}
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
