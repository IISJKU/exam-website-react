import { useEffect, useState } from "react";
import EditField from "../components/EditField";
import Tutor from "../../classes/Tutor";
import Exam from "../../classes/Exam";

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
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  let editText = "Click to Edit";

  if (editMode) {
    editText = "Stop Editing";
  }

  let name = "";
  let date = "";
  let duration = "";
  let tutor = "";

  let registrationNumbers: string[] = [];

  let d = new Date(props.exam.date);
  let students: Student[] = [];

  if (props.exam?.title != undefined) name = props.exam.title.toString();
  if (props.exam?.tutor != undefined) tutor = props.exam.tutor.toString();
  if (props.exam?.date != undefined) {
    date = moment(d).format("D MMM, YYYY HH:mm");
    duration = props.exam.duration.toString();
  }

  /*  if (props.exam?.students != undefined) {
    registrationNumbers = props.exam.students;
  } */

  // Fetch data from Strapi API
  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/students");
      const data = await response.json();
      setStudentData(data["data"]); // Update state with fetched students
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  studentData.forEach((element) => {
    students.push(element["attributes"]);
  });

  if (loading) {
    return <p>Loading students...</p>; // Display loading indicator while fetching
  }

  if (props.exam != undefined) {
    return (
      <div className="m-5">
        <EditField
          title={"Exam Title"}
          editMode={editMode}
          text={name}
          hideTitle={false}
        />

        <DateField editMode={editMode} text={date} hideTitle={false} />

        <EditField
          title={"Duration"}
          editMode={editMode}
          text={duration}
          hideTitle={false}
        />

        <EditField
          title={"Tutor"}
          editMode={editMode}
          text={tutor}
          hideTitle={false}
        />

        <MultiField
          title={"Students"}
          editMode={editMode}
          elements={students}
        />

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
