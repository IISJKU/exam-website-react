import Student from "../../classes/Student";
import { useState, useEffect } from "react";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";
import { t } from "i18next";

export default function StudentView() {
  const navigate = useNavigate(); // Initialize navigate for navigation

  const fields = ["First Name", "Last Name", "Phone", "Emergency Contact", "Matrikel Number", "Major", "Bonus Time"];

  const keys: (keyof Student)[] = ["first_name", "last_name", "phone", "emergency_contact", "matrikel_number", "major", "bonus_time"];

  const [studentData, setStudentData] = useState<Student[]>([]); // State for students data
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  const user = useAuth();

  // Fetch data from API
  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/students", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        showToast({ message: `HTTP error! Status: ${response.status}, Message: ${data.error.message || "Unknown error"}.`, type: "error", });
        return;
       }
      // Map and modify data to extract the 'major' name
      const updatedData = data.map((student: any) => ({
        ...student,
        major: student.major?.name || "N/A", // Set major name or "N/A" if not available
      }));

      setStudentData(updatedData); // Update state with the fetched students
    } catch (error) {
      showToast({ message: `Error fetching students: ${error}.`, type: "error" });
    } finally {
      setLoading(false); // Set loading to false once data fetching is done
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
    <div role="region" aria-label="Student List" className="student-view">
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
