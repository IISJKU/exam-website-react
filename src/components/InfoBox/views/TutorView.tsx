import { useState, useEffect } from "react";
import Tutor from "../../classes/Tutor";
import ContentView, { formatDateTime } from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import config from "../../../config";

export default function TutorView() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize navigate for navigation
  const user = useAuth();

  const fields = [t("First Name"), t("Last Name"), t("Phone"), t("Matrikel Number"), t("Study"), t("Contract Type"), t("Contract Completed"), t("Distribution List"), t("Salto Access"), t("Location")];
  const keys: (keyof Tutor)[] = ["first_name", "last_name", "phone", "matrikel_number", "study", "contract_type", "contract_completed", "distribution_list", "salto_access", "location"];
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
      const updatedData = data.map((tutor: any) => {
        let updatedTutor = { ...tutor };

        if (tutor.location?.name) {
          updatedTutor.location = tutor.location.name;
        }

        if (tutor.salto_access) {
          updatedTutor.salto_access = t("Yes Until") + " " + formatDateTime(tutor.salto_access);
        } else {
          updatedTutor.salto_access = t("No")
        }

        return updatedTutor;
      });
      setTutors(updatedData); 
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
