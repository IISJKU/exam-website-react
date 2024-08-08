import { useState } from "react";
import ExamView from "./views/ExamView";
import IndividualTutor from "./views/IndividualTutor";
import StudentView from "./views/StudentView";
import TutorView from "./views/TutorView";
import Tutor from "../classes/Tutor";
import CalendarWeek from "./views/CalendarWeek";

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
}

export default function InfoBox(props: InfoBoxProps) {
  const [tutor, setTutor] = useState<Tutor>(new Tutor());

  function tutorView(newTutor: Tutor) {
    setTutor(newTutor);
    props.switchView(InfoBoxView.IndividualTutor);
  }

  switch (props.state) {
    case InfoBoxView.Exams:
      return <ExamView />;
    case InfoBoxView.Students:
      return <StudentView />;
    case InfoBoxView.Tutors:
      return <TutorView callback={tutorView} />;
    case InfoBoxView.IndividualTutor:
      return <IndividualTutor tutor={tutor} />;
    case InfoBoxView.CalendarBig:
      return <CalendarWeek date={props.selectedDate} />;
    default:
      return <ExamView />;
  }
}
