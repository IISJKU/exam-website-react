import ExamView from "./views/ExamView";
import StudentView from "./views/StudentView";
import TutorView from "./views/TutorView";

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

  return (
    <div role="region" aria-label="Main Information Box">
    {/* Exam View Section */}
    <section aria-label="Exam View" className="info-box-section">
      <ExamView />
    </section>

    {/* Student View Section */}
    <section aria-label="Student View" className="info-box-section">
      <StudentView />
    </section>

    {/* Tutor View Section */}
    <section aria-label="Tutor View" className="info-box-section">
      <TutorView />
    </section>

  </div>
  );
}
