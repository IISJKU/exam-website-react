import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";
import Exam from "../../classes/Exam";
import config from "../../../config";

export default function TutorExamRequest() {
  const { id } = useParams();
  const { t } = useTranslation();
  const user = useAuth();
  const userId = user.id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [exam, setExam] = useState<any | null>(null); // Use any type for flexibility
  const [originalExam, setOriginalExam] = useState<Exam>(new Exam());

  // Fetch exam data based on ID from URL
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const examResponse = await fetch(`${config.strapiUrl}/api/exams/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const examData = await examResponse.json();
        if (!examResponse.ok) {
          showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${examResponse.status}, ${t("Message")}: ${examData.error.message || t("Unknown error")}}.`, type: "error"});
          return;
        }

        setExam(examData);
        setOriginalExam(examData);
      } catch (error) {
        showToast({ message: t("Error fetching exam data"), type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [id, user.token]);

  // Handle tutor request to monitor the exam
  const handleRequest = async () => {
    try {
      const response = await fetch(config.strapiUrl +"/api/exams/add-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ examId: id }),
      });
      const data = await response.json();

      if (response.ok) {
        showToast({ message: t("Request to monitor exam submitted successfully"), type: "success" });

        if (exam) {
          /* 
          let notif = new Notification("", JSON.stringify(originalExam), user.user, originalExam.id);
          notif.type = NotificationType.tutorConfirm;
        
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
              message: `HTTP error! Status: ${notify.status}, Message: ${errorData.error.message || "Unknown error"}.`,
              type: "error",
            });
            return;
          } */
        }
      } else {
        showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${data.error.message || t("Unknown error")}}.`, type: "error"});
      }
    } catch (error) {
      showToast({ message: t("Error submitting request to monitor exam"), type: "error" });
    } finally {
      navigate("/tutor/exams/without-tutor");
    }
  };

  if (loading)
    return (
      <p aria-live="polite" aria-busy="true">
        {t("Loading exam data...")}
      </p>
    );

  if (!exam)
    return (
      <p aria-live="polite" aria-busy="true">
        {t("No exam details found.")}
      </p>
    );

  return (
    <div className="m-5" aria-labelledby="tutor-request-heading" role="form">
      <h2 id="tutor-request-heading" className="text-2xl font-bold mb-4">
        {t("Exam Details")}
      </h2>
      <dl>
        <div>
          <dt>
            <strong>{t("Exam Title")}:</strong>
          </dt>
          <dd>{exam.title}</dd>
        </div>
        <div>
          <dt>
            <strong>{t("LVA Num")}:</strong>
          </dt>
          <dd>{exam.lva_num}</dd>
        </div>
        <div>
          <dt>
            <strong>{t("Date")}:</strong>
          </dt>
          <dd>{moment(exam.date).format("DD.MM.YYYY HH:mm")}</dd>
        </div>
        <div>
          <dt>
            <strong>{t("Duration")}:</strong>
          </dt>
          <dd>
            {exam.duration} {t("minutes")}
          </dd>
        </div>
        <div>
          <dt>
            <strong>{t("Student")}:</strong>
          </dt>
          <dd>{exam.student && typeof exam.student === "object" ? `${exam.student.first_name} ${exam.student.last_name}` : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt>
            <strong>{t("Examiner")}:</strong>
          </dt>
          <dd>{exam.examiner && typeof exam.examiner === "object" ? `${exam.examiner.first_name} ${exam.examiner.last_name}` : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt>
            <strong>{t("Major")}:</strong>
          </dt>
          <dd>{exam.major && typeof exam.major === "object" ? exam.major.name : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt>
            <strong>{t("Institute")}:</strong>
          </dt>
          <dd>{exam.institute && typeof exam.institute === "object" ? exam.institute.name : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt>
            <strong>{t("Room")}:</strong>
          </dt>
          <dd>{exam.room && typeof exam.room === "object" ? exam.room.name : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt>
            <strong>{t("Mode")}:</strong>
          </dt>
          <dd>{exam.exam_mode && typeof exam.exam_mode === "object" ? exam.exam_mode.name : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt>
            <strong>{t("Notes")}:</strong>
          </dt>
          <dd>{exam.notes}</dd>
        </div>
      </dl>
      {/* Request to Monitor Button */}
      <button
        onClick={handleRequest}
        className="mt-4 border-2 border-blue-500 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={t("Request to Monitor Exam")}
      >
        {t("Request to Monitor")}
      </button>
    </div>
  );
}
