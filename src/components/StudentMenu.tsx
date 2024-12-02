import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // For navigation
import StudentCalender from "./StudentCalendar";
import NotificationButton from "./NotificationButton";

export default function StudentMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // React Router hook for navigation

  return (
    <div className="p-5 text-xl h-full w-full bg-slate-200">
      <NotificationButton path="student/notifications" />
      {/* Exams Overview Button */}
      <button
        onClick={() => {
          navigate("student/all-exams");
        }}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Exams Overview")}
      </button>
      <button
        onClick={() => {
          navigate("student/request-exam");
        }}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Request New Exam")}
      </button>

      <StudentCalender />
    </div>
  );
}
