import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import config from "../../../config";
import EnumSelector from "../components/EnumSelector";
import CopyExamEmail from "../components/CopyExamEmail";
import ExamProtocolGenerator from "../components/ExamProtocolGenerator";
import DeleteExamButton from "../components/DeleteExamButton";
import fetchAll from "./FetchAll";

export default function ExamEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [title, setTitle] = useState<string>("");
  const [lva_num, setLvaNum] = useState<string>(""); // STRING on the frontend
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
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [editDisabled, disableEdit] = useState<boolean>(false);

  const [options, setOptions] = useState({
    students: [] as Student[],
    tutors: [] as Tutor[],
    examiners: [] as Examiner[],
    majors: [] as Major[],
    institutes: [] as Institute[],
    modes: [] as ExamMode[],
    rooms: [] as Room[],
  });

  const formatExamData = (e: Exam): Exam => {
    typeof e.examiner === "number" ? (e.examiner_id = e.examiner) : (e.examiner_id = (e.examiner as any)?.id ?? null);
    typeof e.institute === "number" ? (e.institute_id = e.institute) : (e.institute_id = (e.institute as any)?.id ?? null);
    typeof e.student === "number" ? (e.student_id = e.student) : (e.student_id = (e.student as any)?.id ?? null);
    typeof e.exam_mode === "number" ? (e.mode_id = e.exam_mode) : (e.mode_id = (e.exam_mode as any)?.id ?? null);
    return e;
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        let path = "";
        if (user.role === "Admin" || user.role === "Tutor") path = `${config.strapiUrl}/api/exams/${id}`;
        else if (user.role === "Student") path = `${config.strapiUrl}/api/exams/me`;

        const examResponse = await fetch(path, { headers: { Authorization: `Bearer ${user.token}` } });
        const rawData = await examResponse.json();

        if (!examResponse.ok) {
          showToast({ message: `${t("Error fetching exam data")}: ${examResponse.status}, Message: ${rawData?.error?.message || "Unknown error"}.`, type: "error" });
        }

        let examData: Exam | undefined;
        if (user.role === "Student" && Array.isArray(rawData)) {
          examData = rawData.find((x: any) => String(x.id) === String(id));
        } else {
          examData = rawData;
        }

        if (examData) {
          if (user.role === "Student") {
            examData = formatExamData(examData);
            const todayUTC = new Date(new Date().toISOString());
            const targetUTC = new Date(new Date(examData.date).toISOString());
            const dayDiff = (targetUTC.getTime() - todayUTC.getTime()) / (1000 * 60 * 60 * 24);
            disableEdit(dayDiff < 2.0);
          }

          setExam(examData);
          setOriginalExam(examData);
          setTitle(examData.title ?? "");
          setLvaNum((examData.lva_num ?? "").toString());
          setDate(examData.date ?? "");
          setDuration(examData.duration ?? 0);
          setRoom(examData.room_id ?? null);
          setNotes(examData.notes ?? "");
          setTutor(examData.tutor_id ?? undefined);
          setRegisteredTutors(examData.registeredTutors ?? []);
          setStudent(examData.student_id ?? undefined);
          setExaminer(examData.examiner_id ?? undefined);
          setMajor(examData.major_id ?? undefined);
          setInstitute(examData.institute_id ?? undefined);
          setMode(examData.mode_id ?? undefined);
          setStatus(examData.status ?? ExamStatus.NoEmailExaminer);
        } else {
          showToast({ message: t("No exam data found"), type: "error" });
        }
      } catch (error) {
        showToast({ message: t("Error fetching exam data"), type: "error" });
      } finally {
        setLoading(false);
      }
    };

    const fetchDropdownOptions = async () => {
      try {
        const [students, tutorsRaw, examiners, majors, institutes, modes, rooms] = await Promise.all([
          fetchAll(`${config.strapiUrl}/api/students`, user.token, t("HTTP error!")),
          user.role === "Admin" ? fetchAll(`${config.strapiUrl}/api/tutors`, user.token, t("HTTP error!")) : Promise.resolve([] as Tutor[]),
          fetchAll(`${config.strapiUrl}/api/examiners`, user.token, t("HTTP error!")),
          fetchAll(`${config.strapiUrl}/api/majors`, user.token, t("HTTP error!")),
          fetchAll(`${config.strapiUrl}/api/institutes`, user.token, t("HTTP error!")),
          fetchAll(`${config.strapiUrl}/api/exam-modes`, user.token, t("HTTP error!")),
          fetchAll(`${config.strapiUrl}/api/rooms`, user.token, t("HTTP error!")),
        ]);

        const availableRooms: Room[] = (rooms as any[]).filter((r: any) => r.isAvailable === true);

        setOptions({
          students: students as Student[],
          tutors: (tutorsRaw as Tutor[]) ?? [],
          examiners: examiners as Examiner[],
          majors: majors as Major[],
          institutes: institutes as Institute[],
          modes: modes as ExamMode[],
          rooms: availableRooms,
        });
      } catch {
        showToast({ message: t("Error fetching dropdown options"), type: "error" });
      }
    };

    const fetchAllExams = async () => {
      const exams = (await fetchAll(`${config.strapiUrl}/api/exams`, user.token, t("Error fetching exams"))) as Exam[];
      setAllExams(exams.filter((e: any) => e.status !== ExamStatus.archived));
    };

    fetchExam();
    fetchDropdownOptions();
    if (user.role === "Admin") fetchAllExams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user.role, user.token, t]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    const currentTime = moment.utc(date).format("HH:mm:ss");
    const updatedDate = moment(`${selectedDate}T${currentTime}`, "YYYY-MM-DDTHH:mm:ss").utc().toISOString();
    setDate(updatedDate);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = event.target.value;
    const currentDate = moment.utc(date).format("YYYY-MM-DD");
    const updatedDate = moment(`${currentDate}T${selectedTime}`, "YYYY-MM-DDTHH:mm").utc().toISOString();
    setDate(updatedDate);
  };

  function compareField(field: string, value: number | undefined) {
    if (!exam) return false;
    const val: any = (exam as any)[field];
    if (val == null) return false;
    if (typeof val === "number") return val === value;
    if (typeof val === "object" && "id" in val) return (val as any).id === value;
    return false;
  }

  function examChanged(): string {
    if (!exam) return "{}";
    const delta: Record<string, unknown> = {};

    if (title !== exam.title) delta.title = title;
    if ((lva_num ?? "").trim() !== (exam.lva_num ?? "")) delta.lva_num = String(lva_num ?? "").trim();
    if (date !== exam.date) delta.date = date;
    if (duration !== exam.duration) delta.duration = duration;
    if ((notes ?? "").trim() !== (exam.notes ?? "")) delta.notes = notes;

    if (user.role === "Admin") {
      if (!compareField("student", student)) delta.student_id = student;
      if (!compareField("tutor", tutor)) delta.tutor_id = tutor;
      if (room && !compareField("room", room)) delta.room_id = room;
      if (!compareField("examiner", examiner)) delta.examiner_id = examiner;
      if (!compareField("major", major)) delta.major_id = major;
      if (!compareField("institute", institute)) delta.institute_id = institute;
      if (!compareField("exam_mode", mode)) delta.mode_id = mode;
    } else {
      if (student !== exam.student_id) delta.student_id = student;
      if (tutor !== exam.tutor_id) delta.tutor_id = tutor;
      if (room !== exam.room_id) delta.room_id = room;
      if (examiner !== exam.examiner_id) delta.examiner_id = examiner;
      if (major !== exam.major_id) delta.major_id = major;
      if (institute !== exam.institute_id) delta.institute_id = institute;
      if (mode !== exam.mode_id) delta.mode_id = mode;
    }

    return JSON.stringify(delta);
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
      lva_num: (lva_num ?? "").replace(",", ".").trim(), // always send string
      notes,
      status,
    };

    try {
      if (user.role === "Admin") {
        const response = await fetch(`${config.strapiUrl}/api/exams/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          showToast({ message: `${t("Error updating exam")}: ${response.status}, Message: ${errorData?.error?.message || "Unknown error"}.`, type: "error" });
          return;
        } else {
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
               ${generateRow("Date", exam?.date ? moment(exam.date).format("DD.MM.YYYY HH:mm") : "N/A", date ? moment(date).format("DD.MM.YYYY HH:mm") : moment(exam?.date).format("DD.MM.YYYY HH:mm"), true)}
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

          await Promise.all([
            sendEmail({ to: exam?.tutor_email || "", subject: "Exam Update Notification", text: "The exam has been updated successfully.", html: changesHtml, token: user.token }),
            sendEmail({ to: exam?.student_email || "", subject: "Exam Update Notification", text: "The exam has been updated successfully.", html: changesHtml, token: user.token }),
          ]);
        }
      }

      // Create a notification with a SAFE JSON payload
      if (exam) {
        const change = examChanged(); // JSON string
        if (change && change !== "{}") {
          const notif = new Notification(change, JSON.stringify(originalExam), user.user, exam.id);
          notif.type = user.role === "Admin" ? NotificationType.adminChange : NotificationType.proposeChange;

          const notify = await fetch(`${config.strapiUrl}/api/notifications`, {
            method: "POST",
            headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ data: notif }),
          });

          if (!notify.ok) {
            const errorData = await notify.json();
            showToast({ message: `${t("Error submitting notification")}: ${notify.status}, Message: ${errorData?.error?.message || "Unknown error"}.`, type: "error" });
            return;
          }
        }
      }
    } catch {
      showToast({ message: t("Error updating exam"), type: "error" });
    }
  };

  const handleRoomChange = (newRoomId: number) => {
    const rm = options.rooms.find((r) => r.id === newRoomId);
    if (!exam || !rm) return;

    const selectedExamStart = new Date(exam.date);
    const selectedExamEnd = new Date(selectedExamStart.getTime() + (exam.duration ?? 0) * 60000);

    const overlappingExams = allExams.filter((e) => {
      if (e.id === exam.id || e.room_id !== newRoomId || e.room_id == null) return false;
      const start = new Date(e.date);
      const end = new Date(start.getTime() + (e.duration ?? 0) * 60000);
      return start < selectedExamEnd && end > selectedExamStart;
    });

    if (overlappingExams.length + 1 > (rm.capacity ?? 0)) {
      showToast({ message: t("Room capacity exceeded with overlapping exams!"), type: "error" });
      return;
    }

    if ((rm.capacity ?? 0) === 0) {
      setSelectedRoomId(newRoomId);
      setShowConfirmDialog(true);
    } else {
      setRoom(newRoomId);
      showToast({ message: `${t("Room capacity")}: ${rm.capacity}`, type: "info" });
    }
  };

  const handleConfirmRoomSelection = () => {
    setRoom(selectedRoomId ?? null);
    setShowConfirmDialog(false);
    showToast({ message: t("Room with 0 capacity selected"), type: "warning" });
  };

  const handleCancelRoomSelection = () => {
    setSelectedRoomId(null);
    setShowConfirmDialog(false);
    setRoom(null);
    showToast({ message: t("Room selection canceled"), type: "info" });
  };

  if (loading || !exam) {
    return <p aria-live="polite" aria-busy="true">{t("Loading exam data...")}</p>;
  }

  return user.role === "Admin" ? (
    <>
      <div className="flex flex-row md:flex-row justify-between items-center px-4">
        <h1 id="exam-editor-title" className="text-2xl font-bold mb-4 sr-only" tabIndex={0}>{t("Exam Editor")}</h1>
        <EditField title={t("Exam Title")} editMode={editMode} text={title} hideTitle onChange={(e) => setTitle(e.target.value)} aria-label={t("Exam Title")} required />
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 px-2" role="region" aria-labelledby="side-by-side-divs-heading">
        <div className="w-1/2 p-4 rounded shadow-md" role="region" aria-labelledby="first-div-heading">
          <EditField
            title={t("LVA Num")}
            editMode={editMode}
            text={lva_num}
            hideTitle={false}
            onChange={(e) => setLvaNum(e.target.value.replace(",", ".").trim())}
            required
          />

          <DateField title={t("Date/Time")} editMode={editMode} dateValue={date} onDateChange={handleDateChange} onTimeChange={handleTimeChange} aria-label={t("Exam Date and Time")} required />
          <EditField title={t("Duration")} editMode={editMode} text={duration ? duration.toString() : ""} hideTitle={false} onChange={(e) => setDuration(Number(e.target.value))} aria-label={t("Exam Duration")} required />

          <DropdownWithSearch tableName="students" label={t("Student")} options={dropdownOptions(options.students, "first_name", "last_name")} value={student ?? ""} onChange={(v) => setStudent(Number(v))} placeholder={t("Search student...")} disabled={!editMode} aria-label={t("Exam Student")} required />

          <DropdownWithSearchMultiple tableName="tutors" label={t("Tutors")} options={dropdownOptions(options.tutors, "first_name", "last_name")} value={tutor ?? ""} values={registeredTutors} onChange={(v) => setTutor(Number(v))} placeholder={t("Search tutors...")} disabled={!editMode} aria-label={t("Exam Tutor")} />

          <EnumSelector title={t("Status")} value={status} disabled={!editMode} onChange={(v) => setStatus(v)} options={Object.values(ExamStatus)} aria-label={t("Exam Status")} />
        </div>

        <div className="w-1/2 p-4 rounded shadow-md" role="region" aria-labelledby="second-div-heading">
          <DropdownWithSearch tableName="examiners" label={t("Examiner")} options={dropdownOptions(options.examiners, "first_name", "last_name")} value={examiner ?? ""} onChange={(v) => setExaminer(Number(v))} placeholder={t("Search examiner...")} disabled={!editMode} aria-label={t("Course Examiner")} required />

          <DropdownWithSearch tableName="majors" label={t("Major")} options={dropdownOptions(options.majors, "name")} value={major ?? ""} onChange={(v) => setMajor(Number(v))} placeholder={t("Search majors...")} disabled={!editMode} aria-label={t("Course Major")} />

          <DropdownWithSearch tableName="institutes" label={t("Institute")} options={dropdownOptions(options.institutes, "name")} value={institute ?? ""} onChange={(v) => setInstitute(Number(v))} placeholder={t("Search institutes...")} disabled={!editMode} aria-label={t("Course Institute")} />

          <DropdownWithSearch tableName="exam-modes" label={t("Mode")} options={dropdownOptions(options.modes, "name")} value={mode ?? ""} onChange={(v) => setMode(Number(v))} placeholder={t("Search modes...")} disabled={!editMode} aria-label={t("Exam Mode")} required />

          <DropdownWithSearch tableName="rooms" label={t("Room")} options={dropdownOptions(options.rooms, "name")} value={room ?? ""} onChange={(v) => handleRoomChange(Number(v))} placeholder={t("Search rooms...")} disabled={!editMode} aria-label={t("Room Selector")} />

          <EditField title={t("Notes")} editMode={editMode} text={notes} hideTitle={false} onChange={(e) => setNotes(e.target.value)} aria-label={t("Exam Notes")} />

          <CopyExamEmail student={student ? options.students.find((s) => s.id === student) : undefined} exam={exam} examiner={examiner ? options.examiners.find((s) => s.id === examiner) : undefined} user={user.user} editMode={editMode} />
          <ExamProtocolGenerator
            student={student ? options.students.find((s) => s.id === student) : undefined}
            exam={exam}
            examiner={examiner ? options.examiners.find((s) => s.id === examiner) : undefined}
            user={user.user}
            editMode={editMode}
            tutor={tutor ? options.tutors.find((s) => s.id === tutor) : undefined}
            room={room ? options.rooms.find((s) => s.id === room)?.name : ""}
            mode={mode ? options.modes.find((s) => s.id === mode)?.name : ""}
            institute={institute ? options.institutes.find((s) => s.id === institute) : undefined}
          />
        </div>
      </div>

      <div className="m-5 mt-4 flex flex-row md:flex-row space-x-2">
        <button onClick={() => navigate(-1)} className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:bg-slate-700" aria-label={t("Back to previous page")}>
          {t("Back")}
        </button>
        <button
          onClick={() => {
            setEditMode((m) => !m);
            if (editMode) handleUpdate();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
          aria-label={editMode ? t("Save changes") : t("Edit exam")}
        >
          {editMode ? t("Save") : t("Edit")}
        </button>
        {editMode && (
          <>
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700" onClick={() => setEditMode(false)} aria-label={t("Cancel editing")}>
              {t("Cancel")}
            </button>
            <DeleteExamButton id={exam.id} success={() => navigate(-1)} />
          </>
        )}
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
          <div className="bg-white p-4 rounded shadow-lg max-w-sm">
            <h2 id="confirm-dialog-title" className="text-lg font-bold mb-4">{t("Confirm Room Selection")}</h2>
            <p id="confirm-dialog-description" className="mb-4">{t("The selected room has a capacity of 0. Do you want to continue?")}</p>
            <div className="flex justify-end space-x-2">
              <button onClick={handleCancelRoomSelection} className="border-2 border-gray-300 bg-gray-200 text-gray-700 py-1 px-3 rounded hover:bg-gray-300 focus:ring-2 focus:ring-gray-400" aria-label={t("Cancel room selection")}>
                {t("Cancel")}
              </button>
              <button onClick={handleConfirmRoomSelection} className="border-2 border-red-500 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500" aria-label={t("Confirm room selection")}>
                {t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  ) : (
    <div className="m-5" role="region" aria-labelledby="exam-editor-title">
      <h1 id="exam-editor-title" className="text-2xl font-bold mb-4 sr-only" tabIndex={0}>{t("Exam Editor")}</h1>

      <EditField title={t("Exam Title")} editMode={editMode} text={title} onChange={(e) => setTitle(e.target.value)} aria-label={t("Exam Title")} required aria-required="true" />

      <EditField
        title={t("LVA Num")}
        editMode={editMode}
        text={lva_num}
        hideTitle={false}
        onChange={(e) => setLvaNum(e.target.value.replace(",", ".").trim())}
        aria-label={t("LVA course Number")}
        required
        aria-required="true"
      />

      <DateField title={t("Date/Time")} editMode={editMode} dateValue={date} onDateChange={handleDateChange} onTimeChange={handleTimeChange} aria-label={t("Exam Date and Time")} required aria-required="true" />
      <EditField title={t("Duration")} editMode={editMode} text={duration?.toString() ?? ""} hideTitle={false} onChange={(e) => setDuration(Number(e.target.value))} aria-label={t("Exam Duration")} required aria-required="true" />

      <DropdownWithSearch tableName="examiners" label={t("Examiner")} options={dropdownOptions(options.examiners, "first_name", "last_name")} value={examiner ?? ""} onChange={(v) => setExaminer(Number(v))} placeholder={t("Search examiner...")} disabled={!editMode} aria-label={t("Course Examiner")} required aria-required="true" />

      <DropdownWithSearch tableName="institutes" label={t("Institute")} options={dropdownOptions(options.institutes, "name")} value={institute ?? ""} onChange={(v) => setInstitute(Number(v))} placeholder={t("Search institutes...")} disabled={!editMode} aria-label={t("Course Institute")} />

      <DropdownWithSearch tableName="exam-modes" label={t("Mode")} options={dropdownOptions(options.modes, "name")} value={mode ?? ""} onChange={(v) => setMode(Number(v))} placeholder={t("Search modes...")} disabled={!editMode} aria-label={t("Exam Mode")} required aria-required="true" />

      <div className="mt-4 flex space-x-2">
        <button onClick={() => navigate(-1)} className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:bg-slate-700" aria-label={t("Back to previous page")}>
          {t("Back")}
        </button>

        {user.role !== "Tutor" && (
          <>
            <button
              onClick={() => {
                setEditMode((m) => !m);
                if (editMode) handleUpdate();
              }}
              className={!editDisabled ? "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700" : "px-4 py-2 rounded opacity-40 rounded bg-gray-200 line-through"}
              aria-label={editDisabled ? t("Editing deadline has expired") : editMode ? t("Save changes") : t("Edit exam")}
              title={editDisabled ? t("Editing deadline has expired. Cannot edit 48 hours before exam.") : t("Edit exam")}
              disabled={editDisabled}
            >
              {editMode ? t("Save") : t("Edit")}
            </button>

            {editMode && (
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700" onClick={() => setEditMode(false)} aria-label={t("Cancel editing")}>
                {t("Cancel")}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export const dropdownOptions = (list: any[], firstNameField: string, lastNameField?: string) =>
  list.map((item: any) => ({
    value: item.id,
    label: lastNameField ? `${item[firstNameField]} ${item[lastNameField]}` : item[firstNameField],
  }));
