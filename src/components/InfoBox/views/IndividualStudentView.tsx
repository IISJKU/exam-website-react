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
    <div>
      <div className="font-bold">First Name</div>
      <EditField editMode={editMode} text={props.student.firstName} />
      <div className="font-bold">Last Name</div>
      <EditField editMode={editMode} text={props.student.lastName} />
      <div className="font-bold">EMail</div>
      <EditField editMode={editMode} text={props.student.eMail} />
      <div className="font-bold">Phone</div>
      <EditField editMode={editMode} text={props.student.phone} />
      <div className="font-bold">Emergency Contact</div>
      <EditField editMode={editMode} text={props.student.emergencyPhone} />
      <div className="font-bold">Registration</div>
      <EditField editMode={editMode} text={props.student.registrationNumber} />
      <div className="font-bold">Overtime</div>
      <EditField editMode={editMode} text={props.student.bonusTime} /> <br />
      <div className="font-bold">Misc</div>
      <EditField editMode={editMode} text={props.student.misc} /> <br />
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
