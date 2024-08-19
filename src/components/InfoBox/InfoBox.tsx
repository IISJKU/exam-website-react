import { useState } from "react";
import ExamView from "./views/ExamView";
import IndividualTutor from "./views/IndividualTutor";
import StudentView from "./views/StudentView";
import TutorView from "./views/TutorView";
import Tutor from "../classes/Tutor";
import CalendarWeek from "./views/CalendarWeek";
import BigCalendar from "./views/BigCalendar";

import ExamEditor from "./views/ExamEditor";

import { Event } from "react-big-calendar";

interface InfoBoxProps {
  state: InfoBoxView;
  switchView: Function;
  selectedDate?: Date;
  event?: Event;
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
      return <BigCalendar date={props.selectedDate} callback={props.switchView} />;
    case InfoBoxView.ExamEditor:
      return <ExamEditor event={props.event} />;
    default:
      return <ExamView />;
  }
}
