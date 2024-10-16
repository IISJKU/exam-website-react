import Exam from "../../classes/Exam";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useEffect, useState } from "react";

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
    "exam_mode",
    "student",
    "examiner",
    "institute",
    "duration", // "should be changed to status"
    "student_misc",
  ];

  const [exams, setExams] = useState([]);

  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
const fetchExams = async () => {
  try {
    const response = await fetch("http://localhost:1337/api/exams");
    const data = await response.json();

    // Modify the data array before setting it to exams
    const updatedData = data.map((exam: any) => {
      // Create a copy of the exam object to modify
      let updatedExam = { ...exam };

      // Check if exam has a student and matrikel_number, and update it if needed
      if (exam.student && exam.student.matrikel_number) {
        updatedExam.student = exam.student.matrikel_number; // Set student to matrikel_number
      }

      // Check if exam has a tutor and update it to contain first and last name
      if (exam.tutor && exam.tutor.first_name && exam.tutor.last_name) {
        updatedExam.tutor = [exam.tutor.first_name, exam.tutor.last_name]; // Set tutor to first and last name
      }

      // Check if exam has an examiner and update it to contain first and last name
      if (exam.examiner && exam.examiner.first_name && exam.examiner.last_name) {
        updatedExam.examiner = [exam.examiner.first_name, exam.examiner.last_name]; // Set examiner to first and last name
      }

      // Check if exam_mode exists and update its name
      if (exam.exam_mode && exam.exam_mode.name) {
        updatedExam.exam_mode = exam.exam_mode.name; // Set exam_mode to its name
      }

      // Check if institute exists and update its abbreviation
      if (exam.institute && exam.institute.abbreviation) {
        updatedExam.institute = exam.institute.abbreviation; // Set institute to its abbreviation
      }

      // Return the modified exam object
      return updatedExam;
    });

    // Set the updated data
    setExams(updatedData);
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
      data={exams} // Pass the fetched and updated exam data here
    />
  );
}