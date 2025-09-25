import { useState, useEffect, useTransition, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import Exam from "../../classes/Exam";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
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
import config from "../../../config";

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
  const [lva_num, setLvaNum] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [duration, setDuration] = useState<number | undefined>();
  const [tutor, setTutor] = useState<number | undefined>();
  const [student, setStudent] = useState<number | undefined>();
  const [examiner, setExaminer] = useState<number | undefined>();
  const [major, setMajor] = useState<number | undefined>();
  const [institute, setInstitute] = useState<number | undefined>();
  const [mode, setMode] = useState<number | undefined>();
  const [room, setRoom] = useState<number | undefined>();
  const [notes, setNotes] = useState<string>("");

  const user = useAuth();

  const [deleteRequest, setDeleteRequest] = useState<boolean>(false);

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
    if (partial.lva_num != undefined) ex.lva_num = String(partial.lva_num);
    if (partial.notes != undefined) ex.notes = partial.notes;
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
        const response = await fetch(`${config.strapiUrl}/api/notifications`, {
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
              if (element.type == NotificationType.deleteRequest) {
                setDeleteRequest(true);
              }
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
            if (proposedExams[i].information) {
              const examInfo = proposedExams[i].information;
              const parsedExam = JSON.parse(examInfo) as Exam;

              Object.entries(parsedExam).forEach(([key, value]) => {
                // Check if key is a valid property of Exam
                if (value != undefined) {
                  propEx[key as keyof Exam] = value; // Type assertion to keyof Exam
                }
              });
            }
          }

          let converted = convertToExam(propEx);
          setProposedExam(converted);
        } else {
          if (proposedExams[0].information) setProposedExam(JSON.parse(proposedExams[0].information) as Exam);
        }

        const examData = (await fetchAll(config.strapiUrl + "/api/exams", user.token)) as Exam[];

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
            setLvaNum(ex.lva_num ?? "");
            setDate(ex.date);
            setDuration(ex.duration);
            setTutor(ex.tutor_id);
            setStudent(ex.student_id);
            setExaminer(ex.examiner_id);
            setMajor(ex.major_id);
            setInstitute(ex.institute_id);
            setMode(ex.mode_id);
            setRoom(ex.room_id);
            setNotes(ex.notes);
          }
        } else {
          showToast({ message: t("No exam data found"), type: "error" });
        }
      } catch (error) {
        showToast({ message: t("Error fetching Notification"), type: "error" });
      } finally {
        setLoading(false);
      }
    };

    const fetchDropdownOptions = async () => {
      try {
        const [students, tutors, examiners, majors, institutes, modes, rooms] =
          await Promise.all([
            fetchAll(`${config.strapiUrl}/api/students`, user.token, t("HTTP error!")),
            fetchAll(`${config.strapiUrl}/api/tutors`, user.token, t("HTTP error!")),
            fetchAll(`${config.strapiUrl}/api/examiners`, user.token, t("HTTP error!")),
            fetchAll(`${config.strapiUrl}/api/majors`, user.token, t("HTTP error!")),
            fetchAll(`${config.strapiUrl}/api/institutes`, user.token, t("HTTP error!")),
            fetchAll(`${config.strapiUrl}/api/exam-modes`, user.token, t("HTTP error!")),
            fetchAll(`${config.strapiUrl}/api/rooms`, user.token, t("HTTP error!")),
          ]);

        const availableRooms = rooms.filter((r: Room) => r.isAvailable === true);

        setOptions({
          students,
          tutors,
          examiners,
          majors,
          institutes,
          modes,
          rooms: availableRooms,
        });
      } catch (error) {
        showToast({
          message: t("Error fetching dropdown options"),
          type: "error",
        });
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

    if (proposedExam.lva_num == null) proposedExam.lva_num = "";
    proposedExam.lva_num = String(proposedExam.lva_num).trim();

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
      showToast({
        message: `${t("HTTP error!")} ${t("Status")}: ${notify.status}, ${t("Message")}: ${errorData.error.message || t("Unknown error")}}.`,
        type: "error",
      });
      return;
    }
  };

  function generateChangesHtml(currentExam: any, newExam: any, options: any, accept: boolean, emailContent: string): string {
    const isUpdate = currentExam == null ? false : true;
    const current = currentExam != null && newExam.title == undefined ? currentExam : newExam;
    return `
    <h3>${t("Exam Changes")}</h3>
    ${emailContent}
    <table border="1" style="border-collapse: collapse; width: 70%;">
      <thead>
        <tr>
          <th style="padding: 8px; text-align: left;">Field</th>
           ${
             isUpdate
               ? `<th style="padding: 8px; text-align: left;">${t("Old")}</th>
            <th style="padding: 8px; text-align: left;">${t("New")}</th>`
               : `<th style="padding: 8px; text-align: left;">${t("Details")}</th>`
           }
        </tr>
      </thead>
      <tbody>
        ${generateRow(t("Title"), current?.title, newExam.title, isUpdate)}
        ${generateRow(t("LVA Number"), current?.lva_num, newExam.lva_num, isUpdate)}
        ${generateRow(
          t("Date"),
          current?.date ? moment(current.date).format("DD.MM.YYYY HH:mm") : t("N/A"),
          newExam.date ? moment(newExam.date).format("DD.MM.YYYY HH:mm") : moment(current.date).format("DD.MM.YYYY HH:mm"),
          isUpdate
        )}
        ${generateRow(t("Duration"), current?.duration, newExam.duration, isUpdate)}
        ${generateRow(t("Tutor"), match(options.tutors, current?.tutor_id || current?.tutor), match(options.tutors, newExam.tutor_id), isUpdate)}
        ${generateRow(t("Student"), match(options.students, current?.student_id || current?.student), match(options.students, newExam.student_id), isUpdate)}
        ${generateRow(
          t("Examiner"),
          match(options.examiners, current?.examiner_id || current?.examiner),
          match(options.examiners, newExam.examiner_id),
          isUpdate
        )}
        ${generateRow(t("Major"), match(options.majors, current?.major_id || current?.major), match(options.majors, newExam.major_id), isUpdate)}
        ${generateRow(
          t("Institute"),
          match(options.institutes, current?.institute_id || current?.institute),
          match(options.institutes, newExam.institute_id),
          isUpdate
        )}
        ${generateRow(t("Mode"), match(options.modes, current?.mode_id || current?.exam_mode), match(options.modes, newExam.mode_id), isUpdate)}
        ${generateRow(t("Room"), match(options.rooms, current?.room_id || current?.room), match(options.rooms, newExam.room_id), isUpdate)}
        ${generateRow(t("Notes"), current?.notes, newExam.notes, isUpdate)}
        ${generateRow(t("Status"), current?.status, newExam.status, isUpdate)}
      </tbody>
    </table>
    `;
  }

  const handleUpdate = async (accept: boolean) => {
    if (accept) {
      //reset notif, set to passive & apply changes

      if (!deleteRequest)
        try {
          // Check if a new examiner needs to be created
          if (isNewExaminer(proposedExam.examiner) && !proposedExam.examiner_id) {
            const { first_name, last_name, email, phone } = proposedExam.examiner;

            const examinerResponse = await fetch(config.strapiUrl + "/api/examiners", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({
                data: {
                  first_name,
                  last_name,
                  email,
                  phone,
                },
              }),
            });

            if (!examinerResponse.ok) {
              showToast({ message: t("Failed to save new examiner"), type: "error" });
              return;
            }

            const savedExaminer = await examinerResponse.json();
            proposedExam.examiner_id = savedExaminer.data.id; // Link the new examiner ID
            setExaminer(savedExaminer.data.id);
          }
          if (exam != null && exam.id != undefined) {
            const dataToSend = {
              ...proposedExam,
              lva_num: String(proposedExam.lva_num ?? "").trim(),
            };
            const response = await fetch(`${config.strapiUrl}/api/exams/${exam.id}`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
              body: JSON.stringify({ data: dataToSend }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              showToast({
                message: `${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${errorData.error.message || t("Unknown error")}}.`,
                type: "error",
              });
              return;
            }

            showToast({ message: t("Exam updated successfully"), type: "success" });

            sendNotification(accept);
            // Generate changesHtml using the helper function
            const changesHtml = generateChangesHtml(exam, proposedExam, options, accept, `<p>${t("The following changes have been made to the exam")}:</p>`);

            // Send emails to both tutor and student
            const emailPromises = [
              sendEmail({
                to: exam.tutor_email || "",
                subject: t("Exam Update Notification"),
                text: t("The exam has been updated successfully."),
                html: changesHtml,
                token: user.token,
              }),
              sendEmail({
                to: exam.student_email || "",
                subject: t("Exam Update Notification"),
                text: t("The exam has been updated successfully."),
                html: changesHtml,
                token: user.token,
              }),
            ];
            await Promise.all(emailPromises);
          } else {
            fixProposedExam();

            const dataToSend = {
              ...proposedExam,
              lva_num: String(proposedExam.lva_num ?? "").trim(),
            };

            const response = await fetch(`${config.strapiUrl}/api/exams/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${user.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ data: dataToSend }),
            });

            const examResponse = await fetch(`${config.strapiUrl}/api/exams/?sort[0]=id:desc&pagination[start]=0&pagination[limit]=25`, {
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
                  examData[i].duration == proposedExam.duration
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
                const notif = await fetch(`${config.strapiUrl}/api/notifications/${newNotif.id}`, {
                  method: "PUT",
                  headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ data: newNotif }),
                });
              }
            } else {
              showToast({ message: t("New Exam Not Found"), type: "error" });
            }
            const changesHtml = generateChangesHtml(null, proposedExam, options, accept, `<p>${t("The new exam has been accepted")}:</p>`);
            // Send emails to both tutor and student
            const emailPromises = [
              sendEmail({
                to: proposedExam?.tutor_email || "",
                subject: t("Exam Accepted Notification"),
                text: t("The exam has been accepted."),
                html: changesHtml,
                token: user.token,
              }),
              sendEmail({
                to: proposedExam?.student_email || "",
                subject: t("Exam Accepted Notification"),
                text: t("The exam has been accepted."),
                html: changesHtml,
                token: user.token,
              }),
            ];
            await Promise.all(emailPromises);
            sendNotification(accept);
          }
        } catch (error) {
          showToast({ message: t("Error updating exam"), type: "error" });
        }
      else {
        console.log(exam?.id);
        if (exam)
          try {
            const response = await fetch(config.strapiUrl + "/api/exams/" + exam.id, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            });
          } catch {}
      }
    } else {
      const availableExam = proposedExam.title == undefined ? exam : proposedExam;
      //set notif to passive, discard changes
      if (notification && (exam == null || exam.id == undefined || exam.id == 0)) {
        const notif = await fetch(`${config.strapiUrl}/api/notifications/${notification.id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        });

        sendNotification(false);
        const changesHtml = generateChangesHtml(
          null,
          availableExam,
          options,
          accept,
          `<p>${t("We regret to inform you that the proposed exam has been <strong>declined</strong>. Below are the details of the declined exam:")}:</p>`
        );
        // Send emails to both tutor and student
        const emailPromises = [
          sendEmail({
            to: availableExam?.tutor_email || "",
            subject: t("Exam Decline Notification"),
            text: t("The exam has been declined."),
            html: changesHtml,
            token: user.token,
          }),
          sendEmail({
            to: availableExam?.student_email || "",
            subject: t("Exam Decline Notification"),
            text: t("The exam has been declined."),
            html: changesHtml,
            token: user.token,
          }),
        ];
        await Promise.all(emailPromises);
      } else {
        sendNotification(false);
        const changesHtml = generateChangesHtml(
          null,
          availableExam,
          options,
          accept,
          `<p>${t(
            "We regret to inform you that the proposed exam changes has been <strong>declined</strong>. Below are the current details of the exam:"
          )}:</p>`
        );
        // Send emails to both tutor and student
        const emailPromises = [
          sendEmail({
            to: availableExam?.tutor_email || "",
            subject: t("Exam Change Decline Notification"),
            text: t("The exam changes has been declined."),
            html: changesHtml,
            token: user.token,
          }),
          sendEmail({
            to: availableExam?.student_email || "",
            subject: t("Exam Change Decline Notification"),
            text: t("The exam changes has been declined."),
            html: changesHtml,
            token: user.token,
          }),
        ];
        await Promise.all(emailPromises);
      }
    }

    navigate("/admin/notifications");
  };

  // Update `proposedExam` with new examiner details.
  const saveUpdatedExaminer = (updatedExaminer: { firstName: string; lastName: string; email: string; phone: string }) => {
    const newExaminer = new Examiner();
    newExaminer.id = proposedExam.examiner_id || 0; // Default ID
    newExaminer.first_name = updatedExaminer.firstName;
    newExaminer.last_name = updatedExaminer.lastName;
    newExaminer.email = updatedExaminer.email;
    newExaminer.phone = updatedExaminer.phone;
    newExaminer.exams = []; // Default empty array

    setProposedExam((prev) => ({
      ...prev,
      examiner: newExaminer, // Proper instance of Examiner
    }));
  };

  function isNewExaminer(obj: number | Examiner): obj is Examiner {
    return typeof obj === "object" && obj !== null && "first_name" in obj && "last_name" in obj;
  }

  const dropdownOptions = (list: any[], firstNameField: string, lastNameField?: string) =>
    list.map((item: any) => ({
      value: item.id,
      label: lastNameField
        ? `${item[firstNameField]} ${item[lastNameField]}` // Concatenate first and last name
        : item[firstNameField], // For fields with just one field (like 'name' for institutes or majors)
    }));

  function doesNameExistInDropdown(obj: Examiner): Examiner | null {
    const matchingExaminer = options.examiners.find(
      (examiner) => examiner.first_name.toLowerCase() === obj.first_name.toLowerCase() && examiner.last_name.toLowerCase() === obj.last_name.toLowerCase()
    );
    return matchingExaminer ?? null; // Return null if undefined
  }

  function examinerCheck(proposedExam: Exam): string | { first_name: string; last_name: string; email: string; phone: string } {
    if (isNewExaminer(proposedExam.examiner)) {
      const matchingExaminer = doesNameExistInDropdown(proposedExam.examiner as Examiner);
      if (matchingExaminer) {
        // Return the name of the existing examiner
        return match(options.examiners, matchingExaminer.id);
      }
      // Return the full name of the new examiner
      return proposedExam.examiner;
    }
    // Fallback: Return the name of the examiner by ID if it's not a new examiner
    return match(options.examiners, proposedExam.examiner_id);
  }

  return (
    <div className="m-5" role="main" aria-labelledby="notification-heading">
      <h1 id="notification-heading" className="text-4xl font-bold">
        {!deleteRequest ? t("Proposed Changes") : t("Student wants to delete this exam") + "⚠️"}
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
          value={lva_num || ""}
          proposedVal={proposedExam.lva_num ? String(proposedExam.lva_num) : ""}
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
          label={t("Student")}
          options={dropdownOptions(options.students, "first_name", "last_name")}
          value={student || ""}
          proposedVal={match(options.students, proposedExam.student_id)}
          aria-label={t("Student comparison")}
        />

        <ComparisonField
          label={t("Tutor")}
          options={dropdownOptions(options.tutors, "first_name", "last_name")}
          value={tutor || ""}
          proposedVal={match(options.tutors, proposedExam.tutor_id)}
          aria-label={t("Tutor comparison")}
        />

        <ComparisonField
          label={t("Examiner")}
          options={dropdownOptions(options.examiners, "first_name", "last_name")}
          value={examiner || ""}
          proposedVal={examinerCheck(proposedExam)}
          onUpdateExaminer={saveUpdatedExaminer}
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

        <ComparisonField label={t("Notes")} options={[]} value={notes || ""} proposedVal={proposedExam.notes} aria-label={t("Notes comparison")} />
      </section>
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => handleUpdate(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
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
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700"
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
      ${includeNewValue ? `<td style="padding: 8px;">${nextText}</td>` : ""}
    </tr>
  `;
}
