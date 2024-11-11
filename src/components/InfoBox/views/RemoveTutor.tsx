import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";
import Exam from "../../classes/Exam";
import { useNavigate } from "react-router-dom";

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
      t = t + ' "room_id" : "' + exam.room.id + '",';
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
      showToast({ message: "Error submitting request to remove monitoring exam", type: "error" });
    } finally {
      setShowConfirmDialog(false); // Close dialog after action
      navigate("/tutor/upcoming-exams");
    }
  };

  if (loading) return <p>Loading exam data...</p>;

  if (!exam) return <p>No exam details found.</p>;

  return (
    <div className="m-5">
      <h2 className="text-2xl font-bold mb-4">{t("Exam Details")}</h2>

      {/* Display Exam Details in Read-Only Format */}
      <p><strong>{t("Exam Title")}:</strong> {exam.title}</p>
      <p><strong>{t("LVA Num")}:</strong> {exam.lva_num}</p>
      <p><strong>{t("Date")}:</strong> {moment(exam.date).format("DD.MM.YYYY HH:mm")}</p>
      <p><strong>{t("Duration")}:</strong> {exam.duration} {t("minutes")}</p>
      
      <p><strong>{t("Student")}:</strong> {exam.student && typeof exam.student === "object" ? `${exam.student.first_name} ${exam.student.last_name}` : t("Not Assigned")}</p>
      <p><strong>{t("Examiner")}:</strong> {exam.examiner && typeof exam.examiner === "object" ? `${exam.examiner.first_name} ${exam.examiner.last_name}` : t("Not Assigned")}</p>
      
      <p><strong>{t("Major")}:</strong> {exam.major && typeof exam.major === "object" ? exam.major.name : t("Not Assigned")}</p>
      <p><strong>{t("Institute")}:</strong> {exam.institute && typeof exam.institute === "object" ? exam.institute.name : t("Not Assigned")}</p>
      <p><strong>{t("Room")}:</strong> {exam.room && typeof exam.room === "object" ? exam.room.name : t("Not Assigned")}</p>
      <p><strong>{t("Mode")}:</strong> {exam.exam_mode && typeof exam.exam_mode === "object" ? exam.exam_mode.name : t("Not Assigned")}</p>
      <p><strong>{t("Status")}:</strong> {exam.status}</p>

      {/* Remove Tutor Button */}
      <button
        onClick={() => setShowConfirmDialog(true)}
        className="mt-4 border-2 border-blue-500 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        {t("Remove")}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-sm">
            <p className="mb-4">{t("Are you sure you want to remove the exam from the monitoring list?")}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="border-2 border-gray-300 bg-gray-200 text-gray-700 py-1 px-3 rounded mr-2 hover:bg-gray-300"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleRemove}
                className="border-2 border-red-500 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
              >
                {t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
