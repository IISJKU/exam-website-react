import { useState } from "react";
import EditField from "../components/EditField";
import Tutor from "../../classes/Tutor";
import Exam from "../../classes/Exam";
import studentData from "../../../TestData/Students.json";

import moment from "moment";

import { Event } from "react-big-calendar";
import Student from "../../classes/Student";

interface ExamEditorProps {
  exam?: Exam;
}

export default function ExamEditor(props: ExamEditorProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  let editText = "Click to Edit";

  if (editMode) {
    editText = "Stop Editing";
  }

  let name = "";
  let date = "";
  let duration = "";

  let registrationNumbers: string[] = [];

  let d = new Date();
  let students: Student[] = [];

  if (props.exam?.name != undefined) name = props.exam.name.toString();
  if (props.exam?.date != undefined) {
    date = moment(d).format("D MMM, YYYY HH:mm");
    duration = props.exam.duration.toString();
  }

  if (props.exam?.students != undefined) {
    registrationNumbers = props.exam.students;
  }

  studentData.forEach((student) => {
    registrationNumbers.forEach((num) => {
      if (student.registrationNumber == num) {
        students.push(student);
      }
    });
  });
  if (props.exam != undefined) {
    return (
      <div>
        <div className="font-bold">Exam Name</div>
        <EditField editMode={editMode} text={name} />

        <div className="font-bold">Date</div>
        <EditField editMode={editMode} text={date} />

        <div className="font-bold">Duration</div>
        <EditField editMode={editMode} text={duration} />

        <div className="font-bold">Students</div>

        {students.map((student) => (
          <EditField editMode={editMode} text={student.firstName + " " + student.lastName} />
        ))}

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
  return <div>Something went wrong</div>;
}
