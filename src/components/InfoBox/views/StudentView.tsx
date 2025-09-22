import Student from "../../classes/Student";
import { useState, useEffect } from "react";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import config from "../../../config";
import fetchAll from "./FetchAll";

export default function StudentView() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize navigate for navigation

  const fields = [t("First Name"), t("Last Name"), t("Phone"), t("Emergency Contact"), t("Matrikel Nr."), t("Major"), t("Bonus Time"), t("In Distribution List"), t("Location"), t("Disability"), t("Presence/Multimedia")];

  const keys: (keyof Student)[] = ["first_name", "last_name", "phone", "emergency_contact", "matrikel_number", "major", "bonus_time", "in_distribution_list", "location", "disability", "presence_multimedia"];

  const [studentData, setStudentData] = useState<Student[]>([]); // State for students data
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  const user = useAuth();

  // Fetch data from API
  const fetchStudents = async () => {
    try {
      const students: any[] = await fetchAll(
        `${config.strapiUrl}/api/students`,
        user.token,
        t("HTTP error!")
      );

      const updated = students.map((student) => ({
        ...student,
        major: student.major?.name || t("N/A"),
        location: student.location?.name || t("N/A"),
        faculty: student.faculty?.abbreviation || t("N/A"),
      }));

      setStudentData(updated);
    } catch (error) {
      showToast({ message: `${t("Error fetching students")}: ${error}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(); // Fetch students on component mount
  }, []);

  const handleStudentClick = (studentId: number) => {
    navigate(`/admin/students/${studentId}`); // Navigate to individual student view with ID
  };

  if (loading) {
    return <p aria-live="polite" aria-busy="true">{t("Loading students...")}</p>; // Display loading state while fetching data
  }

  return (
    <div role="region" aria-label={t("Students List")} className="student-view">
      <ContentView
        title={t("Students")}
        onRowClick={handleStudentClick}
        fields={fields}
        keys={keys}
        data={studentData} 
      />
    </div>
  );
}
