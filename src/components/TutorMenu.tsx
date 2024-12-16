import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom"; // For navigation
import TutorCalendar from "./TutorCalendar";
import Calendar from "./Calendar";
import NotificationButton from "./NotificationButton";

export default function TutorMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // React Router hook for navigation
  const location = useLocation();

  return (
    <nav className="p-5 text-xl h-full w-full bg-slate-200" role="navigation" aria-label={t("Side Menu")}>
      {/* Exams Overview Button */}
      <NotificationButton path="tutor/notifications" />
      <button
        onClick={() => navigate("tutor/exams")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "tutor/exams" ? "page" : undefined}
        aria-label={t("Go to Exam Overview")}
      >
        {t("Exams Overview")}
      </button>
      <button
        onClick={() => navigate("tutor/upcoming-exams")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "tutor/upcoming-exams" ? "page" : undefined}
        aria-label={t("Go to Upcoming Monitored Exams")}
      >
        {t("Upcoming Monitored Exams")}
      </button>
      <button
        onClick={() => navigate("tutor/exams/without-tutor")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "tutor/exams/without-tutor" ? "page" : undefined}
        aria-label={t("Go to Request Exam Monitoring")}
      >
        {t("Request Exam Monitoring")}
      </button>
      <section role="region" aria-label={t("Calendar")}>
        <Calendar />
      </section>
    </nav>
  );
}
