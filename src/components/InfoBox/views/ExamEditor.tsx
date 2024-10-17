import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
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

export default function ExamEditor() {
  const { id } = useParams(); // Get exam ID from URL params
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [exam, setExam] = useState<Exam | null>(null); // Store exam data

  const [title, setTitle] = useState<string>("");
  const [lva_num, setLvaNum] = useState<number | undefined>();
  const [date, setDate] = useState<string>("");
  const [duration, setDuration] = useState<number | undefined>();
  const [tutor, setTutor] = useState<number | undefined>();
  const [student, setStudent] = useState<number | undefined>();
  const [examiner, setExaminer] = useState<number | undefined>();
  const [major, setMajor] = useState<number | undefined>();
  const [institute, setInstitute] = useState<number | undefined>();
  const [mode, setMode] = useState<number | undefined>();
  const [room, setRoom] = useState<number | undefined>();
  const [status, setStatus] = useState<string>("");

  const [options, setOptions] = useState({
    students: [] as Student[],
    tutors: [] as Tutor[],
    examiners: [] as Examiner[],
    majors: [] as Major[],
    institutes: [] as Institute[],
    modes: [] as ExamMode[],
    rooms: [] as Room[],
  });

  // Fetch exam data based on ID from URL
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const examResponse = await fetch(`http://localhost:1337/api/exams/${id}`);
        const examData = await examResponse.json();

        if (examData) {
          setExam(examData);
          setTitle(examData.title);
          setLvaNum(examData.lva_num);
          setDate(examData.date);
          setDuration(examData.duration);
          setTutor(examData.tutor_id);
          setStudent(examData.student_id);
          setExaminer(examData.examiner_id);
          setMajor(examData.major_id);
          setInstitute(examData.institute_id);
          setMode(examData.mode_id);
          setRoom(examData.room_id);
          setStatus(examData.status);
        } else {
          showToast({ message: "No exam data found", type: "error" });
        }
      } catch (error) {
        showToast({ message: "Error fetching exam data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    const fetchDropdownOptions = async () => {
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
        showToast({ message: "Error fetching dropdown options", type: "error" });
      }
    };

    fetchExam();
    fetchDropdownOptions();
  }, [id]);

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
      const response = await fetch(`http://localhost:1337/api/exams/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast({
          message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`,
          type: "error",
        });
        return;
      }

      showToast({ message: "Exam updated successfully", type: "success" });
      navigate("/admin/exams"); // Navigate back to exams after successful update
    } catch (error) {
      showToast({ message: "Error updating exam", type: "error" });
    }
  };

  if (loading || !exam) {
    return <p>Loading exam data...</p>;
  }

  const dropdownOptions = (list: any[], firstNameField: string, lastNameField?: string) =>
    list.map((item: any) => ({
      value: item.id,
      label: lastNameField
        ? `${item[firstNameField]} ${item[lastNameField]}` // Concatenate first and last name
        : item[firstNameField], // For fields with just one field (like 'name' for institutes or majors)
    }));
  
  console.log(student);

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
        value={student ?? ""}
        onChange={(newValue) => setStudent(Number(newValue))}
        placeholder="Search student..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Tutor"}
        options={dropdownOptions(options.tutors, "first_name", "last_name")}
        value={tutor ?? ""}
        onChange={(newValue) => setTutor(Number(newValue))}
        placeholder="Search tutors..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Examiner"}
        options={dropdownOptions(options.examiners, "first_name", "last_name")}
        value={examiner ?? ""}
        onChange={(newVal) => setExaminer(Number(newVal))}
        placeholder="Search examiner..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Major"}
        options={dropdownOptions(options.majors, "name")}
        value={major ?? ""}
        onChange={(newVal) => setMajor(Number(newVal))}
        placeholder="Search majors..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Institute"}
        options={dropdownOptions(options.institutes, "name")}
        value={institute ?? ""}
        onChange={(newVal) => setInstitute(Number(newVal))}
        placeholder="Search institutes..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Mode"}
        options={dropdownOptions(options.modes, "name")}
        value={mode ?? ""}
        onChange={(newVal) => setMode(Number(newVal))}
        placeholder="Search modes..."
        disabled={!editMode}
      />

      <DropdownWithSearch
        label={"Room"}
        options={dropdownOptions(options.rooms, "name")}
        value={room ?? ""}
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
        className="border-2 border-black p-1 hover:bg-slate-400 hover:underline" >
        {editMode ? "Save" : "Edit"}
      </button>
      <button onClick={() => navigate("/admin/exams")} className="ml-2 border-2 border-black p-1 hover:bg-red-400 hover:underline">Cancel</button>
    </div>
  );
}
