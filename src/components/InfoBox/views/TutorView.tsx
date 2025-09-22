import { useState, useEffect } from "react";
import Tutor from "../../classes/Tutor";
import ContentView, { formatDateTime } from "./ContentView";
import { showToast } from "../components/ToastMessage";
import { useNavigate } from "react-router-dom"; // Import navigate from react-router-dom
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import config from "../../../config";
import fetchAll from "./FetchAll";

export default function TutorView() {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize navigate for navigation
  const user = useAuth();

  const fields = [t("First Name"), t("Last Name"), t("Phone"), t("Matrikel Number"), t("Study"), t("Contract Type"), t("Contract Completed"), t("In Distribution List"), t("Salto Access"), t("Location")];
  const keys: (keyof Tutor)[] = ["first_name", "last_name", "phone", "matrikel_number", "study", "contract_type", "contract_completed", "distribution_list", "salto_access", "location"];
  const [tutors, setTutors] = useState<Tutor[]>([]); // Type tutors as Tutor array
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchTutors = async () => {
    try {
      const tutors: any[] = await fetchAll(
        `${config.strapiUrl}/api/tutors`,
        user.token,
        t("HTTP error!")
      );

      const updated = tutors.map((tutor) => {
        const obj = { ...tutor };

        if (tutor.location?.name) obj.location = tutor.location.name;

        obj.salto_access = tutor.salto_access
          ? `${t("Yes Until")} ${formatDateTime(tutor.salto_access)}`
          : t("No");

        return obj;
      });

      setTutors(updated);
    } catch (error) {
      showToast({ message: `${t("Error fetching tutors")}: ${error}`, type: "error" });
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
