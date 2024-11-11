import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";
import Exam from "../../classes/Exam";

export default function TutorExamRequest() {
  const { id } = useParams();
  const { t } = useTranslation();
  const user = useAuth();
  const userId = user.userId;
  const [loading, setLoading] = useState<boolean>(true);
  const [exam, setExam] = useState<any | null>(null); // Use any type for flexibility
  const [originalExam, setOriginalExam] = useState<Exam>(new Exam());

  // Fetch exam data based on ID from URL
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const examResponse = await fetch(`http://localhost:1337/api/exams/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const examData = await examResponse.json();
        if (!examResponse.ok) {
          showToast({ message: `HTTP error! Status: ${examResponse.status}, Message: ${examData.error.message || "Unknown error"}.`, type: "error" });
          return;
        }

        setExam(examData);
        setOriginalExam(examData);
      } catch (error) {
        showToast({ message: "Error fetching exam data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, user.token]);

  // Handle tutor request to monitor the exam
  const handleRequest = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/exams/add-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ examId: id, tutorId: userId }),
      });
      const data = await response.json();

      if (response.ok) {
        showToast({ message: "Request to monitor exam submitted successfully", type: "success" });

        if (exam) {
          let notif = new Notification("", JSON.stringify(originalExam), user.user, originalExam.id);
          notif.type = NotificationType.tutorConfirm;

          const notify = await fetch(`http://localhost:1337/api/notifications`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: notif }),
          });

          if (!notify.ok) {
            const errorData = await response.json();
            showToast({
              message: `HTTP error! Status: ${notify.status}, Message: ${errorData.error.message || "Unknown error"}.`,
              type: "error",
            });
            return;
          }
        }
      } else {
        showToast({
          message: `HTTP error! Status: ${response.status}, Message: ${data.error?.message || "Unknown error"}.`,
          type: "error",
        });
      }
    } catch (error) {
      showToast({ message: "Error submitting request to monitor exam", type: "error" });
    }
  };

  if (loading) return <p>Loading exam data...</p>;

  if (!exam) return <p>No exam details found.</p>;

  return (
    <div className="m-5">
      <h2 className="text-2xl font-bold mb-4">{t("Exam Details")}</h2>

      {/* Display Exam Details in Read-Only Format */}
      <p>
        <strong>{t("Exam Title")}:</strong> {exam.title}
      </p>
      <p>
        <strong>{t("LVA Num")}:</strong> {exam.lva_num}
      </p>
      <p>
        <strong>{t("Date")}:</strong> {moment(exam.date).format("DD.MM.YYYY HH:mm")}
      </p>
      <p>
        <strong>{t("Duration")}:</strong> {exam.duration} {t("minutes")}
      </p>

      {/* Check if student is an object before accessing properties */}
      <p>
        <strong>{t("Student")}:</strong>{" "}
        {exam.student && typeof exam.student === "object" ? `${exam.student.first_name} ${exam.student.last_name}` : t("Not Assigned")}
      </p>

      {/* Check if examiner is an object before accessing properties */}
      <p>
        <strong>{t("Examiner")}:</strong>{" "}
        {exam.examiner && typeof exam.examiner === "object" ? `${exam.examiner.first_name} ${exam.examiner.last_name}` : t("Not Assigned")}
      </p>

      <p>
        <strong>{t("Major")}:</strong> {exam.major && typeof exam.major === "object" ? exam.major.name : t("Not Assigned")}
      </p>
      <p>
        <strong>{t("Institute")}:</strong> {exam.institute && typeof exam.institute === "object" ? exam.institute.name : t("Not Assigned")}
      </p>
      <p>
        <strong>{t("Room")}:</strong> {exam.room && typeof exam.room === "object" ? exam.room.name : t("Not Assigned")}
      </p>
      <p>
        <strong>{t("Mode")}:</strong> {exam.exam_mode && typeof exam.exam_mode === "object" ? exam.exam_mode.name : t("Not Assigned")}
      </p>
      <p>
        <strong>{t("Status")}:</strong> {exam.status}
      </p>

      {/* Request to Monitor Button */}
      <button onClick={handleRequest} className="mt-4 border-2 border-blue-500 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        {t("Request to Monitor")}
      </button>
    </div>
  );
}
