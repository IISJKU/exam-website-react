import Student from "../../classes/Student";
import { useState, useEffect } from "react";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";

interface StudentViewInterface {
  callback: Function;
}

export default function StudentView(props: StudentViewInterface) {
  const fields = [
    "First Name",
    "Last Name",
    "eMail",
    "Phone",
    "Emergency Contact",
    "Matrikel Number",
    "Major",
    "Bonus Time",
  ];

  const keys: (keyof Student)[] = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "emergency_contact",
    "matrikel_number",
    "major",
    "bonus_time", 
  ];

  const [studentData, setStudentData] = useState<Student[]>([]); // Added type for student data
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/students");
      const data = await response.json();
      setStudentData(data["data"].map((student: any) => student.attributes)); // Update state with fetched students
    } catch (error) {
      showToast({ message: `Error fetching students: ${error}.`, type: 'error' });
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return <p>Loading students...</p>; // Display loading indicator while fetching
  }

  return (
    <ContentView
      title={"Students"}
      callback={props.callback}
      fields={fields}
      keys={keys}
      data={studentData}
    />
  );
}
