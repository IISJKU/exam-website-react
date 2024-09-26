import { useEffect, useState } from "react";
import ExamDate from "../components/ExamDate";
import SearchBar from "../components/SearchBar";
import Exam from "../../classes/Exam";

import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";

interface ExamViewProps {
  callback: Function;
}

export default function ExamView(props: ExamViewProps) {
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
    "status", // "should be changed to status"
    "student_misc",
  ];

  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/exams");
      const data = await response.json();
      setExams(data["data"].map((exam: any) => exam.attributes)); // Map to attributes
    } catch (error) {
      showToast({ message: `Error fetching exams: ${error}.`, type: 'error' });
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  if (loading) {
    return <p>Loading exams...</p>; // Display loading indicator while fetching
  }

  return (
    <ContentView
      title={"Upcoming Exams"}
      callback={props.callback}
      fields={fields}
      keys={keys}
      data={exams}
    />
  );
}
