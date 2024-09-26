import { useState } from "react";
import EditField from "../components/EditField";
import { showToast } from '../components/ToastMessage'; 
import DateField from "../components/DateField";
import Exam from "../../classes/Exam";
import moment from "moment";


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
  const [tutor_id, setTutorId] = useState<number>(props.exam.tutor_id);
  const [student_id, setStudentId] = useState<number>(props.exam.student_id);
  const [examiner_id, setExaminerId] = useState<number>(props.exam.examiner_id);
  const [major, setMajor] = useState<string>(props.exam.major);
  const [institute, setInstitute] = useState<string>(props.exam.institute);
  const [mode, setMode] = useState<string>(props.exam.mode);
  const [status, setStatus] = useState<string>(props.exam.status);

  let editText = "Click to Edit";

  if (editMode) {
    editText = "Stop Editing";
  }

  let tutorName = props.exam.tutor.join(", ")
  let examinerName = props.exam.examiner.join(", ")

  // Function to handle Tutor data update
  const handleUpdate = async () => {
    const data: Partial<Exam> = {
      title,
      date,
      duration,
      student_id,
      tutor_id,
      examiner_id,
      major,
      institute,
      mode,
      lva_num,
      status,
    };

    try {
      // Fetch API to send a PUT request to update the Exam data
      const response = await fetch(
        `http://localhost:1337/api/exams/${props.exam.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `5bad2121f82b63a7e0ba19074b66b646228a9903a550bdca6ae721ba2996be07c4afa42d15dbc1b3ac3b43cf8fc33408c9f730e3aa76533b8fe19e01acd140df0407a55d58f842dc4adc72f940c8517b6f5431ca7b5e0496eb70321c56e378ce61c99b0b52e8367aeaa7cda748961e9edee3dcb9cccd1d905260de298e8eb012`,
          },
          body: JSON.stringify({ data }), // Send data in the request body
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: 'error' });
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}`);
      }

      const result = await response.json();
      showToast({ message: `${result.data.attributes.title} exam record has been updated successfully.`, type: 'success' });
    } catch (error) {
      showToast({ message: `Error updating the exam record: ${(error as Error).message}.`, type: 'error' });

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

        <EditField
          title={"Tutor"}
          editMode={false}
          text={tutorName}
          hideTitle={false}
          onChange={(e) => setTutorId(Number(e.target.value))}
        />

        <EditField
          title={"Student"}
          editMode={false}
          text={props.exam.student}
          hideTitle={false}
          onChange={(e) => setStudentId(Number(e.target.value))}
        />

        <EditField
          title={"Examiner"}
          editMode={false}
          text={examinerName}
          hideTitle={false}
          onChange={(e) => setExaminerId(Number(e.target.value))}
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
          {editText}
        </button>
      </div>
    );
  }
  return <div>Something went wrong</div>;
}
