import { useState } from "react";
import ExamView from "./views/ExamView";
import IndividualTutor from "./views/IndividualTutor";
import StudentView from "./views/StudentView";
import TutorView from "./views/TutorView";
import Tutor from "../classes/Tutor";
import CalendarWeek from "./views/CalendarWeek";
import BigCalendar from "./views/BigCalendar";

import ExamEditor from "./views/ExamEditor";

import Exam from "../classes/Exam";
import IndividualStudent from "./views/IndividualStudentView";
import Student from "../classes/Student";

interface InfoBoxProps {
  state: InfoBoxView;
  switchView: Function;
  selectedDate?: Date;
  exam?: Exam;
}

export enum InfoBoxView {
  Exams,
  CalendarBig,
  Students,
  Tutors,
  IndividualTutor,
  IndividualStudent,
  ExamEditor,
}

export default function InfoBox(props: InfoBoxProps) {
  const [tutor, setTutor] = useState<Tutor>(new Tutor());

  const [student, setStudent] = useState<Student>(new Student());

  function tutorView(newTutor: Tutor) {
    setTutor(newTutor);
    props.switchView(InfoBoxView.IndividualTutor);
  }

  function studentView(student: Student) {
    setStudent(student);
    props.switchView(InfoBoxView.IndividualStudent);
  }

  switch (props.state) {
    case InfoBoxView.Exams:
      return <ExamView />;
    case InfoBoxView.Students:
      return <StudentView callback={studentView} />;
    case InfoBoxView.Tutors:
      return <TutorView callback={tutorView} />;
    case InfoBoxView.IndividualTutor:
      return <IndividualTutor tutor={tutor} />;
    case InfoBoxView.CalendarBig:
      return <BigCalendar date={props.selectedDate} callback={props.switchView} />;
    case InfoBoxView.ExamEditor:
      return <ExamEditor exam={props.exam} />;
    case InfoBoxView.IndividualStudent:
      return <IndividualStudent student={student} />;
    default:
      return <ExamView />;
  }
}
