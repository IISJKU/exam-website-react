import { useState } from "react"; 
import ExamView from "./views/ExamView";
import IndividualTutor from "./views/IndividualTutor";
import StudentView from "./views/StudentView";
import TutorView from "./views/TutorView";
import Tutor from "../classes/Tutor";
import BigCalendar from "./views/BigCalendar";
import ExamEditor from "./views/ExamEditor";
import Exam from "../classes/Exam";
import IndividualStudent from "./views/IndividualStudentView";
import Student from "../classes/Student";
import DataAdministration from "./views/DataAdministration"; 

interface InfoBoxProps {
  state: InfoBoxView;
  switchView: Function;
  selectedDate?: Date;
}

export enum InfoBoxView {
  Exams,
  CalendarBig,
  Students,
  Tutors,
  IndividualTutor,
  IndividualStudent,
  ExamEditor,
  DataAdmin,  // Add the DataAdmin view here
}

export default function InfoBox(props: InfoBoxProps) {
  const [tutor, setTutor] = useState<Tutor>(new Tutor());
  const [student, setStudent] = useState<Student>(new Student());
  const [exam, setExam] = useState<Exam>(new Exam());

  function tutorView(newTutor: Tutor) {
    setTutor(newTutor);
    props.switchView(InfoBoxView.IndividualTutor);
  }

  function studentView(student: Student) {
    setStudent(student);
    props.switchView(InfoBoxView.IndividualStudent);
  }

  function examView(exam: Exam) {
    setExam(exam);
    props.switchView(InfoBoxView.ExamEditor);
  }

  switch (props.state) {
    case InfoBoxView.Exams:
      return <ExamView callback={examView} />;
    case InfoBoxView.Students:
      return <StudentView callback={studentView} />;
    case InfoBoxView.Tutors:
      return <TutorView callback={tutorView} />;
    case InfoBoxView.IndividualTutor:
      return <IndividualTutor tutor={tutor} />;
    case InfoBoxView.CalendarBig:
      return <BigCalendar date={props.selectedDate} callback={examView} />;
    case InfoBoxView.ExamEditor:
      return <ExamEditor exam={exam} />;
    case InfoBoxView.IndividualStudent:
      return <IndividualStudent student={student} />;
    case InfoBoxView.DataAdmin:
      return <DataAdministration tableName="students" selectedFields={["first_name", "last_name", "email", "matrikel_number", "phone", "emergency_contact", "bonus_time", "misc"]} populateFields={[
        { name: "major", endpoint: "majors" }, // Relational field 
      ]} />
    default:
      return <ExamView callback={examView} />;
  }
}
