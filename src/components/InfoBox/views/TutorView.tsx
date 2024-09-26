import { useState, useEffect } from "react";
import Tutor from "../../classes/Tutor";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";

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
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/tutors");
      const data = await response.json();
      setTutors(data["data"].map((tutor: any) => tutor.attributes)); // Map to attributes // Update state with fetched tutors
    } catch (error) {
      showToast({ message: `Error fetching tutors: ${error}.`, type: 'error' });
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) {
    return <p>Loading Tutors...</p>; // Display loading indicator while fetching
  }
  return (
    <ContentView
      title={"Tutors"}
      callback={props.callback}
      fields={fields}
      keys={keys}
      data={tutors}
    />
  );
}
