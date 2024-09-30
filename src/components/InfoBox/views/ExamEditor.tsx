import React, { useState, useEffect } from "react";
import EditField from "../components/EditField";
import DateField from "../components/DateField";
import Dropdown from "../components/Dropdown";
import Exam from "../../classes/Exam";
import Student from "../../classes/Student";
import Tutor from "../../classes/Tutor";
import Examiner from "../../classes/Examiner";
import moment from "moment";
import { showToast } from '../components/ToastMessage'; 

interface ExamEditorProps {
  exam: Exam;
}

export default function ExamEditor(props: ExamEditorProps) {
  let exDate = moment(props.exam.date).format("D MMM, YYYY HH:mm");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(props.exam.title);
  const [lva_num, setLvaNum] = useState<number | undefined>(props.exam.lva_num);
  const [date, setDate] = useState<string>(props.exam.date);
  const [duration, setDuration] = useState<number | undefined>(props.exam.duration);
  const [tutor, setTutor] = useState<number>(props.exam.tutor_id);
  const [student, setStudent] = useState<number>(props.exam.student_id);
  const [examiner, setExaminer] = useState<number>(props.exam.examiner_id);
  const [major, setMajor] = useState<string>(props.exam.major);
  const [institute, setInstitute] = useState<string>(props.exam.institute);
  const [mode, setMode] = useState<string>(props.exam.mode);
  const [status, setStatus] = useState<string>(props.exam.status);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [examiners, setExaminers] = useState<Examiner[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/students");
        const result = await response.json();
        setStudents(result["data"].map((student: any) => student.attributes)); // Update state with fetched students
      } catch (error) {
        showToast({ message: "Error fetching students.", type: "error" });
      }
    };

    fetchStudents();
  }, []);

  const studentOptions = students.map(student => ({
    value: student.id,
    title: `${student.first_name} ${student.last_name}`
  }));

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/tutors");
        const result = await response.json();
        setTutors(result["data"].map((tutor: any) => tutor.attributes));
      } catch (error) {
        showToast({ message: "Error fetching tutors.", type: "error" });
      }
    };

    fetchTutors();
  }, []);

  const tutorOptions = tutors.map(tutor => ({
    value: tutor.id,
    title: `${tutor.first_name} ${tutor.last_name}`
  }));

  useEffect(() => {
    const fetchExaminers = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/examiners");
        const result = await response.json();
        setExaminers(result["data"].map((examiner: any) => examiner.attributes));
      } catch (error) {
        showToast({ message: "Error fetching examiners.", type: "error" });
      }
    };

    fetchExaminers();
  }, []);

  const examinerOptions = examiners.map(examiner => ({
    value: examiner.id,
    title: `${examiner.first_name} ${examiner.last_name}`
  }));

  const handleUpdate = async () => {
    const data: Partial<Exam> = {
      title,
      date,
      duration,
      student,
      tutor,
      examiner,
      major,
      institute,
      mode,
      lva_num,
      status,
    };

    try {
      const response = await fetch(
        `http://localhost:1337/api/exams/${props.exam.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `5bad2121f82b63a7e0ba19074b66b646228a9903a550bdca6ae721ba2996be07c4afa42d15dbc1b3ac3b43cf8fc33408c9f730e3aa76533b8fe19e01acd140df0407a55d58f842dc4adc72f940c8517b6f5431ca7b5e0496eb70321c56e378ce61c99b0b52e8367aeaa7cda748961e9edee3dcb9cccd1d905260de298e8eb012`,
          },
          body: JSON.stringify({ data }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        showToast({
          message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`,
          type: "error",
        });
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      showToast({
        message: `${result.data.attributes.title} exam record has been updated successfully.`,
        type: "success",
      });
    } catch (error) {
      showToast({ message: `Error updating the exam record: ${(error as Error).message}.`, type: "error" });
    }
  };

  if (props.exam != undefined) {
    return (
      <div className="m-5">
        <EditField
          title={"Exam Title"}
          editMode={editMode}
          text={props.exam.title}
          hideTitle={false}
          onChange={(e) => setTitle(e.target.value)}
        />

        <EditField
          title={"LVA Num"}
          editMode={editMode}
          text={props.exam.lva_num}
          hideTitle={false}
          onChange={(e) => setLvaNum(Number(e.target.value))}
        />

        <DateField
          editMode={editMode}
          text={exDate}
          hideTitle={false}
          onChange={(e) => setDate(e.target.value)}
        />

        <EditField
          title={"Duration"}
          editMode={editMode}
          text={props.exam.duration}
          hideTitle={false}
          onChange={(e) => setDuration(Number(e.target.value))}
        />

        <Dropdown
          title={"Student"}
          options={studentOptions}
          value={student}
          onChange={(newValue) => setStudent(Number(newValue))}
          disabled={!editMode}
        />

        <Dropdown
          title={"Tutor"}
          options={tutorOptions}
          value={tutor}
          onChange={(newValue) => setTutor(Number(newValue))}
          disabled={!editMode}
        />

        <Dropdown
          title={"Examiner"}
          options={examinerOptions}
          value={examiner}
          onChange={(newVal) => setExaminer(Number(newVal))}
          disabled={!editMode}
        />

        <EditField
          title={"Major"}
          editMode={editMode}
          text={props.exam.major}
          hideTitle={false}
          onChange={(e) => setMajor(e.target.value)}
        />

        <EditField
          title={"Institute"}
          editMode={editMode}
          text={props.exam.institute}
          hideTitle={false}
          onChange={(e) => setInstitute(e.target.value)}
        />

        <EditField
          title={"Mode"}
          editMode={editMode}
          text={props.exam.mode}
          hideTitle={false}
          onChange={(e) => setMode(e.target.value)}
        />

        <EditField
          title={"Status"}
          editMode={editMode}
          text={props.exam.status}
          hideTitle={false}
          onChange={(e) => setStatus(e.target.value)}
        />

        <button
          onClick={() => {
            setEditMode(!editMode);
            if (editMode) handleUpdate();
          }}
          className="border-2 border-black p-1 hover:bg-slate-400 hover:underline"
        >
          {editMode ? "Stop Editing" : "Click to Edit"}
        </button>
      </div>
    );
  }

  return <div>Something went wrong</div>;
}
