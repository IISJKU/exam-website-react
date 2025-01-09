import Exam from "../../classes/Exam";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";

export default function TutorExamView() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize navigate
  const user = useAuth();
  const tutorId = user.userId;

  const [exams, setExams] = useState([]); // Store exams
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [isMobileView, setIsMobileView] = useState<boolean>(false); // Track mobile view

  // Determine fields and keys dynamically based on screen size
  const fields = isMobileView
    ? [t("Exam Title"), t("Date/Time")]
    : [t("Exam Title"), t("LVA Nr."), t("Date/Time"), t("Duration"), t("Mode"), t("Student"), t("Examiner"), t("Institute"), t("Notes"), t("Student Misc")];

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
  const fetchTutorExams = async (tutorId: number) => {
    try {
      const response = await fetch(`http://localhost:1337/api/exams/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${data.error.message || t("Unknown error")}}.`, type: "error"});
      }

      // Modify the data array before setting it to exams
      const updatedData = data.map((exam: any) => {
        let updatedExam = { ...exam };

        // Update student to matrikel_number if exists
        if (exam.student?.matrikel_number) {
          updatedExam.student = exam.student.matrikel_number;
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

      setExams(updatedData);
    } catch (error) {
      showToast({ message: `${t("Error fetching exams")}: ${error}.`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutorExams(tutorId);
  }, []);

  const handleExamClick = (examId: number) => {
    navigate(`/tutor/remove-tutor/${examId}`); // Navigate to ExamEditor with the exam ID
  };

  if (loading) {
    return <p aria-live="polite" aria-busy="true">{t("Loading exams...")}</p>; 
  }

  return (
    <div role="region" aria-label={t("Tutor's Upcoming Monitored Exams")} className="tutor-exam-view">
      <ContentView
        title={t("Upcoming Monitored Exams")}
        onRowClick={handleExamClick} // Pass the click handler for navigation
        fields={fields}
        keys={keys}
        buttonName={t("Remove")}
        data={exams} 
      />
    </div>
  );
}
