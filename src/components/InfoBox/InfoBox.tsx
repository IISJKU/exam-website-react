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

  // Switch statement would be replaced with routes, but for example:
  return (
    <>
      {/* These would normally be routes */}
      <ExamView />
      <StudentView  />
      <TutorView  />
      {/* ... other views */}
    </>
  );
}
