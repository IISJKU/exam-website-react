import { useState, useEffect } from "react";
import { useParams , useNavigate} from "react-router-dom";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";
import Exam from "../../classes/Exam";

export default function RemoveTutor() {
  const { id } = useParams();
  const { t } = useTranslation();
  const user = useAuth();
  const navigate = useNavigate();
  const userId = user.userId;
  const [loading, setLoading] = useState<boolean>(true);
  const [exam, setExam] = useState<any | null>(null); // Use any type for flexibility
  const [originalExam, setOriginalExam] = useState<Exam>(new Exam());
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false); // State for dialog visibility

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

  function examChanged() {
    let t = "";

    if (exam != null) {
      t = t + ' "title" : "' + exam.title + '",';
      t = t + ' "lva_num" : "' + exam.lva_num + '",';
      t = t + ' "date" : "' + exam.date + '",';
      t = t + ' "duration" : "' + exam.duration + '",';
      t = t + ' "status" : "' + exam.status + '",';

      t = t + ' "student_id" : "' + exam.student.id + '",';
      t = t + ' "tutor_id" : "' + exam.tutor.id + '",';
      exam.room ? (t = t + ' "room_id" : "' + exam.room.id + '",') : (t = t);
      t = t + ' "examiner_id" : "' + exam.examiner.id + '",';
      t = t + ' "major_id" : "' + exam.major.id + '",';
      t = t + ' "institute_id" : "' + exam.institute.id + '",';
      t = t + ' "exam_mode" : "' + exam.exam_mode.id + '",';
    }

    if (t != "") {
      t = t.substring(0, t.length - 1);
      t = "{" + t + "}";
    }
    return t;
  }

  // Handle tutor request to monitor the exam
  const handleRemove = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/exams/remove-tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ examId: id }),
      });
      const data = await response.json();

      if (response.ok) {
        showToast({ message: "Remove exam from monitoring submitted successfully", type: "success" });

        let change = examChanged();

        if (change != "" && exam) {
          let notif = new Notification(change, JSON.stringify(originalExam), user.user, exam.id);
          notif.type = NotificationType.tutorDecline;

          const notify = await fetch(`http://localhost:1337/api/notifications`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
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
      showToast({ message: "Error submitting request to remove monitoring exam", type: "error" });
    } finally {
      setShowConfirmDialog(false); // Close dialog after action
      navigate("/tutor/upcoming-exams");
    }
  };

  if (loading) return <p aria-live="polite" aria-busy="true">{t("Loading exam data...")}</p>;
  if (!exam) return <p>{t("No exam details found.")}</p>;

  return (
    <div className="m-5" role="main" aria-labelledby="exam-details-heading">
      <h2 id="exam-details-heading" className="text-2xl font-bold mb-4">{t("Exam Details")}</h2>
      <dl>
        <div>
          <dt><strong>{t("Exam Title")}:</strong></dt>
          <dd>{exam.title}</dd>
        </div>
        <div>
          <dt><strong>{t("LVA Num")}:</strong></dt>
          <dd>{exam.lva_num}</dd>
        </div>
        <div>
          <dt><strong>{t("Date")}:</strong></dt>
          <dd>{moment(exam.date).format("DD.MM.YYYY HH:mm")}</dd>
        </div>
        <div>
          <dt><strong>{t("Duration")}:</strong></dt>
          <dd>{exam.duration} {t("minutes")}</dd>
        </div>
        <div>
          <dt><strong>{t("Student")}:</strong></dt>
          <dd>{exam.student && typeof exam.student === "object" ? `${exam.student.first_name} ${exam.student.last_name}` : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt><strong>{t("Examiner")}:</strong></dt>
          <dd>{exam.examiner && typeof exam.examiner === "object" ? `${exam.examiner.first_name} ${exam.examiner.last_name}` : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt><strong>{t("Major")}:</strong></dt>
          <dd>{exam.major && typeof exam.major === "object" ? exam.major.name : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt><strong>{t("Institute")}:</strong></dt>
          <dd>{exam.institute && typeof exam.institute === "object" ? exam.institute.name : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt><strong>{t("Room")}:</strong></dt>
          <dd>{exam.room && typeof exam.room === "object" ? exam.room.name : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt><strong>{t("Mode")}:</strong></dt>
          <dd>{exam.exam_mode && typeof exam.exam_mode === "object" ? exam.exam_mode.name : t("Not Assigned")}</dd>
        </div>
        <div>
          <dt><strong>{t("Status")}:</strong></dt>
          <dd>{exam.status}</dd>
        </div>
      </dl>
      <div className="mt-4 flex space-x-2">
        <button onClick={() => setShowConfirmDialog(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
          aria-haspopup="dialog"
        >
          {t("Remove")}
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-heading"
        >
          <div className="bg-white p-4 rounded shadow-lg max-w-sm">
            <h3 id="confirm-dialog-heading" className="text-lg font-bold mb-4">
              {t("Confirm Removal")}
            </h3>
            <p className="mb-4">{t("Are you sure you want to remove the exam from the monitoring list?")}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="border-2 border-gray-300 bg-gray-200 text-gray-700 py-1 px-3 rounded mr-2 hover:bg-gray-300"
              >
                {t("Cancel")}
              </button>
              <button onClick={handleRemove} className="border-2 border-red-500 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
                {t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
