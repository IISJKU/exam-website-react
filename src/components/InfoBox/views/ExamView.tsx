import Exam from "../../classes/Exam";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";

export default function ExamView() {
  const navigate = useNavigate(); // Initialize navigate
  const fields = ["Exam Title", "LVA Nr.", "Date/Time", "Duration", "Mode", "Student", "Examiner", "Institute", "Status", "Student Misc"];

  const keys: (keyof Exam)[] = ["title", "lva_num", "date", "duration", "exam_mode", "student", "examiner", "institute", "status", "student_misc"];

  const [exams, setExams] = useState([]); // Store exams
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  const user = useAuth();

  // Fetch data from Strapi API
  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/exams", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
       showToast({ message: `HTTP error! Status: ${response.status}, Message: ${data.error.message || "Unknown error"}.`, type: "error", });
      }

      // Modify the data array before setting it to exams
      const updatedData = data.map((exam: any) => {
        let updatedExam = { ...exam };

        // Update student to matrikel_number if exists
        if (exam.student?.matrikel_number) {
          updatedExam.student = exam.student.matrikel_number;
        }

        // Update tutor to first and last name if exists
        if (exam.tutor?.first_name && exam.tutor?.last_name) {
          updatedExam.tutor = `${exam.tutor.first_name} ${exam.tutor.last_name}`;
        }

        // Update examiner to first and last name if exists
        if (exam.examiner?.first_name && exam.examiner?.last_name) {
          updatedExam.examiner = `${exam.examiner.first_name} ${exam.examiner.last_name}`;
        }

        // Update exam_mode name
        if (exam.exam_mode?.name) {
          updatedExam.exam_mode = exam.exam_mode.name;
        }

        // Update institute abbreviation
        if (exam.institute?.abbreviation) {
          updatedExam.institute = exam.institute.abbreviation;
        }

        return updatedExam;
      });

      setExams(updatedData); // Set the updated data to exams
    } catch (error) {
      showToast({ message: `Error fetching exams: ${error}.`, type: "error" });
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleExamClick = (examId: number) => {
    navigate(`/admin/exams/${examId}`); // Navigate to ExamEditor with the exam ID
  };

  if (loading) {
    return <p>Loading exams...</p>; // Display loading indicator while fetching
  }

  return (
    <ContentView
      title={"Upcoming Exams"}
      onRowClick={handleExamClick} // Pass the click handler for navigation
      fields={fields}
      keys={keys}
      data={exams} // Pass the fetched and updated exam data here
    />
  );
}
