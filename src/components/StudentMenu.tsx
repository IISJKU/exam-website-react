import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom"; // For navigation
import Calendar from "./Calendar";
import NotificationButton from "./NotificationButton";

export default function StudentMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // React Router hook for navigation
  const location = useLocation();

  return (
    <nav
      className="p-5 text-xl h-full w-full bg-slate-200 grid grid-flow-col md:grid-flow-row items-center justify-center"
      role="navigation"
      aria-label={t("Side Menu")}
    >
      <NotificationButton path="student/notifications" />
      {/* Exams Overview Button */}
      <button
        onClick={() => navigate("student/all-exams")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "student/all-exams" ? "page" : undefined}
        aria-label={t("Go to Exam Overview")}
      >
        {t("Exams Overview")}
      </button>
      <button
        onClick={() => navigate("student/request-exam")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "student/request-exam" ? "page" : undefined}
        aria-label={t("Go to Request New Exam")}
      >
        {t("Request New Exam")}
      </button>

      <section role="region " className="row-span-6 bg-slate-200 flex items-center justify-center" aria-label={t("Calendar")}>
        <Calendar />
      </section>
    </nav>
  );
}
