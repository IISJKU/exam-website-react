import { useState, useEffect } from "react";
import Tutor from "../../classes/Tutor";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom

export default function TutorView() {
  const navigate = useNavigate(); // Initialize navigate for navigation

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

  const [tutors, setTutors] = useState<Tutor[]>([]); // Type tutors as Tutor array
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchTutors = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/tutors");
      const data = await response.json();
      setTutors(data); // Update tutors with fetched data
    } catch (error) {
      showToast({ message: `Error fetching tutors: ${error}.`, type: 'error' });
    } finally {
      setLoading(false); // Set loading to false when the fetch is complete
    }
  };

  useEffect(() => {
    fetchTutors(); // Fetch tutors on component mount
  }, []);

  const handleTutorClick = (tutorId: number) => {
    navigate(`/admin/tutors/${tutorId}`); // Navigate to individual tutor view with ID
  };

  if (loading) {
    return <p>Loading Tutors...</p>; // Display loading state while fetching data
  }

  return (
    <ContentView
      title={"Tutors"}
      onRowClick={handleTutorClick} // Pass the row click handler for tutor navigation
      fields={fields}
      keys={keys}
      data={tutors} // Pass the tutor data to ContentView
    />
  );
}
