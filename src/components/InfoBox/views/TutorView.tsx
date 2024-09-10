import { useState, useEffect } from "react";
import Tutor from "../../classes/Tutor";
import ContentView from "./ContentView";

interface TutorViewInterface {
  callback: Function;
}

export default function TutorView(props: TutorViewInterface) {
  const fields = [
    "First Name",
    "Last Name",
    "eMail",
    "Phone",
    "Matrikel Number",
    "Course",
  ];
  const keys: (keyof Tutor)[] = [
    "first_name",
    "last_name",
    "email",
    "phone",
    "matrikel_number",
    "course",
  ];
  let allTutors: Tutor[] = [];
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/tutors");
      const data = await response.json();
      setTutors(data["data"]); // Update state with fetched students
    } catch (error) {
      console.error("Error fetching tutors:", error);
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  tutors.forEach((element) => {
    allTutors.push(element["attributes"]);
  });

  if (loading) {
    return <p>Loading Tutors...</p>; // Display loading indicator while fetching
  }
  return (
    <ContentView
      title={"Tutors"}
      callback={props.callback}
      fields={fields}
      keys={keys}
      data={allTutors}
    />
  );
}
