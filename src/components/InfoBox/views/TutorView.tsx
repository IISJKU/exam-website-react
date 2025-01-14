import { useState, useEffect } from "react";
import Tutor from "../../classes/Tutor";
import ContentView from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import config from "../../../config";

export default function TutorView() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize navigate for navigation
  const user = useAuth();

  const fields = [t("First Name"), t("Last Name"), t("Phone"), t("Matrikel Number"), t("Course")];
  const keys: (keyof Tutor)[] = ["first_name", "last_name", "phone", "matrikel_number", "course"];
  const [tutors, setTutors] = useState<Tutor[]>([]); // Type tutors as Tutor array
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchTutors = async () => {
    try {
      const response = await fetch(config.strapiUrl +"/api/tutors", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${data.error.message || t("Unknown error")}}.`, type: "error"});
      }
      setTutors(data); 
    } catch (error) {
      showToast({ message: `${t("Error fetching tutors")}: ${error}.`, type: "error" });
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchTutors(); // Fetch tutors on component mount
  }, []);

  const handleTutorClick = (tutorId: number) => {
    navigate(`/admin/tutors/${tutorId}`); 
  };

  if (loading) {
    return <p aria-live="polite" aria-busy="true">{t("Loading Tutors...")}</p>; 
  }

  return (
    <div role="region" aria-label={t("Tutors List")} className="tutor-view">
      <ContentView
        title={t("Tutors")}
        onRowClick={handleTutorClick} // Pass the row click handler for tutor navigation
        fields={fields}
        keys={keys}
        data={tutors} // Pass the tutor data to ContentView
        />
    </div>
  );
}
