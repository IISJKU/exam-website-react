import Calendar from "./Calendar";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // For navigation

export default function SideMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // React Router hook for navigation

  return (
    <div className="p-5 text-xl h-full w-full bg-slate-200">
      {/* Exams Overview Button */}
      <button
        onClick={() => {
          navigate("admin/notifications"); // Navigate to the exams route
        }}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Notifications")}
      </button>

      {/* Exams Overview Button */}
      <button
        onClick={() => {
          navigate("admin/exams"); // Navigate to the exams route
        }}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Exam Overview")}
      </button>

      {/* Students Button */}
      <button
        onClick={() => {
          navigate("admin/students"); // Navigate to the students route
        }}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Students")}
      </button>

      {/* Tutors Button */}
      <button
        onClick={() => {
          navigate("admin/tutors"); // Navigate to the tutors route
        }}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Tutors")}
      </button>

      {/* Data Administration Button */}
      <button
        onClick={() => {
          navigate("admin/data-administration"); // Navigate to the data administration route
        }}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Data Administration")}
      </button>

      {/* Calendar Component (assuming it has its own logic for navigation) */}
      <Calendar />
    </div>
  );
}
