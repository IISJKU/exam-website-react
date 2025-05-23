import Calendar from "./Calendar";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom"; // For navigation
import NotificationButton from "./NotificationButton";

interface NotificationRefresh {
  onNotificationRefresh: () => void;
}

export default function SideMenu(props: NotificationRefresh) {
  const { t } = useTranslation();
  const navigate = useNavigate(); // React Router hook for navigation
  const location = useLocation();

  return (
    <nav className="p-5 text-xl h-full w-full bg-slate-200 grid grid-flow-col md:grid-flow-row " role="navigation" aria-label={t("Side Menu")}>
      <NotificationButton path="admin/notifications" onRefresh={props.onNotificationRefresh}/>
      {/* Exams Overview Button */}
      <button
        onClick={() => navigate("admin/exams")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "/admin/exams" ? "page" : undefined}
        aria-label={t("Go to Exam Overview")}
      >
        {t("Exam Overview")}
      </button>
      <button
        onClick={() => navigate("admin/archived-exams")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "/admin/archived-exams" ? "page" : undefined}
        aria-label={t("Go to Archived Exam Overview")}
      >
        {t("Archived Exams")}
      </button>

      {/* Students Button */}
      <button
        onClick={() => navigate("admin/students")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "/admin/students" ? "page" : undefined}
        aria-label={t("Go to Students Management")}
      >
        {t("Students")}
      </button>

      {/* Tutors Button */}
      <button
        onClick={() => navigate("admin/tutors")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "/admin/tutors" ? "page" : undefined}
        aria-label={t("Go to Tutors Management")}
      >
        {t("Tutors")}
      </button>

      {/* Data Administration Button */}
      <button
        onClick={() => navigate("admin/data-administration")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "/admin/data-administration" ? "page" : undefined}
        aria-label={t("Go to Data Administration")}
      >
        {t("Data Administration")}
      </button>
      <button
        onClick={() => navigate("admin/room-management")}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-grey my-1 p-1 hover:bg-slate-400 hover:underline"
        aria-current={location.pathname === "/admin/room-management" ? "page" : undefined}
        aria-label={t("Go to Room Management")}
      >
        {t("Room Management")}
      </button>

      {/* Calendar Component */}
      <section className="row-span-6 bg-slate-200 flex items-center justify-center" role="region" aria-label={t("Calendar")}>
        <Calendar />
      </section>
    </nav>
  );
}
