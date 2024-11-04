import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // For navigation
import TutorCalendar from "./TutorCalendar";

export default function TutorMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // React Router hook for navigation

  return (
    <div className="p-5 text-xl h-full w-full bg-slate-200">
      {/* Exams Overview Button */}
      <button
        onClick={() => {
          //navigate("admin/notifications"); 
        }} className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline">
        {t("Notifications")}
      </button>
      <button onClick={() => { navigate("tutor/exams");}}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline" >
        {t("Exams Overview")}
      </button>
      <button onClick={() => { navigate("tutor/upcoming-exams");}}
        className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline" >
        {t("Upcoming Monitored Exams")}
      </button>
      <button
        onClick={() => { navigate("tutor/exams/without-tutor"); }} className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline">
        {t("Request Exam Monitoring")}
      </button>

      <TutorCalendar />
    </div>
  );
}
