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
import Notification from "../../classes/Notification";
import ComparisonField from "../components/ComparisonField";
import EntryBase from "../../classes/EntryBase";

export default function IndividualNotification() {
  const { id } = useParams(); // Get exam ID from URL params

  const { t } = useTranslation();

  const [proposedExam, setProposedExam] = useState<Exam>(new Exam());

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

  const user = useAuth();

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
    const fetchNotification = async () => {
      try {
        const response = await fetch(`http://localhost:1337/api/notifications/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = (await response.json()).data;

        let t = new Notification(data.attributes.information, data.attributes.seenBy, data.attributes.examName);

        let propEx: Exam = JSON.parse(t.information);

        setProposedExam(propEx);
        let x = JSON.parse(t.information);

        const examResponse = await fetch(`http://localhost:1337/api/exams/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const examData = await examResponse.json();

        if (examData) {
          let ex = new Exam();

          examData.forEach((element: Exam) => {
            if (element.title == t.examName) {
              ex = element;
            }
          });
          if (ex) {
            setExam(ex);
            setTitle(ex.title);
            setLvaNum(ex.lva_num);
            setDate(ex.date);
            setDuration(ex.duration);
            setTutor(ex.tutor_id);
            setStudent(ex.student_id);
            setExaminer(ex.examiner_id);
            setMajor(ex.major_id);
            setInstitute(ex.institute_id);
            setMode(ex.mode_id);
            setRoom(ex.room_id);
            setStatus(ex.status);
          }
        } else {
          showToast({ message: "No exam data found", type: "error" });
        }
      } catch (error) {
        showToast({ message: "Error fetching Notification", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    const fetchExam = async () => {
      try {
        const examResponse = await fetch(`http://localhost:1337/api/exams/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
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
          fetch("http://localhost:1337/api/students", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }).then((res) => res.json()),
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

    fetchNotification();

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

      if (!compareField("student", student)) t = t + ' "student_id" : "' + student + '",';
      if (!compareField("tutor", tutor)) t = t + ' "tutor_id" : "' + tutor + '",';
      if (!compareField("room", room)) t = t + ' "room_id" : "' + room + '",';
      if (!compareField("examiner", examiner)) t = t + ' "examiner_id" : "' + examiner + '",';
      if (!compareField("major", major)) t = t + ' "major_id" : "' + major + '",';
      if (!compareField("institute", institute)) t = t + ' "institute_id" : "' + institute + '",';
      if (!compareField("exam_mode", mode)) t = t + ' "exam_mode" : "' + mode + '",';
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
      const response = await fetch(`http://localhost:1337/api/exams/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      let change = examChanged();
      if (change != "") {
        const notify = await fetch(`http://localhost:1337/api/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: new Notification(change, user.user, exam?.title) }),
        });

        if (!notify.ok) {
          const errorData = await response.json();
          showToast({
            message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`,
            type: "error",
          });
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        showToast({
          message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`,
          type: "error",
        });
        return;
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

  console.log(options.students);

  const match = (arr: any[], val: any): string => {
    let t;

    arr.forEach((entr) => {
      if (entr.id == val) {
        t = entr;
      }
    });

    if (t == undefined || t == null) return "";

    if (t["name"] != undefined) return t["name"];
    if (t["first_name"] && t["last_name"]) return t["first_name"] + " " + t["last_name"];

    return "";
  };

  return (
    <div className="m-5">
      <div className="text-4xl font-bold">{t("Proposed Changes")}</div>

      <ComparisonField
        label={"LVA Num"}
        options={[]}
        value={lva_num ? lva_num.toString() : ""}
        proposedVal={proposedExam.lva_num ? proposedExam.lva_num.toString() : ""}
      />

      <ComparisonField
        label={"Date"}
        options={[]}
        value={moment(date).utc().format("YYYY-MM-DD")}
        proposedVal={proposedExam.date ? moment(proposedExam.date).utc().format("YYYY-MM-DD") : ""}
      />

      <ComparisonField label={"Duration"} options={[]} value={duration ?? ""} proposedVal={proposedExam.duration ? proposedExam.duration.toString() : ""} />

      <ComparisonField
        label={"Student"}
        options={dropdownOptions(options.students, "first_name", "last_name")}
        value={student ?? ""}
        proposedVal={match(options.students, proposedExam.student_id)}
      />

      <ComparisonField
        label={"Tutor"}
        options={dropdownOptions(options.tutors, "first_name", "last_name")}
        value={tutor ?? ""}
        proposedVal={match(options.tutors, proposedExam.tutor)}
      />

      <ComparisonField
        label={t("Examiner")}
        options={dropdownOptions(options.examiners, "first_name", "last_name")}
        value={examiner ?? ""}
        proposedVal={match(options.examiners, proposedExam.examiner_id)}
      />

      <ComparisonField
        label={t("Major")}
        options={dropdownOptions(options.majors, "name")}
        value={major ?? ""}
        proposedVal={match(options.majors, proposedExam.major_id)}
      />

      <ComparisonField
        label={t("Institute")}
        options={dropdownOptions(options.institutes, "name")}
        value={institute ?? ""}
        proposedVal={match(options.institutes, proposedExam.institute_id)}
      />

      <ComparisonField
        label={t("Mode")}
        options={dropdownOptions(options.modes, "name")}
        value={mode ?? ""}
        proposedVal={match(options.modes, proposedExam.mode_id)}
      />

      <ComparisonField
        label={t("Room")}
        options={dropdownOptions(options.rooms, "name")}
        value={room ?? ""}
        proposedVal={match(options.rooms, proposedExam.room_id)}
      />

      <EditField title={"Status"} editMode={editMode} text={status} hideTitle={false} onChange={(e) => setStatus(e.target.value)} />

      <button
        onClick={() => {
          setEditMode(!editMode);
          if (editMode) handleUpdate();
        }}
        className="border-2 border-black p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Accept Changes")}
      </button>
      <button
        onClick={() => {
          setEditMode(!editMode);
          if (editMode) handleUpdate();
        }}
        className="border-2 border-black p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Discard")}
      </button>
    </div>
  );
}
