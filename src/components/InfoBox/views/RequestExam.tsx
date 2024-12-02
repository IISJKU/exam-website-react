import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import Notification, { NotificationType } from "../../classes/Notification";
import { stat } from "fs";

// Define initial state type to include all properties
interface InitialState {
  exam: Exam | null;
  title: string;
  lva_num?: number;
  student: number;
  date: string;
  duration?: number;
  examiner?: number | string;
  institute?: number | string;
  mode?: number;
  room?: number;
  status: string;
}

export default function RequestExam() {
  const { t } = useTranslation();
  const user = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [exam, setExam] = useState<Exam | null>(null); // Store exam data

  const [title, setTitle] = useState<string>("");
  const [student, setStudent] = useState<number>(user.userId);
  const [lva_num, setLvaNum] = useState<number | undefined>();
  const [date, setDate] = useState<string>("");
  const [duration, setDuration] = useState<number | undefined>();
  const [examiner, setExaminer] = useState<number | string | undefined>();
  const [institute, setInstitute] = useState<number | string | undefined>();
  const [mode, setMode] = useState<number | undefined>();
  const [room, setRoom] = useState<number | undefined>();
  const [status, setStatus] = useState<string>("Pending");

  const [error, setErrorText] = useState<string>();

  // Define initial state with the correct type
  const [initialState, setInitialState] = useState<InitialState>({
    exam: null,
    title: "",
    lva_num: undefined,
    student: student,
    date: "",
    duration: undefined,
    examiner: undefined,
    institute: undefined,
    mode: undefined,
    room: undefined,
    status: "Pending",
  });

  const [options, setOptions] = useState({
    examiners: [] as Examiner[],
    institutes: [] as Institute[],
    modes: [] as ExamMode[],
    rooms: [] as Room[],
  });

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [examinersRes, studentRes, institutesRes, modesRes, roomsRes] = await Promise.all([
          fetch("http://localhost:1337/api/examiners", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch("http://localhost:1337/api/students/me", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch("http://localhost:1337/api/institutes", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch("http://localhost:1337/api/exam-modes", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch("http://localhost:1337/api/rooms", { headers: { Authorization: `Bearer ${user.token}` } })
            .then((res) => res.json())
            .then((rooms) => rooms.filter((room: Room) => room.isAvailable === true)),
        ]);

        setOptions({
          examiners: examinersRes ?? [],
          institutes: institutesRes ?? [],
          modes: modesRes ?? [],
          rooms: roomsRes ?? [],
        });

        setStudent(studentRes[0].id);

        setInitialState({
          exam,
          title,
          lva_num,
          student: student,
          date,
          duration,
          examiner,
          institute,
          mode,
          room,
          status,
        });
      } catch (error) {
        showToast({ message: "Error fetching dropdown options", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownOptions();
  }, [user.token]);

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

  function addedExam() {
    let t = "";

    t = t + ' "title" : "' + title + '",';
    t = t + ' "lva_num" : "' + lva_num + '",';
    t = t + ' "date" : "' + date + '",';
    t = t + ' "duration" : "' + duration + '",';
    t = t + ' "status" : "' + status + '",';

    t = t + ' "student_id" : "' + student + '",';
    t = t + ' "room_id" : "' + room + '",';
    t = t + ' "examiner_id" : "' + examiner + '",';
    t = t + ' "institute_id" : "' + institute + '",';
    t = t + ' "exam_mode" : "' + mode + '",';

    if (t != "") {
      t = t.substring(0, t.length - 1);
      t = "{" + t + "}";
    }

    return t;
  }

  const handleSubmit = async () => {
    const data: Partial<Exam> = {
      title: title,
      date: date,
      student_id: student,
      duration: duration,
      examiner_id: 0,
      examiner: undefined,
      institute_id: 0,
      exam_mode: mode,
      room_id: room,
      lva_num,
      status,
    };

    if (typeof examiner == "number") {
      data.examiner_id = examiner;
    } else {
      if (examiner) {
        let nuExaminer = new Examiner();
        let firstName = examiner?.substring(0, examiner.indexOf(" ")).trim();
        let lastName = examiner?.substring(examiner.indexOf(" "), examiner.length).trim();

        nuExaminer.first_name = firstName;
        nuExaminer.last_name = lastName;
        data.examiner = nuExaminer;
      }
    }

    if (typeof institute == "number") {
      data.institute_id = institute;
    }

    setExam(data as Exam);

    try {
      let addedEx = addedExam();

      let notif = new Notification(JSON.stringify(data), "", user.user);
      notif.type = NotificationType.createExam;

      console.log(data);
      if (addedEx != "") {
        const notify = await fetch(`http://localhost:1337/api/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ data: notif }),
        });

        if (!notify.ok) {
          const errorData = await notify.json();
          showToast({
            message: `HTTP error! Status: ${notify.status}, Message: ${errorData.error.message || "Unknown error"}.`,
            type: "error",
          });
          return;
        }

        showToast({ message: "Exam notification created successfully", type: "success" });
      }

      navigate("/student/all-exams");
    } catch (error) {
      showToast({ message: "Error creating exam notification", type: "error" });
    }
  };

  const [submit, setSubmit] = useState<boolean>(false);

  const handleCancel = () => {
    setExam(initialState.exam);
    setTitle(initialState.title);
    setLvaNum(initialState.lva_num);
    setDate(initialState.date);
    setStudent(initialState.student);
    setDuration(initialState.duration);
    setExaminer(initialState.examiner);
    setInstitute(initialState.institute);
    setMode(initialState.mode);
    setRoom(initialState.room);
    setStatus(initialState.status);

    navigate("/student/all-exams");
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
        onChange={(val) => {
          setExaminer(Number(val));
        }}
        placeholder={t("Search examiner...")}
        disabled={!editMode}
        submit={submit}
      />
      <DropdownWithSearch
        tableName="institutes"
        label={t("Institute")}
        options={dropdownOptions(options.institutes, "name")}
        value={institute ?? ""}
        onChange={(val) => setInstitute(Number(val))}
        placeholder={t("Search institutes...")}
        disabled={!editMode}
        submit={submit}
      />
      <DropdownWithSearch
        tableName="exam-modes"
        label={t("Mode")}
        options={dropdownOptions(options.modes, "name")}
        value={mode ?? ""}
        onChange={(val) => setMode(Number(val))}
        placeholder={t("Search modes...")}
        disabled={!editMode}
        submit={submit}
      />

      <EditField title={t("Status")} editMode={editMode} text={status} hideTitle={false} onChange={(e) => setStatus("Pending")} />

      <button onClick={handleSubmit} className="border-2 border-black p-1 hover:bg-slate-400 hover:underline">
        {t("Submit")}
      </button>
      <button onClick={handleCancel} className="ml-2 border-2 border-black p-1 hover:bg-red-400 hover:underline">
        {t("Cancel")}
      </button>
      {error ? <div className="text-red-800 text-xl">Please fill in all of the fields!</div> : <></>}
    </div>
  );
}
