import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../../../hooks/AuthProvider";
import ContentView from "./ContentView";
import Exam from "../../classes/Exam";
import { showToast } from "../components/ToastMessage";
import { useTranslation } from "react-i18next";

export default function StudentExamView() {
  const navigate = useNavigate(); 
  const user = useAuth();
  const studentId = user.userId;
  const { t } = useTranslation(); 

  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [isMobileView, setIsMobileView] = useState<boolean>(false); // Track mobile view

  // Determine fields and keys dynamically based on screen size
  const fields = isMobileView
    ? [t("Exam Title"), t("Date/Time")]
    : [t("Exam Title"), t("LVA Nr."), t("Date/Time"), t("Duration"), t("Mode"), t("Examiner"), t("Institute"), t("Notes")];

  const keys: (keyof Exam)[] = isMobileView
    ? ["title", "date"] // Shortened keys for mobile
    : ["title", "lva_num", "date", "duration", "exam_mode", "examiner", "institute", "notes"];

  // Update `isMobileView` based on window width
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768); // Use a breakpoint (e.g., 768px for small screens)
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize); 

    return () => window.removeEventListener("resize", handleResize); // Cleanup listener
  }, []);

  // Fetch data from Strapi API
  const fetchStudentExams = async (studentId: number) => {
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
      showToast({ message: `${t("Error fetching exams")}: ${error}.`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentExams(studentId);
  }, [studentId]);

  const handleExamClick = (examId: number) => {
    navigate(`/student/exams/${examId}`);
  };

  if (loading) {
    return <p aria-live="polite" aria-busy="true">{t("Loading exams...")}</p>;
  }

  return (
    <div role="region" aria-label={t("Upcoming Exams")} className="student-exam-view">
      <ContentView
        title={t("Upcoming Exams")}
        onRowClick={handleExamClick} 
        fields={fields} 
        keys={keys} 
        data={exams.map((exam) => ({
          ...exam,
          tabIndex: 0,
          role: "button",
          "aria-label": `${exam.title}, ${t("scheduled for")} ${new Date(exam.date).toLocaleString()}`,
        }))} 
      />
    </div>
  );
}
