import { useState } from "react";
import examData from "../../../TestData/Exams.json";
import ExamDate from "../components/ExamDate";
import SearchBar from "../components/SearchBar";
import Exam from "../../classes/Exam";

import ContentView from "./ContentView";

interface ExamViewProps {
  callback: Function;
}

export default function ExamView(props: ExamViewProps) {
  const [filteredExams, setExams] = useState<Exam[]>(examData);
  const fields = ["Exam Name", "Date", "Student", "Tutor", "Topic", "Course"];
  const keys: (keyof Exam)[] = ["name", "date", "students", "tutor", "subject", "course"];

  return <ContentView title={"Upcoming Exams"} callback={props.callback} fields={fields} keys={keys} data={examData} />;
}
