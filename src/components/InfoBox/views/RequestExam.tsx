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
import Exam from "../../classes/Exam";
import Notification, { NotificationType } from "../../classes/Notification";
import ExaminerDropdown from "../components/ExaminerDropdown";
import config from "../../../config";

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
  studentEmail: string;
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
  const [examinerEmail, setExaminerEmail] = useState<string>("");
  const [institute, setInstitute] = useState<number | string | undefined>();
  const [mode, setMode] = useState<number | undefined>();
  const [studentEmail, setStudentEmail] = useState<string>(user.userEmail || "");
  const [examiners, setExaminers] = useState<Examiner[]>([]);

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
    studentEmail: user.userEmail,
  });

  const [options, setOptions] = useState({
    examiners: [] as Examiner[],
    institutes: [] as Institute[],
    modes: [] as ExamMode[],
  });

  useEffect(() => {
    const fetchDropdownOptions = async () => {
      try {
        const [examinersRes, studentRes, institutesRes, modesRes] = await Promise.all([
          fetch(config.strapiUrl +"/api/examiners", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch(config.strapiUrl +"/api/students/me", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch(config.strapiUrl +"/api/institutes", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch(config.strapiUrl +"/api/exam-modes", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch(config.strapiUrl +"/api/rooms", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
        ]);
        setExaminers(examinersRes ?? []); // Populate examiners

        setOptions({
          examiners: examinersRes ?? [],
          institutes: institutesRes ?? [],
          modes: modesRes ?? [],
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
          studentEmail,
        });
      } catch (error) {
        showToast({ message: t("Error fetching dropdown options"), type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownOptions();
  }, [user.token, t]);

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

    t = t + ' "student_id" : "' + student + '",';
    t = t + ' "examiner_id" : "' + examiner + '",';
    t = t + ' "institute_id" : "' + institute + '",';
    t = t + ' "exam_mode" : "' + mode + '",';
    t = t + ' "student_email" : "' + studentEmail + '",';

    if (t != "") {
      t = t.substring(0, t.length - 1);
      t = "{" + t + "}";
    }

    return t;
  }

  const handleSubmit = async () => {
    // Mapping of fields to their labels
    const fieldMapping = {
      title: t("Exam Title"),
      studentEmail: t("Student Email"),
      lva_num: t("LVA Number"),
      date: t("Date/Time"),
      duration: t("Duration"),
      examiner: t("Examiner"),
      institute: t("Institute"),
      mode: t("Mode"),
    };

    // Find missing fields
    const missingFields = Object.entries(fieldMapping)
      .filter(([field]) => !eval(field)) // Dynamically check if the field is missing
      .map(([, label]) => label); // Get the user-friendly label

    if (missingFields.length > 0) {
      showToast({
        message: `${t("Please fill in the following fields")}: ${missingFields.join(", ")}`,
        type: "error",
      });
      return;
    }

    const data: Partial<Exam> = {
      title: title,
      date: date,
      student_id: student,
      duration: duration,
      examiner_id: 0,
      examiner: undefined,
      institute_id: 0,
      exam_mode: mode,
      lva_num,
      student_email: studentEmail,
    };

    if (typeof examiner == "number") {
      data.examiner_id = examiner;
    } else {
      if (examiner) {
        let nuExaminer = new Examiner();
        let firstName = examiner?.substring(0, examiner.indexOf(" ")).trim();
        let lastName = examiner?.substring(examiner.indexOf(" "), examiner.length).trim();
        let exEmail = examinerEmail ?? "";

        nuExaminer.first_name = firstName;
        nuExaminer.last_name = lastName;
        nuExaminer.email = exEmail;
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

      if (addedEx != "") {
        const notify = await fetch(`${config.strapiUrl}/api/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ data: notif }),
        });

        if (!notify.ok) {
          const errorData = await notify.json();
          showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${notify.status}, ${t("Message")}: ${errorData.error.message || t("Unknown error")}}.`, type: "error"});
          return;
        }

        showToast({ message: t("Exam notification created successfully"), type: "success" });
      }

      navigate("/student/all-exams");
    } catch (error) {
      showToast({ message: t("Error creating exam notification"), type: "error" });
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

    navigate("/student/all-exams");
  };

  const dropdownOptions = (list: any[] = [], firstNameField: string, lastNameField?: string) =>
    list.map((item: any) => ({
      value: item.id,
      label: lastNameField ? `${item[firstNameField]} ${item[lastNameField]}` : item[firstNameField],
  }));
  
  const handleAddExaminer = (newExaminer: Examiner) => {
    setExaminers((prevExaminers) => [...prevExaminers, newExaminer]);
    setOptions((prevOptions) => ({
      ...prevOptions,
      examiners: [...prevOptions.examiners, newExaminer],
    }));
    setExaminer(newExaminer.first_name+ " "+newExaminer.last_name);
    setExaminerEmail(newExaminer.email || "");
    showToast({ message: t("Examiner added successfully"), type: "success" });
  };

  const handleSelectExaminer = (examinerId: number) => {
    setExaminer(examinerId); 
  };

  if (loading)
    return (
      <p aria-live="polite" aria-busy="true">
        {t("Loading exam data...")}
      </p>
    );

  return (
    <div className="m-5" aria-labelledby="request-exam-heading" role="form">
      <h1 id="request-exam-heading" className="text-2xl font-bold mb-4">
        {t("Request an Exam")}
      </h1>
      <EditField
        title={t("Exam Title")}
        editMode={editMode}
        text={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label={t("Add Exam Title")}
        required={true}
        aria-required="true"
      />
      <EditField
        title={t("LVA Num")}
        editMode={editMode}
        text={lva_num?.toString() ?? ""}
        onChange={(e) => setLvaNum(Number(e.target.value))}
        aria-label={t("Add Exam LVA Num")}
        required={true}
        aria-required="true"
      />
      <DateField
        title={t("Date/Time")}
        editMode={editMode}
        dateValue={date}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
        aria-label={t("Add Exam Date and Time")}
        required={true}
        aria-required="true"
      />
      <div className="m-2"></div>
      <EditField
        title={t("Duration")}
        editMode={editMode}
        text={duration?.toString() ?? ""}
        onChange={(e) => setDuration(Number(e.target.value))}
        aria-label={t("Add Exam Duration in minutes")}
        required={true}
        aria-required="true"
      />

      <ExaminerDropdown
        examiners={examiners}
        onAddExaminer={handleAddExaminer}
        onSelectExaminer={handleSelectExaminer}
        aria-label={t("Add Exam Examiner")}
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
        submit={submit}
        aria-label={t("Add Exam Institute")}
        required={true}
        aria-required="true"
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
        aria-label={t("Add Exam Mode")}
        required={true}
        aria-required="true"
      />

      <div className="mt-4 flex space-x-2">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
          aria-label={t("Submit Request")}
          onClick={() => handleSubmit()}
        >
          {t("Submit")}
        </button>
        <button
          onClick={handleCancel}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700"
          aria-label={t("Cancel Request")}
        >
          {t("Cancel")}
        </button>
      </div>
    </div>
  );
}
