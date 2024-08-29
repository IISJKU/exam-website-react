import { useState } from "react";
import EditField from "../components/EditField";
import Tutor from "../../classes/Tutor";
import Exam from "../../classes/Exam";
import studentData from "../../../TestData/Students.json";

import DateField from "../components/DateField";

import moment from "moment";

import { Event } from "react-big-calendar";
import Student from "../../classes/Student";
import MultiField from "../components/MultiField";

interface ExamEditorProps {
  exam: Exam;
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

  let d = new Date(props.exam.date);
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
      <div className="m-5">
        <EditField title={"Exam Name"} editMode={editMode} text={name} />

        <DateField editMode={editMode} text={date} />

        <EditField title={"Duration"} editMode={editMode} text={duration} />

        <MultiField title={"Students"} editMode={editMode} elements={students} />

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
