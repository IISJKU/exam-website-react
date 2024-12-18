import { useState, useEffect, useTransition } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
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
import ComparisonField from "../components/ComparisonField";
import fetchAll from "./FetchAll";
import { sendEmail } from "../../../services/EmailService";

export default function IndividualNotification() {
  const { id } = useParams(); // Get exam ID from URL params
  const { t } = useTranslation();
  const [notification, setNotification] = useState<Notification>();
  const [proposedExam, setProposedExam] = useState<Exam>(new Exam());
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

  const convertToExam = (partial: Partial<Exam>): Exam => {
    let ex = new Exam();

    if (partial.title != undefined) ex.title = partial.title;
    if (partial.student_id != undefined) ex.student_id = partial.student_id;
    if (partial.tutor_id != undefined) ex.tutor_id = partial.tutor_id;
    if (partial.room_id != undefined) ex.room_id = partial.room_id;
    if (partial.examiner_id != undefined) ex.examiner_id = partial.examiner_id;
    if (partial.duration != undefined) ex.duration = partial.duration;
    if (partial.date != undefined) ex.date = partial.date;
    if (partial.institute_id != undefined) ex.institute_id = partial.institute_id;
    if (partial.lva_num != undefined) ex.lva_num = partial.lva_num;
    if (partial.status != undefined) ex.status = partial.status;
    if (partial.student_email != undefined) ex.student_email = partial.student_email;
    if (partial.tutor_email != undefined) ex.tutor_email = partial.tutor_email;
    if (partial.major_id != undefined) ex.major_id = partial.major_id;

    if (partial.exam_mode != undefined) ex.exam_mode = partial.exam_mode;

    return ex;
  };

  // Fetch exam data based on ID from URL
  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const response = await fetch(`http://localhost:1337/api/notifications`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();

        let proposedExams: Notification[] = [];

        let exam_id = 0;

        //Check type of notif first... if its a new exam proposal, you should not collect all others
        data.forEach((element: any) => {
          if (element.id == Number(id)) {
            exam_id = Number(element.exam_id);
          }
        });

        if (exam_id != 0) {
          data.forEach((element: any) => {
            if (element.exam_id == Number(exam_id)) {
              let t = new Notification(element.information, element.oldInformation, element.seenBy, element.exam_id);
              t.sentBy = element.sentBy;
              t.type = element.type;

              if (element.type == NotificationType.confirmChange) proposedExams = [];
              else if (element.type != NotificationType.tutorConfirm && element.type != NotificationType.tutorDecline) proposedExams.push(t);
            }
          });
        } else {
          data.forEach((element: any) => {
            if (element.id == Number(id)) {
              let t = new Notification(element.information, element.oldInformation, element.seenBy, element.exam_id);
              t.sentBy = element.sentBy;

              t.type = element.type;
              proposedExams.push(t);
              setNotification(element as Notification);
            }
          });
        }

        //sort out old ones, that are preceded by either a

        interface LooseObject {
          [key: string]: any;
        }

        const propEx: Partial<Exam> = {};

        if (proposedExams.length != 1) {
          for (let i = 0; i < proposedExams.length; i++) {
            const examInfo = proposedExams[i].information;
            const parsedExam = JSON.parse(examInfo) as Exam;

            Object.entries(parsedExam).forEach(([key, value]) => {
              // Check if key is a valid property of Exam
              if (value != undefined) {
                propEx[key as keyof Exam] = value; // Type assertion to keyof Exam
              }
            });
          }

          let converted = convertToExam(propEx);
          setProposedExam(converted);
        } else {
          setProposedExam(JSON.parse(proposedExams[0].information) as Exam);
        }

        const examData = (await fetchAll("http://localhost:1337/api/exams", user.token)) as Exam[];

        if (!response.ok) {
          showToast({ message: `HTTP error! Status: ${response.status}, Message: ${"Unknown error"}.`, type: "error" });
        }

        if (examData) {
          let ex = new Exam();

          examData.forEach((element: Exam) => {
            if (Number(element.id) == Number(exam_id)) {
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
          })
            .then((res) => res.json())
            .then((rooms) => rooms.filter((room: Room) => room.isAvailable === true)),
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

  const fixProposedExam = () => {
    proposedExam.student = proposedExam.student_id;
    proposedExam.tutor = proposedExam.tutor_id;
    proposedExam.examiner = proposedExam.examiner_id;
    proposedExam.institute = proposedExam.institute_id;

    //clean up fields
    delete (proposedExam as { student_id?: number }).student_id;
    delete (proposedExam as { tutor_id?: number }).tutor_id;
    delete (proposedExam as { examiner_id?: number }).examiner_id;
    delete (proposedExam as { institute_id?: number }).institute_id;
  };

  const sendNotification = async (accept: boolean) => {
    let notif = new Notification("{}", JSON.stringify(proposedExam), user.user, exam?.id ? exam.id : proposedExam.id);

    notif.type = NotificationType.confirmChange;
    if (!accept) notif.type = NotificationType.discardChange;

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
  };

  function generateChangesHtml( currentExam: any, newExam: any, options: any, accept: boolean, emailContent: string ): string {
    const isUpdate = (currentExam == null) ? false : true;
    const current = (newExam.title == undefined) ? currentExam : newExam;
    return `
    <h3>Exam Changes</h3>
    ${emailContent}
    <table border="1" style="border-collapse: collapse; width: 70%;">
      <thead>
        <tr>
          <th style="padding: 8px; text-align: left;">Field</th>
           ${
            isUpdate ?
            `<th style="padding: 8px; text-align: left;">Old</th>
            <th style="padding: 8px; text-align: left;">New</th>`
            : `<th style="padding: 8px; text-align: left;">Details</th>`
            }
        </tr>
      </thead>
      <tbody>
        ${generateRow("Title", current?.title, newExam.title, isUpdate)}
        ${generateRow("LVA Number", current?.lva_num, newExam.lva_num, isUpdate)}
        ${generateRow(
          "Date",
          current?.date ? moment(current.date).format("DD.MM.YYYY HH:mm") : "N/A",
          newExam.date ? moment(newExam.date).format("DD.MM.YYYY HH:mm") : moment(current.date).format("DD.MM.YYYY HH:mm"), isUpdate
        )}
        ${generateRow("Duration", current?.duration, newExam.duration, isUpdate)}
        ${generateRow("Tutor", match(options.tutors, current?.tutor_id || current?.tutor), match(options.tutors, newExam.tutor_id), isUpdate)}
        ${generateRow("Student", match(options.students, current?.student_id || current?.student), match(options.students, newExam.student_id), isUpdate)}
        ${generateRow("Examiner", match(options.examiners, current?.examiner_id || current?.examiner), match(options.examiners, newExam.examiner_id), isUpdate)}
        ${generateRow("Major", match(options.majors, current?.major_id || current?.major), match(options.majors, newExam.major_id), isUpdate)}
        ${generateRow("Institute", match(options.institutes, current?.institute_id || current?.institute), match(options.institutes, newExam.institute_id), isUpdate)}
        ${generateRow("Mode", match(options.modes, current?.mode_id || current?.exam_mode), match(options.modes, newExam.mode_id), isUpdate)}
        ${generateRow("Room", match(options.rooms, current?.room_id ||  current?.room), match(options.rooms, newExam.room_id), isUpdate)}
        ${generateRow("Status", current?.status, newExam.status, isUpdate)}
      </tbody>
    </table>
    `;
  }

  const handleUpdate = async (accept: boolean) => {
    if (accept) {
      //reset notif, set to passive & apply changes

      try {
        if (exam != null && exam.id != undefined) {
          const response = await fetch(`http://localhost:1337/api/exams/${exam.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ data: proposedExam }),
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

          sendNotification(accept);
          // Generate changesHtml using the helper function
          const changesHtml = generateChangesHtml(exam, proposedExam, options, accept, "<p>The following changes have been made to the exam:</p>");

          // Send emails to both tutor and student
          const emailPromises = [
            sendEmail({
              to: exam.tutor_email || "",
              subject: "Exam Update Notification",
              text: "The exam has been updated successfully.",
              html: changesHtml,
              token: user.token,
            }),
            sendEmail({
              to: exam.student_email || "",
              subject: "Exam Update Notification",
              text: "The exam has been updated successfully.",
              html: changesHtml,
              token: user.token,
            }),
          ];
          await Promise.all(emailPromises);
        } else {
          fixProposedExam();

          const response = await fetch(`http://localhost:1337/api/exams/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: proposedExam }),
          });

          const examResponse = await fetch(`http://localhost:1337/api/exams/?sort[0]=id:desc&pagination[start]=0&pagination[limit]=25`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });

          const examData = await examResponse.json();

          let newExam: Exam | undefined;

          if (examData.length != 0) {
            for (let i = 0; i < examData.length; i++) {
              if (
                examData[i].title == proposedExam.title &&
                examData[i].student_id == proposedExam.student &&
                examData[i].duration == proposedExam.duration &&
                examData[i].lva_num == proposedExam.lva_num
              ) {
                newExam = examData[i];
              }
            }
          }

          if (newExam) {
            proposedExam.id = newExam.id;
            let newNotif = notification;

            if (newNotif != undefined) {
              newNotif.exam_id = newExam.id;

              newNotif.type = NotificationType.createExamOld;
              const notif = await fetch(`http://localhost:1337/api/notifications/${newNotif.id}`, {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${user.token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ data: newNotif }),
              });
            }
          } else {
            showToast({ message: "New Exam Not Found", type: "error" });
          }
          const changesHtml = generateChangesHtml(null, proposedExam, options, accept, "<p>The new exam has been accepted:</p>");
          // Send emails to both tutor and student
          const emailPromises = [
            sendEmail({
              to: proposedExam?.tutor_email || "",
              subject: "Exam Accepted Notification",
              text: "The exam has been accepted.",
              html: changesHtml,
              token: user.token,
            }),
            sendEmail({
              to: proposedExam?.student_email || "",
              subject: "Exam Accepted Notification",
              text: "The exam has been accepted.",
              html: changesHtml,
              token: user.token,
            }),
          ];
          await Promise.all(emailPromises);
          sendNotification(accept);
        }
      } catch (error) {
        showToast({ message: "Error updating exam", type: "error" });
      }
    } else {
      const availableExam = (proposedExam.title == undefined) ? exam : proposedExam;
      //set notif to passive, discard changes
      if (notification && (exam == null || exam.id == undefined || exam.id == 0)) {
        const notif = await fetch(`http://localhost:1337/api/notifications/${notification.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        sendNotification(false);
        const changesHtml = generateChangesHtml(null, availableExam, options, accept, "<p>We regret to inform you that the proposed exam has been <strong>declined</strong>. Below are the details of the declined exam:</p>");
        // Send emails to both tutor and student
        const emailPromises = [
          sendEmail({
            to: availableExam?.tutor_email || "",
            subject: "Exam Decline Notification",
            text: "The exam has been declined.",
            html: changesHtml,
            token: user.token,
          }),
          sendEmail({
            to: availableExam?.student_email || "",
            subject: "Exam Decline Notification",
            text: "The exam has been declined.",
            html: changesHtml,
            token: user.token,
          }),
        ];
        await Promise.all(emailPromises);
      } else {
        sendNotification(false);
        const changesHtml = generateChangesHtml(null, availableExam, options, accept, "<p>We regret to inform you that the proposed exam changes has been <strong>declined</strong>. Below are the current details of the exam:</p>");
        // Send emails to both tutor and student
        const emailPromises = [
          sendEmail({
            to: availableExam?.tutor_email || "",
            subject: "Exam Change Decline Notification",
            text: "The exam changes has been declined.",
            html: changesHtml,
            token: user.token,
          }),
          sendEmail({
            to: availableExam?.student_email || "",
            subject: "Exam Change Decline Notification",
            text: "The exam changes has been declined.",
            html: changesHtml,
            token: user.token,
          }),
        ];
        await Promise.all(emailPromises);
      }
    }

    navigate("/admin/notifications");
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



  return (
    <div className="m-5" role="main" aria-labelledby="notification-heading">
      <h1 id="notification-heading" className="text-4xl font-bold">
        {t("Proposed Changes")}
      </h1>
      <section aria-label={t("Comparison Fields")}>
        <ComparisonField
          label={t("Title")}
          options={[]}
          value={title ? title.toString() : ""}
          proposedVal={proposedExam.title || ""}
          aria-label={t("Title comparison")}
        />
        <ComparisonField
          label={t("LVA Num")}
          options={[]}
          value={lva_num?.toString() || ""}
          proposedVal={proposedExam.lva_num?.toString() || ""}
          aria-label={t("LVA number comparison")}
        />

        <ComparisonField
          label={t("Date")}
          options={[]}
          value={date != undefined ? moment(date).format("DD.MM.YYYY HH:mm") : ""}
          proposedVal={proposedExam.date ? moment(proposedExam.date).format("DD.MM.YYYY HH:mm") : ""}
          aria-label={t("Date comparison")}
        />

        <ComparisonField
          label={t("Duration")}
          options={[]}
          value={duration?.toString() || ""}
          proposedVal={proposedExam.duration?.toString() || ""}
          aria-label={t("Duration comparison")}
        />

        <ComparisonField
          label={"Student"}
          options={dropdownOptions(options.students, "first_name", "last_name")}
          value={student || ""}
          proposedVal={match(options.students, proposedExam.student_id)}
          aria-label={t("Student comparison")}
        />

        <ComparisonField
          label={"Tutor"}
          options={dropdownOptions(options.tutors, "first_name", "last_name")}
          value={tutor || ""}
          proposedVal={match(options.tutors, proposedExam.tutor_id)}
          aria-label={t("Tutor comparison")}
        />

        <ComparisonField
          label={t("Examiner")}
          options={dropdownOptions(options.examiners, "first_name", "last_name")}
          value={examiner || ""}
          proposedVal={match(options.examiners, proposedExam.examiner_id)}
          aria-label={t("Examiner comparison")}
        />

        <ComparisonField
          label={t("Major")}
          options={dropdownOptions(options.majors, "name")}
          value={major || ""}
          proposedVal={match(options.majors, proposedExam.major_id)}
          aria-label={t("Major comparison")}
        />

        <ComparisonField
          label={t("Institute")}
          options={dropdownOptions(options.institutes, "name")}
          value={institute || ""}
          proposedVal={match(options.institutes, proposedExam.institute_id)}
          aria-label={t("Institute comparison")}
        />

        <ComparisonField
          label={t("Mode")}
          options={dropdownOptions(options.modes, "name")}
          value={mode || ""}
          proposedVal={match(options.modes, proposedExam.exam_mode)}
          aria-label={t("Mode comparison")}
        />

        <ComparisonField
          label={t("Room")}
          options={dropdownOptions(options.rooms, "name")}
          value={room || ""}
          proposedVal={match(options.rooms, proposedExam.room_id)}
          aria-label={t("Room comparison")}
        />

        <ComparisonField label={t("Status")} options={[]} value={status || ""} proposedVal={proposedExam.status} aria-label={t("Status comparison")} />
      </section>
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => handleUpdate(true)}
          className="border-2 border-black p-2 rounded hover:bg-slate-400"
          aria-label={t("Accept proposed changes")}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleUpdate(true);
            }
          }}
        >
          {t("Accept")}
        </button>
        <button
          onClick={() => handleUpdate(false)}
          className="border-2 border-black p-2 rounded hover:bg-slate-400"
          aria-label={t("Discard proposed changes")}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleUpdate(false);
            }
          }}
        >
          {t("Discard")}
        </button>
      </div>
    </div>
  );
}

export const match = (arr: any[], val: any): string => {
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

export function generateRow(fieldName: string, previousValue: any, newValue: any = "", includeNewValue: boolean = false): string {
  // "N/A" if values are undefined or null
  const prev = previousValue || "N/A";
  const next = newValue || prev;

  // Bold and highlight in red if there's a change
  const nextText = prev !== next ? `<span style="color: red; font-weight: bold;">${next}</span>` : next;

  return `
    <tr>
      <td style="padding: 8px;">${fieldName}</td>
      <td style="padding: 8px;">${prev}</td>
      ${
        includeNewValue
          ? `<td style="padding: 8px;">${nextText}</td>`
          : ""
      }
    </tr>
  `;
}