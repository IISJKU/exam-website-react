import React, { useEffect, useState } from "react";
import Exam, { ExamStatus } from "../../classes/Exam";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import fetchAll from "./FetchAll";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import config from "../../../config";

export default function ExamView() {
  const navigate = useNavigate(); // Initialize navigate
  const user = useAuth();
  const { t } = useTranslation(); 

  const [exams, setExams] = useState<Exam[]>([]); // Store exams
  const [loading, setLoading] = useState<boolean>(true); 
  const [isMobileView, setIsMobileView] = useState<boolean>(false); // Track mobile view

  // Determine fields and keys dynamically based on screen size
  const fields = isMobileView
  ? [t("Exam Title"), t("Date/Time"), t("Student")]
  : [t("Exam Title"), t("LVA Nr."), t("Date/Time"), t("Duration"), t("Mode"), t("Student"), t("Examiner"), t("Institute"), t("Notes"), t("Student Misc")];

  const keys: (keyof Exam)[] = isMobileView
    ? ["title", "date", "student"] // Shortened keys for mobile
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
      //let data = [];

      const data = (await fetchAll(config.strapiUrl +"/api/exams", user.token, t("Http error!"))) as Exam[];

      // Filter out exams with the archived status
      const nonArchivedExams = data.filter((exam: Exam) => exam.status !== ExamStatus.archived);

      // Modify the data array before setting it to exams
      const updatedData = nonArchivedExams.map((exam: any) => {
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

      setExams(updatedData); 
    } catch (error) {
      showToast({ message: `${t("Error fetching exams")}: ${error}.`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleExamClick = (examId: number) => {
    const routePrefix = user.role === "Tutor" ? "tutor" : "admin";
    navigate(`/${routePrefix}/exams/${examId}`);
  };

  if (loading) {
    return <p aria-live="polite" aria-busy="true">{t("Loading exams...")}</p>; 
  }

  return (
    <ContentView
      title={t("Upcoming Exams")}
      onRowClick={handleExamClick} 
      fields={fields}
      keys={keys}
      buttonName={user.role === "Tutor" ? t("View") : t("Edit")}
      coloring={true}
      data={exams}
    />
  );
}
