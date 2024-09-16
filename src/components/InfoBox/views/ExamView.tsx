import { useEffect, useState } from "react";
//import examData from "../../../TestData/Exams.json";
import ExamDate from "../components/ExamDate";
import SearchBar from "../components/SearchBar";
import Exam from "../../classes/Exam";

import ContentView from "./ContentView";

interface ExamViewProps {
  callback: Function;
}

export default function ExamView(props: ExamViewProps) {
  //const [filteredExams, setExams] = useState<Exam[]>(examData);
  const fields = [
    "Exam Title",
    "LVA Nr.",
    "Date/Time",
    "Duration",
    "Mode",
    "Student",
    "Examiner",
    "Institute",
    "Status",
    "Student Misc",
  ];
  const keys: (keyof Exam)[] = [
    "title",
    "lva_num",
    "date",
    "duration",
    "mode",
    "student",
    "examiner",
    "institute",
    "student_misc", // "should be changed to status"
    "student_misc",
  ];

  let allExams: Exam[] = [];
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/exams");
      const data = await response.json();
      setExams(data["data"]); // Update state with fetched students
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  exams.forEach((element) => {
    allExams.push(element["attributes"]);
  });

  if (loading) {
    return <p>Loading students...</p>; // Display loading indicator while fetching
  }

  return (
    <ContentView
      title={"Upcoming Exams"}
      callback={props.callback}
      fields={fields}
      keys={keys}
      data={allExams}
    />
  );
}
