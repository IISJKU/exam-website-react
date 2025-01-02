import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import EditField from "../components/EditField";
import DateField from "../components/DateField";
import Exam, { ExamStatus } from "../../classes/Exam";
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
import DropdownWithSearchMultiple from "../components/DropdownWithSearchMultiple";
import { sendEmail } from "../../../services/EmailService";
import { generateRow, match } from "./IndividualNotification";
import StatusSelector from "../components/StatusSelector";

export default function ExamEditor() {
  const { id } = useParams(); // Get exam ID from URL params
  const navigate = useNavigate();

  const { t } = useTranslation();
  const user = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [exam, setExam] = useState<Exam | null>(null); // Store exam data
  const [allExams, setAllExams] = useState<Exam[]>([]);
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
  const [room, setRoom] = useState<number | null>();
  const [registeredTutors, setRegisteredTutors] = useState<Tutor[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [status, setStatus] = useState<ExamStatus>(ExamStatus.NoEmailExaminer);

  const [originalExam, setOriginalExam] = useState<Exam>(new Exam());
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null); // Track selected room ID for confirmation

  const [options, setOptions] = useState({
    students: [] as Student[],
    tutors: [] as Tutor[],
    examiners: [] as Examiner[],
    majors: [] as Major[],
    institutes: [] as Institute[],
    modes: [] as ExamMode[],
    rooms: [] as Room[],
  });

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
        if (user.role == "Admin" || user.role == "Tutor") {
          path = `http://localhost:1337/api/exams/${id}`;
        } else if (user.role == "Student") {
          path = `http://localhost:1337/api/exams/me`;
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
          setNotes(examData.notes);
          setTutor(examData.tutor_id);
          setRegisteredTutors(examData.registeredTutors);
          setStudent(examData.student_id);
          setExaminer(examData.examiner_id);
          setMajor(examData.major_id);
          setInstitute(examData.institute_id);
          setMode(examData.mode_id);
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
          })
            .then((res) => res.json())
            .then((rooms) => rooms.filter((room: Room) => room.isAvailable === true)), // Filter for available rooms
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

    // Fetch exams
    const fetchAllExams = async () => {
      const response = await fetch("http://localhost:1337/api/exams", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();
      setAllExams(data);
    };

    fetchExam();
    fetchDropdownOptions();
    if (user.role == "Admin") fetchAllExams();
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
      if (notes != exam.notes) t = t + ' "notes" : "' + notes + '",';
      if (user.role == "Admin") {
        if (!compareField("student", student)) t = t + ' "student_id" : "' + student + '",';
        if (!compareField("tutor", tutor)) t = t + ' "tutor_id" : "' + tutor + '",';
        if (room && !compareField("room", room)) t = t + ' "room_id" : "' + room + '",';
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
      notes,
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
        } else {
          // Prepare HTML email content
          const changesHtml = `
          <h3>Exam Changes</h3>
          <p>The following changes have been made to the exam:</p>
          <table border="1" style="border-collapse: collapse; width: 70%;">
            <thead>
              <tr>
                <th style="padding: 8px; text-align: left;">Field</th>
                <th style="padding: 8px; text-align: left;">Old</th>
                <th style="padding: 8px; text-align: left;">New</th>
              </tr>
            </thead>
            <tbody>
               ${generateRow("Title", exam?.title, title, true)}
               ${generateRow("LVA Number", exam?.lva_num, lva_num, true)}
               ${generateRow("Date", exam?.date ? moment(exam.date).format("DD.MM.YYYY HH:mm") : "N/A",
                 date ? moment(date).format("DD.MM.YYYY HH:mm") : moment(exam?.date).format("DD.MM.YYYY HH:mm"), true)}
              ${generateRow("Duration", exam?.duration, duration, true)}
              ${generateRow("Tutor", match(options.tutors, exam?.tutor_id), match(options.tutors, tutor), true)}
              ${generateRow("Student", match(options.students, exam?.student_id), match(options.students, student), true)}
              ${generateRow("Examiner", match(options.examiners, exam?.examiner_id), match(options.examiners, examiner), true)}
              ${generateRow("Major", match(options.majors, exam?.major_id), match(options.majors, major), true)}
              ${generateRow("Institute", match(options.institutes, exam?.institute_id), match(options.institutes, institute), true)}
              ${generateRow("Mode", match(options.modes, exam?.mode_id), match(options.modes, mode), true)}
              ${generateRow("Room", match(options.rooms, exam?.room_id), match(options.rooms, room), true)}
              ${generateRow("Notes", exam?.notes, notes, true)}
              ${generateRow("Status", exam?.status, status, true)}
            </tbody>
          </table>
        `;
        // Send emails to both tutor and student
        const emailPromises = [
          sendEmail({
            to: exam?.tutor_email || "",
            subject: "Exam Update Notification",
            text: "The exam has been updated successfully.",
            html: changesHtml,
            token: user.token,
          }),
          sendEmail({
            to: exam?.student_email || "",
            subject: "Exam Update Notification",
            text: "The exam has been updated successfully.",
            html: changesHtml,
            token: user.token,
          }),
        ];
        await Promise.all(emailPromises);
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
            Authorization: `Bearer ${user.token}`,
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
    } catch (error) {
      showToast({ message: "Error updating exam", type: "error" });
    }
  };

  const handleRoomChange = (newRoomId: number) => {
    const room = options.rooms.find((r) => r.id === newRoomId);
    if (!exam || !room) return;

    // Convert selected exam start time and end time to Date objects
    const selectedExamStart = new Date(exam.date);
    const selectedExamEnd = new Date(selectedExamStart.getTime() + exam.duration * 60000);

    // Check for overlapping exams in the same room
    const overlappingExams = allExams.filter((examData) => {
      if (examData.id === exam.id || examData.room_id !== newRoomId || examData.room_id === null) return false;

      const examStart = new Date(examData.date);
      const examEnd = new Date(examStart.getTime() + examData.duration * 60000);

      // Check if there is a time overlap
      return (
        examStart < selectedExamEnd && examEnd > selectedExamStart // Overlapping condition
      );
    });

    // Check if the overlapping exams exceed room capacity
    if (overlappingExams.length + 1 > room.capacity) {
      showToast({
        message: "Room capacity exceeded with overlapping exams.",
        type: "error",
      });
      return;
    }

    // If capacity allows, assign the room
    if (room.capacity === 0) {
      setSelectedRoomId(newRoomId); // Track room to be set if confirmed
      setShowConfirmDialog(true);
    } else {
      setRoom(newRoomId);
      showToast({ message: `Room capacity: ${room.capacity}`, type: "info" });
    }
  };

  const handleConfirmRoomSelection = () => {
    setRoom(selectedRoomId);
    setShowConfirmDialog(false);
    showToast({ message: "Room with 0 capacity selected", type: "warning" });
  };

  const handleCancelRoomSelection = () => {
    setSelectedRoomId(null);
    setShowConfirmDialog(false);
    setRoom(null);
    showToast({ message: "Room selection canceled", type: "info" });
  };

  if (loading || !exam) {
    return (
      <p aria-live="polite" aria-busy="true">
        Loading exam data...
      </p>
    );
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
      <>
      <div className="flex flex-row md:flex-row justify-between items-center px-4">
        <h1 id="exam-editor-title" className="text-2xl font-bold mb-4 sr-only" tabIndex={0}>
          {t("Exam Editor")}
          </h1>
          
        <EditField
          title={t("Exam Title")}
          editMode={editMode}
          text={title}
          hideTitle={true}
          onChange={(e) => setTitle(e.target.value)}
          aria-label={t("Exam Title")}
          required={true}
        />
      </div>
      <div
      className="flex flex-col md:flex-row justify-between gap-4 px-2"
      role="region"
      aria-labelledby="side-by-side-divs-heading"
      > 
      {/* First div */}
      <div
        className="w-1/2 p-4 rounded shadow-md"
        role="region"
        aria-labelledby="first-div-heading"
      >
        <EditField
          title={t("LVA Num")}
          editMode={editMode}
          text={lva_num ? lva_num.toString() : ""}
          hideTitle={false}
          onChange={(e) => setLvaNum(Number(e.target.value))}
          aria-label={t("LVA course Number")}
          required={true}
        />

        <DateField
          title={t("Date/Time")}
          editMode={editMode}
          dateValue={date}
          onDateChange={handleDateChange}
          onTimeChange={handleTimeChange}
          aria-label={t("Exam Date and Time")}
          required={true}
        />
        <EditField
          title={t("Duration")}
          editMode={editMode}
          text={duration ? duration.toString() : ""}
          hideTitle={false}
          onChange={(e) => setDuration(Number(e.target.value))}
          aria-label={t("Exam Duration")}
          required={true}
        />

        <DropdownWithSearch
          tableName="students"
          label={"Student"}
          options={dropdownOptions(options.students, "first_name", "last_name")}
          value={student ?? ""}
          onChange={(newValue) => setStudent(Number(newValue))}
          placeholder={t("Search student...")}
          disabled={!editMode}
          aria-label={t("Exam Student")}
          required={true}
        />

        <DropdownWithSearchMultiple
          tableName="tutors"
          label={"Tutors"}
          options={dropdownOptions(options.tutors, "first_name", "last_name")}
          value={tutor ?? ""}
          values={registeredTutors}
          onChange={(newValue) => {
            setTutor(Number(newValue));
          }}
          placeholder={t("Search tutors...")}
          disabled={!editMode}
          aria-label={t("Exam Tutor")}
        />
          
        <StatusSelector
          title="Status"
          value={status}
          disabled={!editMode}
          onChange={(newValue) => setStatus((newValue))}
        />
      </div>
      <div
        className="w-1/2 p-4 rounded shadow-md"
        role="region"
        aria-labelledby="second-div-heading"
      >
        <DropdownWithSearch
          tableName="examiners"
          label={t("Examiner")}
          options={dropdownOptions(options.examiners, "first_name", "last_name")}
          value={examiner ?? ""}
          onChange={(newVal) => setExaminer(Number(newVal))}
          placeholder={t("Search examiner...")}
          disabled={!editMode}
          aria-label={t("Course Examiner")}
          required={true}
            />
            
        <DropdownWithSearch
          tableName="majors"
          label={t("Major")}
          options={dropdownOptions(options.majors, "name")}
          value={major ?? ""}
          onChange={(newVal) => setMajor(Number(newVal))}
          placeholder={t("Search majors...")}
          disabled={!editMode}
          aria-label={t("Course Major")}
        />

        <DropdownWithSearch
          tableName="institutes"
          label={t("Institute")}
          options={dropdownOptions(options.institutes, "name")}
          value={institute ?? ""}
          onChange={(newVal) => setInstitute(Number(newVal))}
          placeholder={t("Search institutes...")}
          disabled={!editMode}
          aria-label={t("Course Institute")}
        />

        <DropdownWithSearch
          tableName="exam-modes"
          label={t("Mode")}
          options={dropdownOptions(options.modes, "name")}
          value={mode ?? ""}
          onChange={(newVal) => setMode(Number(newVal))}
          placeholder={t("Search modes...")}
          disabled={!editMode}
          aria-label={t("Exam Mode")}
          required={true}
        />

        <DropdownWithSearch
          tableName="rooms"
          label={t("Room")}
          options={dropdownOptions(options.rooms, "name")}
          value={room ?? ""}
          onChange={(newVal) => handleRoomChange(Number(newVal))}
          placeholder={t("Search rooms...")}
          disabled={!editMode}
          aria-label={t("Room Selector")}
        />

        <EditField
          title={"Notes"}
          editMode={editMode}
          text={notes}
          hideTitle={false}
          onChange={(e) => setNotes(e.target.value)}
          aria-label={t("Exam Notes")}
        />
      </div>
    </div>
    <div className="m-5 mt-4 flex flex-row md:flex-row space-x-2">
      <button
        onClick={() => navigate(-1)}
        className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:bg-slate-700"
        aria-label={t("Back to previous page")}
      >
        {"Back"}
      </button>
      <button
        onClick={() => {
          setEditMode(!editMode);
          if (editMode) handleUpdate();
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
        aria-label={editMode ? t("Save changes") : t("Edit exam")}
      >
        {editMode ? t("Save") : t("Edit")}
        </button>
        {editMode && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700"
            onClick={() => {
              setEditMode(false);
            }}
            aria-label={t("Cancel editing")}
          >
            {t("Cancel")}
          </button>
        )}
    </div>
    {showConfirmDialog && (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <div className="bg-white p-4 rounded shadow-lg max-w-sm">
          <h2 id="confirm-dialog-title" className="text-lg font-bold mb-4">
            {t("Confirm Room Selection")}
          </h2>
          <p id="confirm-dialog-description" className="mb-4">
            {t("The selected room has a capacity of 0. Do you want to continue?")}
          </p>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelRoomSelection}
              className="border-2 border-gray-300 bg-gray-200 text-gray-700 py-1 px-3 rounded hover:bg-gray-300 focus:ring-2 focus:ring-gray-400"
              aria-label={t("Cancel room selection")}
            >
              {t("Cancel")}
            </button>
            <button
              onClick={handleConfirmRoomSelection}
              className="border-2 border-red-500 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500"
              aria-label={t("Confirm room selection")}
            >
              {t("Confirm")}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
    );
  else
    return (
      <div className="m-5" role="region" aria-labelledby="exam-editor-title">
        <h1 id="exam-editor-title" className="text-2xl font-bold mb-4 sr-only" tabIndex={0}>
          {t("Exam Editor")}
        </h1>
        <EditField
          title={t("Exam Title")}
          editMode={editMode} text={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label={t("Exam Title")}
          required={true}
          aria-required="true"
        />
        
        <EditField
          title={t("LVA Num")}
          editMode={editMode}
          text={lva_num?.toString() ?? ""}
          hideTitle={false}
          onChange={(e) => setLvaNum(Number(e.target.value))}
          aria-label={t("LVA course Number")}
          required={true}
          aria-required="true"
        />
        <DateField
          title={t("Date/Time")}
          editMode={editMode}
          dateValue={date}
          onDateChange={handleDateChange}
          onTimeChange={handleTimeChange}
          aria-label={t("Exam Date and Time")}
          required={true}
          aria-required="true"
        />
        <EditField
          title={t("Duration")}
          editMode={editMode}
          text={duration?.toString() ?? ""}
          hideTitle={false}
          onChange={(e) => setDuration(Number(e.target.value))}
          aria-label={t("Exam Duration")}
          required={true}
          aria-required="true"
        />

        <DropdownWithSearch
          tableName="examiners"
          label={t("Examiner")}
          options={dropdownOptions(options.examiners, "first_name", "last_name")}
          value={examiner ?? ""}
          onChange={(val) => setExaminer(Number(val))}
          placeholder={t("Search examiner...")}
          disabled={!editMode}
          aria-label={t("Course Examiner")}
          required={true}
          aria-required="true"
        />

        <DropdownWithSearch
          tableName="institutes"
          label={t("Institute")}
          options={dropdownOptions(options.institutes, "name")}
          value={institute ?? ""}
          onChange={(val) => setInstitute(Number(val))}
          placeholder={t("Search institutes...")}
          disabled={!editMode}
          aria-label={t("Course Institute")}
        />

        <DropdownWithSearch
          tableName="exam-modes"
          label={t("Mode")}
          options={dropdownOptions(options.modes, "name")}
          value={mode ?? ""}
          onChange={(val) => setMode(Number(val))}
          placeholder={t("Search modes...")}
          disabled={!editMode}
          aria-label={t("Exam Mode")}
          required={true}
          aria-required="true"
        />

        <EditField
          title={t("Notes")}
          editMode={editMode}
          text={notes}
          hideTitle={false}
          onChange={(e) => setNotes("Pending")}
          aria-label={t("Exam Notes")}
        />

        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:bg-slate-700"
            aria-label={t("Back to previous page")}
          >
            {t("Back")}
          </button>
          {user.role != "Tutor" ? (
            <>
              <button
                onClick={() => {
                  setEditMode(!editMode);
                  if (editMode) handleUpdate();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
                aria-label={editMode ? t("Save changes") : t("Edit exam")}
              >
                {editMode ? t("Save") : t("Edit")}
              </button>
              {editMode && (
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700"
                  onClick={() => {
                    setEditMode(!editMode);
                  }}
                  aria-label={t("Cancel editing")}
                >
                  {t("Cancel")}
                </button>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    );
}
