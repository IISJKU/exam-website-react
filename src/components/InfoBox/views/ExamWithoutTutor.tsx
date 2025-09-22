import Exam, { ExamStatus } from "../../classes/Exam";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import config from "../../../config";
import fetchAll from "./FetchAll";

export default function ExamWithoutTutor() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize navigate
  const user = useAuth();

  const [exams, setExams] = useState<Exam[]>([]); // Store exams
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobileView, setIsMobileView] = useState<boolean>(false); // Track mobile view

  // Determine fields and keys dynamically based on screen size
  const fields = isMobileView
  ? [t("Exam Title"), t("Date/Time")]
  : [t("Exam Title"), t("LVA Nr."), t("Date/Time"), t("Duration"), t("Mode"), t("Student"), t("Examiner"), t("Institute")];
  

  const keys: (keyof Exam)[] = isMobileView
    ? ["title", "date"] // Shortened keys for mobile
    : ["title", "lva_num", "date", "duration", "exam_mode", "student", "examiner", "institute"];
  
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
      const exams: any[] = await fetchAll(`${config.strapiUrl}/api/exams/without-tutor`,user.token,t("HTTP error!"));
        const nonArchived = exams.filter(
      (exam: any) => exam.status !== ExamStatus.archived
    );

    const updatedData = nonArchived.map((exam: any) => {
      const e = { ...exam };

      if (exam.student?.matrikel_number)
        e.student = exam.student.matrikel_number;

      if (exam.tutor?.first_name && exam.tutor?.last_name)
        e.tutor = `${exam.tutor.first_name} ${exam.tutor.last_name}`;

      if (exam.examiner?.first_name && exam.examiner?.last_name)
        e.examiner = `${exam.examiner.first_name} ${exam.examiner.last_name}`;

      if (exam.exam_mode?.name) e.exam_mode = exam.exam_mode.name;
      if (exam.institute?.abbreviation) e.institute = exam.institute.abbreviation;

      return e;
    });

    setExams(updatedData);
    } catch (err) {
      showToast({
        message: `${t("Error fetching exams")}: ${err}`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleExamClick = (examId: number) => {
    navigate(`/tutor/exams/monitor-request/${examId}`); // Navigate to ExamEditor with the exam ID
  };

  if (loading) {
    return <p aria-live="polite" aria-busy="true">{t("Loading exams...")}</p>; // Display loading indicator while fetching
  }

  return (
    <ContentView
      title={t("Request Exam Monitoring")}
      onRowClick={handleExamClick} 
      fields={fields}
      keys={keys}
      buttonName={user.role === "Tutor" ? t("Request") : t("Edit")}
      coloring={true}
      data={exams} // Pass the fetched and updated exam data here
    />
  );
}
