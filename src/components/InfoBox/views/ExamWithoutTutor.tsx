import Exam from "../../classes/Exam";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";

export default function ExamWithoutTutor() {
  const navigate = useNavigate(); // Initialize navigate
  const user = useAuth();

  const [exams, setExams] = useState([]); // Store exams
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileView, setIsMobileView] = useState<boolean>(false); // Track mobile view

  // Determine fields and keys dynamically based on screen size
  const fields = isMobileView
    ? ["Exam Title", "Date/Time"] // Shortened fields for mobile
    : ["Exam Title", "LVA Nr.", "Date/Time", "Duration", "Mode", "Student", "Examiner", "Institute", "Notes", "Student Misc"];

  const keys: (keyof Exam)[] = isMobileView
    ? ["title", "date"] // Shortened keys for mobile
    : ["title", "lva_num", "date", "duration", "exam_mode", "student", "examiner", "institute", "notes", "student_misc"];
  
  // Update `isMobileView` based on window width
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768); // Use a breakpoint (e.g., 768px for small screens)
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize); // Add listener on resize

    return () => window.removeEventListener("resize", handleResize); // Cleanup listener
  }, []);
  
  // Fetch data from Strapi API
  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/exams/without-tutor", {
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
    navigate(`/tutor/exams/monitor-request/${examId}`); // Navigate to ExamEditor with the exam ID
  };

  if (loading) {
    return <p aria-live="polite" aria-busy="true">Loading exams...</p>; // Display loading indicator while fetching
  }

  return (
    <ContentView
      title={"Request Exam Monitoring"}
      onRowClick={handleExamClick} 
      fields={fields}
      keys={keys}
      buttonName={user.role === "Tutor" ? "Request" : "Edit"}
      data={exams} // Pass the fetched and updated exam data here
    />
  );
}
