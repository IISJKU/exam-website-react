import { useState, useEffect } from "react";
import Tutor from "../../classes/Tutor";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import Exam, { ExamStatus } from "../../classes/Exam";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";
import { t } from "i18next";

export default function TutorRegisteredExams() {
  const navigate = useNavigate(); // Initialize navigate
  const user = useAuth();
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const [id, setId] = useState<number>();

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
      const response = await fetch("http://localhost:1337/api/exams/find-registered", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
       // Filter out exams with the archived status
      const nonArchivedExams = data.filter((exam: Exam) => exam.status !== ExamStatus.archived);
      if (!response.ok) {
        showToast({ message: `HTTP error! Status: ${response.status}, Message: ${data.error.message || "Unknown error"}.`, type: "error" });
      }

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
    setId(examId);
    setShowConfirmDialog(true);
  };

  if (loading) {
    return (
      <p aria-live="polite" aria-busy="true">
        Loading exams...
      </p>
    ); // Display loading indicator while fetching
  }

  const handleRemove = async () => {
    console.log(id);
    const response = await fetch("http://localhost:1337/api/exams/deregister-tutor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ examId: id }),
    });
    const data = await response.json();

    window.location.reload();

    setShowConfirmDialog(false);
  };

  return (
    <>
      <ContentView
        title={"List of Registered Exams"}
        onRowClick={(id) => handleExamClick(id)}
        fields={fields}
        keys={keys}
        buttonName={user.role === "Tutor" ? "Deregister" : "Edit"}
        data={exams} // Pass the fetched and updated exam data here
      />
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-heading"
        >
          <div className="bg-white p-4 rounded shadow-lg max-w-sm">
            <h3 id="confirm-dialog-heading" className="text-lg font-bold mb-4">
              {t("Confirm Removal")}
            </h3>
            <p className="mb-4">{t("Are you sure you want to deregister from this exam?")}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="border-2 border-gray-300 bg-gray-200 text-gray-700 py-1 px-3 rounded mr-2 hover:bg-gray-300"
              >
                {t("Cancel")}
              </button>
              <button onClick={handleRemove} className="border-2 border-red-500 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
                {t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
