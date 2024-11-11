import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EditField from "../components/EditField";
import DateField from "../components/DateField";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import DropdownWithSearch from "../components/DropdownWithSearch";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import Examiner from "../../classes/Examiner";
import ExamMode from "../../classes/ExamMode";
import Institute from "../../classes/Institute";
import Room from "../../classes/Room";
import Exam from "../../classes/Exam";

export default function RequestExam() {
  const { id } = useParams(); // Get exam ID from URL params

  const { t } = useTranslation();
  const user = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [exam, setExam] = useState<Exam | null>(null);

  const [title, setTitle] = useState<string>("");
  const [student, setStudent] = useState<number>(user.userId);
  const [lva_num, setLvaNum] = useState<number | undefined>();
  const [date, setDate] = useState<string>("");
  const [duration, setDuration] = useState<number | undefined>();
  const [examiner, setExaminer] = useState<number | undefined>();
  const [institute, setInstitute] = useState<number | undefined>();
  const [mode, setMode] = useState<number | undefined>();
  const [room, setRoom] = useState<number | undefined>();
  const [status, setStatus] = useState<string>("Pending");

  const [options, setOptions] = useState({
    examiners: [] as Examiner[],
    institutes: [] as Institute[],
    modes: [] as ExamMode[],
    rooms: [] as Room[],
  });

  const studentId = user.userId;

  useEffect(() => {
    const fetchStudentExam = async () => {
      try {
        const examResponse = await fetch(`http://localhost:1337/api/exams/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const allExams = await examResponse.json();
        let examData: Exam | undefined;

        allExams.forEach((exam: any) => {
          if (exam.id == id) {
            examData = exam as Exam;
          }
        });

        if (!examResponse.ok) {
          showToast({ message: `HTTP error! Status: ${examResponse.status}, Message: ${allExams.error.message || "Unknown error"}.`, type: "error" });
        }
        if (examData) {
          setExam(examData);
          setTitle(examData.title);
          setLvaNum(examData.lva_num);
          setDate(examData.date);
          setDuration(examData.duration);
          typeof examData.examiner == "number" ? setExaminer(examData.examiner_id) : setExaminer(examData.examiner.id);
          typeof examData.institute == "number" ? setInstitute(examData.institute) : setInstitute(examData.institute.id);
          typeof examData.exam_mode == "number" ? setMode(examData.mode_id) : setMode(examData.exam_mode.id);
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
        const [examinersRes, institutesRes, modesRes, roomsRes] = await Promise.all([
          fetch("http://localhost:1337/api/examiners", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch("http://localhost:1337/api/institutes", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch("http://localhost:1337/api/exam-modes", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch("http://localhost:1337/api/rooms", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
        ]);

        setOptions({
          examiners: examinersRes ?? [],
          institutes: institutesRes ?? [],
          modes: modesRes ?? [],
          rooms: roomsRes ?? [],
        });
      } catch (error) {
        showToast({ message: "Error fetching dropdown options", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentExam();
    fetchDropdownOptions();
  }, [user.token, id]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    const currentTime = moment.utc(date).format("HH:mm:ss");
    const updatedDate = moment(`${selectedDate} ${currentTime}`, "YYYY-MM-DD HH:mm:ss").utc().toISOString();
    setDate(updatedDate);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = event.target.value;
    const currentDate = moment.utc(date).format("YYYY-MM-DD");
    const updatedDate = moment(`${currentDate}T${selectedTime}`, "YYYY-MM-DDTHH:mm:ss").utc().toISOString();
    setDate(updatedDate);
  };

  const handleSubmit = async () => {
    const data: Partial<Exam> = {
      title,
      date,
      student_id: student,
      duration,
      student,
      examiner,
      institute,
      exam_mode: mode,
      room,
      lva_num,
      status,
    };

    try {
      const response = await fetch(`http://localhost:1337/api/exams`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
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

      showToast({ message: "Exam created successfully", type: "success" });
    } catch (error) {
      showToast({ message: "Error creating exam", type: "error" });
    }
  };

  const dropdownOptions = (list: any[] = [], firstNameField: string, lastNameField?: string) =>
    list.map((item: any) => ({
      value: item.id,
      label: lastNameField ? `${item[firstNameField]} ${item[lastNameField]}` : item[firstNameField],
    }));

  if (loading) return <p>Loading exam data...</p>;

  return (
    <div className="m-5">
      <EditField title={t("Exam Title")} editMode={editMode} text={title} onChange={(e) => setTitle(e.target.value)} />
      <EditField title={t("LVA Num")} editMode={editMode} text={lva_num?.toString() ?? ""} onChange={(e) => setLvaNum(Number(e.target.value))} />
      <DateField title={t("Date/Time")} editMode={editMode} dateValue={date} onDateChange={handleDateChange} onTimeChange={handleTimeChange} />
      <EditField title={t("Duration")} editMode={editMode} text={duration?.toString() ?? ""} onChange={(e) => setDuration(Number(e.target.value))} />

      <DropdownWithSearch
        tableName="examiners"
        label={t("Examiner")}
        options={dropdownOptions(options.examiners, "first_name", "last_name")}
        value={examiner ?? ""}
        onChange={(val) => setExaminer(Number(val))}
        placeholder={t("Search examiner...")}
        disabled={!editMode}
      />
      <DropdownWithSearch
        tableName="institutes"
        label={t("Institute")}
        options={dropdownOptions(options.institutes, "name")}
        value={institute ?? ""}
        onChange={(val) => setInstitute(Number(val))}
        placeholder={t("Search institutes...")}
        disabled={!editMode}
      />
      <DropdownWithSearch
        tableName="exam-modes"
        label={t("Mode")}
        options={dropdownOptions(options.modes, "name")}
        value={mode ?? ""}
        onChange={(val) => setMode(Number(val))}
        placeholder={t("Search modes...")}
        disabled={!editMode}
      />

      <EditField title={t("Status")} editMode={editMode} text={status} hideTitle={false} onChange={(e) => setStatus("Pending")} />

      <button onClick={handleSubmit} className="border-2 border-black p-1 hover:bg-slate-400 hover:underline">
        {t("Save")}
      </button>
      <button onClick={() => navigate(`/student/all-exams`)} className="ml-2 border-2 border-black p-1 hover:bg-red-400 hover:underline">
        {" "}
        {t("Cancel")}{" "}
      </button>
    </div>
  );
}
