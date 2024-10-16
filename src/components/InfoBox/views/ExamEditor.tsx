import { useState, useEffect } from "react";
import EditField from "../components/EditField";
import DateField from "../components/DateField";
import Exam from "../../classes/Exam";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import DropdownWithSearch from "../components/DropdownSearch";
import Student from "../../classes/Student";
import Tutor from "../../classes/Tutor";
import Examiner from "../../classes/Examiner";
import Major from "../../classes/Major";
import ExamMode from "../../classes/ExamMode";
import Institute from "../../classes/Institute";
import Room from "../../classes/Room";

interface ExamEditorProps {
  exam: Exam;
}

export default function ExamEditor(props: ExamEditorProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(props.exam.title);
  const [lva_num, setLvaNum] = useState<number | undefined>(props.exam.lva_num);
  const [date, setDate] = useState<string>(props.exam.date || "");
  const [duration, setDuration] = useState<number | undefined>(props.exam.duration);
  const [tutor, setTutor] = useState<number>(props.exam.tutor_id);
  const [student, setStudent] = useState<number>(props.exam.student_id);
  const [examiner, setExaminer] = useState<number>(props.exam.examiner_id);
  const [major, setMajor] = useState<number>(props.exam.major_id);
  const [institute, setInstitute] = useState<number>(props.exam.institute_id);
  const [mode, setMode] = useState<number>(props.exam.mode_id);
  const [room, setRoom] = useState<number>(props.exam.room_id);
  const [status, setStatus] = useState<string>(props.exam.status);

  const [options, setOptions] = useState({
    students: [] as Student[],
    tutors: [] as Tutor[],
    examiners: [] as Examiner[],
    majors: [] as Major[],
    institutes: [] as Institute[],
    modes: [] as ExamMode[],
    rooms: [] as Room[],
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, tutorsRes, examinersRes, majorsRes, institutesRes, modesRes, roomsRes] = await Promise.all([
          fetch("http://localhost:1337/api/students").then((res) => res.json()),
          fetch("http://localhost:1337/api/tutors").then((res) => res.json()),
          fetch("http://localhost:1337/api/examiners").then((res) => res.json()),
          fetch("http://localhost:1337/api/majors").then((res) => res.json()),
          fetch("http://localhost:1337/api/institutes").then((res) => res.json()),
          fetch("http://localhost:1337/api/exam-modes").then((res) => res.json()),
          fetch("http://localhost:1337/api/rooms").then((res) => res.json()),
        ]);

        setOptions({
          students: studentsRes,
          tutors: tutorsRes,
          examiners: examinersRes,
          majors: majorsRes,
          institutes: institutesRes,
          modes: modesRes,
          rooms: roomsRes,
        });
      } catch (error) {
        showToast({ message: "Error fetching data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    const currentTime = moment.utc(date).format("HH:mm:ss"); // Preserve time, use UTC

    const updatedDate = moment(`${selectedDate} ${currentTime}`, "YYYY-MM-DD HH:mm:ss").utc().toISOString(); // Ensure toISOString in UTC
    setDate(updatedDate);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = event.target.value;
    const currentDate = moment.utc(date).format("YYYY-MM-DD"); // Preserve date, use UTC

    const updatedDate = moment(`${currentDate}T${selectedTime}`, "YYYY-MM-DDTHH:mm:ss").utc().toISOString(); // Convert to ISO in UTC
    setDate(updatedDate);
  };

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
      exam_mode: mode,
      room,
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
        message: `${result.title} exam record has been updated successfully.`,
        type: "success",
      });
    } catch (error) {
      showToast({ message: `Error updating the exam record: ${(error as Error).message}.`, type: "error" });
    }
  };

  const dropdownOptions = (list: any[], firstNameField: string, lastNameField?: string) =>
    list.map((item: any) => ({
      value: item.id,
      label: lastNameField
        ? `${item[firstNameField]} ${item[lastNameField]}` // Concatenate first and last name
        : item[firstNameField], // For fields with just one field (like 'name' for institutes or majors)
    }));

  if (loading) {
    return <p>Loading data...</p>;
  }

  return (
    <div className="m-5">
      <EditField
        title={"Exam Title"}
        editMode={editMode}
        text={title}
        hideTitle={false}
        onChange={(e) => setTitle(e.target.value)}
      />

      <EditField
        title={"LVA Num"}
        editMode={editMode}
        text={lva_num ? lva_num.toString() : ""}
        hideTitle={false}
        onChange={(e) => setLvaNum(Number(e.target.value))}
      />

      <DateField
        editMode={editMode}
        dateValue={date}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
      />

      <EditField
        title={"Duration"}
        editMode={editMode}
        text={duration ? duration.toString() : ""}
        hideTitle={false}
        onChange={(e) => setDuration(Number(e.target.value))}
      />

      <DropdownWithSearch
        label={"Student"}
        options={dropdownOptions(options.students, "first_name", "last_name")}
        value={student}
        onChange={(newValue) => setStudent(Number(newValue))}
        placeholder="Search student..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Tutor"}
        options={dropdownOptions(options.tutors, "first_name", "last_name")}
        value={tutor}
        onChange={(newValue) => setTutor(Number(newValue))}
        placeholder="Search tutors..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Examiner"}
        options={dropdownOptions(options.examiners, "first_name", "last_name")}
        value={examiner}
        onChange={(newVal) => setExaminer(Number(newVal))}
        placeholder="Search examiner..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Major"}
        options={dropdownOptions(options.majors, "name")}
        value={major}
        onChange={(newVal) => setMajor(Number(newVal))}
        placeholder="Search majors..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Institute"}
        options={dropdownOptions(options.institutes, "name")}
        value={institute}
        onChange={(newVal) => setInstitute(Number(newVal))}
        placeholder="Search institutes..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Mode"}
        options={dropdownOptions(options.modes, "name")}
        value={mode}
        onChange={(newVal) => setMode(Number(newVal))}
        placeholder="Search modes..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Room"}
        options={dropdownOptions(options.rooms, "name")}
        value={room}
        onChange={(newVal) => setRoom(Number(newVal))}
        placeholder="Search rooms..."
        disabled={!editMode}
      />

      <EditField
        title={"Status"}
        editMode={editMode}
        text={status}
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
