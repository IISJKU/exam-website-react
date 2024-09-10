import Student from "../../classes/Student";
import examData from "../../../TestData/Exams.json";
import SearchBar from "../components/SearchBar";
import { useState, useEffect } from "react";
import SortableHeaders from "../components/SortableHeaders";
import ContentView from "./ContentView";

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
    "Bonus Time",
  ];
  const keys: (keyof Student)[] = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "emergency_contact",
    "matrikel_number",
    "bouns_time",
  ];
  let allStudents: Student[] = [];
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/students");
      const data = await response.json();
      setStudentData(data["data"]); // Update state with fetched students
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  studentData.forEach((element) => {
    allStudents.push(element["attributes"]);
  });

  if (loading) {
    return <p>Loading students...</p>; // Display loading indicator while fetching
  }

  return (
    <ContentView
      title={"Students"}
      callback={props.callback}
      fields={fields}
      keys={keys}
      data={allStudents}
    />
  );
}
