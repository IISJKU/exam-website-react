import ExamView from "./views/ExamView";
import StudentView from "./views/StudentView";
import TutorView from "./views/TutorView";
import { useTranslation } from "react-i18next";

export enum InfoBoxView {
  Exams,
  CalendarBig,
  Students,
  Tutors,
  IndividualTutor,
  IndividualStudent,
  ExamEditor,
  DataAdmin,
}

export default function InfoBox({ selectedDate }: { selectedDate?: Date }) {
  const { t } = useTranslation();
  return (
    <div role="region" aria-label={t("Main Information Box")}>
    {/* Exam View Section */}
    <section aria-label={t("Exam View")} className="info-box-section">
      <ExamView />
    </section>

    {/* Student View Section */}
    <section aria-label={t("Student View")} className="info-box-section">
      <StudentView />
    </section>

    {/* Tutor View Section */}
    <section aria-label={t("Tutor View")} className="info-box-section">
      <TutorView />
    </section>

  </div>
  );
}
