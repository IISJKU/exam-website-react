import { useState, useEffect, useTransition } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import EditField from "../components/EditField";
import DateField from "../components/DateField";
import Exam from "../../classes/Exam";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import DropdownWithSearch from "../components/DropdownWithSearch";
import Student from "../../classes/Student";
import Tutor from "../../classes/Tutor";
import Examiner from "../../classes/Examiner";
import Major from "../../classes/Major";
import ExamMode from "../../classes/ExamMode";
import Institute from "../../classes/Institute";
import Room from "../../classes/Room";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";
import Admin from "../../../Pages/Admin";

export default function ExamEditor() {
  const { id } = useParams(); // Get exam ID from URL params
  const navigate = useNavigate();

  const { t } = useTranslation();
  const user = useAuth();
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

  const [originalExam, setOriginalExam] = useState<Exam>(new Exam());

  const [options, setOptions] = useState({
    students: [] as Student[],
    tutors: [] as Tutor[],
    examiners: [] as Examiner[],
    majors: [] as Major[],
    institutes: [] as Institute[],
    modes: [] as ExamMode[],
    rooms: [] as Room[],
  });
  const studentId = user.userId;

  const formatExamData = (exam: Exam): Exam => {
    typeof exam.examiner == "number" ? (exam.examiner_id = exam.examiner) : (exam.examiner_id = exam.examiner.id);
    typeof exam.institute == "number" ? (exam.institute_id = exam.institute) : (exam.institute_id = exam.institute.id);
    typeof exam.student == "number" ? (exam.student_id = exam.student) : (exam.student_id = exam.student.id);
    typeof exam.exam_mode == "number" ? (exam.mode_id = exam.exam_mode) : (exam.mode_id = exam.exam_mode.id);

    return exam;
  };

  // Fetch exam data based on ID from URL
  useEffect(() => {
    const fetchExam = async () => {
      try {
        let path = ``;
        if (user.role == "Admin") {
          path = `http://localhost:1337/api/exams/${id}`;
        } else if (user.role == "Student") {
          path = `http://localhost:1337/api/exams/me`;
        } else {
        }
        const examResponse = await fetch(path, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const rawData = await examResponse.json();

        if (!examResponse.ok) {
          showToast({ message: `HTTP error! Status: ${examResponse.status}, Message: ${rawData.error.message || "Unknown error"}.`, type: "error" });
        }

        let examData: Exam | undefined;
        if (user.role == "Student") {
          rawData.forEach((exam: any) => {
            if (exam.id == id) {
              examData = exam as Exam;
            }
          });
        } else {
          examData = rawData;
        }

        if (examData) {
          if (user.role == "Student") examData = formatExamData(examData);

          setExam(examData);
          setOriginalExam(examData);
          setTitle(examData.title);
          setLvaNum(examData.lva_num);
          setDate(examData.date);
          setDuration(examData.duration);
          setRoom(examData.room_id);
          setStatus(examData.status);

          setTutor(examData.tutor_id);
          setStudent(examData.student_id);
          setExaminer(examData.examiner_id);
          setMajor(examData.major_id);
          setInstitute(examData.institute_id);
          setMode(examData.mode_id);
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
          fetch("http://localhost:1337/api/students", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }).then((res) => res.json()),
          user.role == "Admin" &&
            fetch("http://localhost:1337/api/tutors", {
              method: "GET",
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }).then((res) => res.json()),
          fetch("http://localhost:1337/api/examiners", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }).then((res) => res.json()),
          fetch("http://localhost:1337/api/majors", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }).then((res) => res.json()),
          fetch("http://localhost:1337/api/institutes", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }).then((res) => res.json()),
          fetch("http://localhost:1337/api/exam-modes", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }).then((res) => res.json()),
          fetch("http://localhost:1337/api/rooms", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }).then((res) => res.json()),
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

    // Use the proper format for combining the date and time
    const updatedDate = moment(`${selectedDate}T${currentTime}`, "YYYY-MM-DDTHH:mm:ss").utc().toISOString();
    setDate(updatedDate);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = event.target.value;
    const currentDate = moment.utc(date).format("YYYY-MM-DD"); // Preserve date, use UTC

    // Use the proper format for combining the date and time
    const updatedDate = moment(`${currentDate}T${selectedTime}`, "YYYY-MM-DDTHH:mm").utc().toISOString();
    setDate(updatedDate);
  };

  //if any field was changed, this should return false
  function compareField(field: string, value: number | undefined) {
    const key = field as keyof Exam;

    if (exam != null && exam[key] != undefined) {
      if (typeof exam[key] === "number") {
        if (exam[key] != value) return false;
        // @ts-ignore
      } else if (exam[key].id != value) return false;
    } else return false;

    return true;
  }

  function examChanged() {
    let t = "";

    if (exam != null) {
      if (title != exam.title) t = t + ' "title" : "' + title + '",';
      if (lva_num != exam.lva_num) t = t + ' "lva_num" : "' + lva_num + '",';
      if (date != exam.date) t = t + ' "date" : "' + date + '",';
      if (duration != exam.duration) t = t + ' "duration" : "' + duration + '",';
      if (status != exam.status) t = t + ' "status" : "' + status + '",';
      if (user.role == "Admin") {
        if (!compareField("student", student)) t = t + ' "student_id" : "' + student + '",';
        if (!compareField("tutor", tutor)) t = t + ' "tutor_id" : "' + tutor + '",';
        if (!compareField("room", room)) t = t + ' "room_id" : "' + room + '",';
        if (!compareField("examiner", examiner)) t = t + ' "examiner_id" : "' + examiner + '",';
        if (!compareField("major", major)) t = t + ' "major_id" : "' + major + '",';
        if (!compareField("institute", institute)) t = t + ' "institute_id" : "' + institute + '",';
        if (!compareField("exam_mode", mode)) t = t + ' "exam_mode" : "' + mode + '",';
      } else {
        if (student != exam.student_id) t = t + ' "student_id" : "' + student + '",';
        if (tutor != exam.tutor_id) t = t + ' "tutor_id" : "' + tutor + '",';
        if (room != exam.room_id) t = t + ' "room_id" : "' + room + '",';
        if (examiner != exam.examiner_id) t = t + ' "examiner_id" : "' + examiner + '",';
        if (major != exam.major_id) t = t + ' "major_id" : "' + major + '",';
        if (institute != exam.institute_id) t = t + ' "institute_id" : "' + institute + '",';
        if (mode != exam.mode_id) t = t + ' "exam_mode" : "' + mode + '",';
      }
    }

    if (t != "") {
      t = t.substring(0, t.length - 1);
      t = "{" + t + "}";
    }
    return t;
  }

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
      if (user.role == "Admin") {
        const response = await fetch(`http://localhost:1337/api/exams/${id}`, {
          method: "PUT",
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
      }

      let change = examChanged();

      if (change != "" && exam) {
        let notif = new Notification(change, JSON.stringify(originalExam), user.user, exam.id);
        if (user.role == "Admin") notif.type = NotificationType.adminChange;
        else notif.type = NotificationType.proposeChange;

        const notify = await fetch(`http://localhost:1337/api/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
      }

      showToast({ message: "Exam updated successfully", type: "success" });
      //navigate("/admin/exams");
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

  //customise site layout depending on role of user
  if (user.role == "Admin")
    return (
      <div className="m-5">
        <EditField title={t("Exam Title")} editMode={editMode} text={title} hideTitle={false} onChange={(e) => setTitle(e.target.value)} />

        <EditField
          title={t("LVA Num")}
          editMode={editMode}
          text={lva_num ? lva_num.toString() : ""}
          hideTitle={false}
          onChange={(e) => setLvaNum(Number(e.target.value))}
        />

        <DateField editMode={editMode} dateValue={date} onDateChange={handleDateChange} onTimeChange={handleTimeChange} />

        <EditField
          title={t("Duration")}
          editMode={editMode}
          text={duration ? duration.toString() : ""}
          hideTitle={false}
          onChange={(e) => setDuration(Number(e.target.value))}
        />

        <DropdownWithSearch
          tableName="students"
          label={"Student"}
          options={dropdownOptions(options.students, "first_name", "last_name")}
          value={student ?? ""}
          onChange={(newValue) => setStudent(Number(newValue))}
          placeholder={t("Search student...")}
          disabled={!editMode}
        />

        <DropdownWithSearch
          tableName="tutors"
          label={"Tutor"}
          options={dropdownOptions(options.tutors, "first_name", "last_name")}
          value={tutor ?? ""}
          onChange={(newValue) => setTutor(Number(newValue))}
          placeholder={t("Search tutors...")}
          disabled={!editMode}
        />

        <DropdownWithSearch
          tableName="examiners"
          label={t("Examiner")}
          options={dropdownOptions(options.examiners, "first_name", "last_name")}
          value={examiner ?? ""}
          onChange={(newVal) => setExaminer(Number(newVal))}
          placeholder={t("Search examiner...")}
          disabled={!editMode}
        />

        <DropdownWithSearch
          tableName="majors"
          label={t("Major")}
          options={dropdownOptions(options.majors, "name")}
          value={major ?? ""}
          onChange={(newVal) => setMajor(Number(newVal))}
          placeholder={t("Search majors...")}
          disabled={!editMode}
        />

        <DropdownWithSearch
          tableName="institutes"
          label={t("Institute")}
          options={dropdownOptions(options.institutes, "name")}
          value={institute ?? ""}
          onChange={(newVal) => setInstitute(Number(newVal))}
          placeholder={t("Search institutes...")}
          disabled={!editMode}
        />

        <DropdownWithSearch
          tableName="exam-modes"
          label={t("Mode")}
          options={dropdownOptions(options.modes, "name")}
          value={mode ?? ""}
          onChange={(newVal) => setMode(Number(newVal))}
          placeholder={t("Search modes...")}
          disabled={!editMode}
        />

        <DropdownWithSearch
          tableName="rooms"
          label={t("Room")}
          options={dropdownOptions(options.rooms, "name")}
          value={room ?? ""}
          onChange={(newVal) => setRoom(Number(newVal))}
          placeholder={t("Search rooms...")}
          disabled={!editMode}
        />

        <EditField title={"Status"} editMode={editMode} text={status} hideTitle={false} onChange={(e) => setStatus(e.target.value)} />

        <button
          onClick={() => {
            setEditMode(!editMode);
            if (editMode) handleUpdate();
          }}
          className="border-2 border-black p-1 hover:bg-slate-400 hover:underline"
        >
          {editMode ? t("Save") : t("Edit")}
        </button>
        {editMode ? (
          <button
            className="ml-2 border-2 border-black p-1 hover:bg-red-400 hover:underline"
            onClick={() => {
              setEditMode(!editMode);
            }}
          >
            Cancel
          </button>
        ) : (
          <></>
        )}
      </div>
    );
  else
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

        <button
          onClick={() => {
            setEditMode(!editMode);
            if (editMode) handleUpdate();
          }}
          className="border-2 border-black p-1 hover:bg-slate-400 hover:underline"
        >
          {editMode ? t("Save") : t("Edit")}
        </button>
        {editMode ? (
          <button
            className="ml-2 border-2 border-black p-1 hover:bg-red-400 hover:underline"
            onClick={() => {
              setEditMode(!editMode);
            }}
          >
            Cancel
          </button>
        ) : (
          <></>
        )}
      </div>
    );
}
