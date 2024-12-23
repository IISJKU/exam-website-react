import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useParams to get the route params
import EditField from "../components/EditField";
import { showToast } from "../components/ToastMessage";
import Tutor from "../../classes/Tutor";
import { useAuth } from "../../../hooks/AuthProvider";
import { t } from "i18next";

export default function IndividualTutor() {
  const { id } = useParams(); // Extract the tutor ID from the route parameters
  const navigate = useNavigate(); // For navigation
  const [loading, setLoading] = useState<boolean>(true);
  const [tutor, setTutor] = useState<Tutor | null>(null); // Initially null until the data is fetched
  const [editMode, setEditMode] = useState<boolean>(false);
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [matrikel_number, setMatrikelNum] = useState<string>("");
  const [course, setCourse] = useState<string>("");

  const user = useAuth();

  // Fetch the tutor data by ID
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await fetch(`http://localhost:1337/api/tutors/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const tutorData = await response.json();
        if (!response.ok) {
          showToast({ message: `HTTP error! Status: ${response.status}, Message: ${tutorData.error.message || "Unknown error"}.`, type: "error", });
        }
        setTutor(tutorData); // Set the fetched tutor data
        setLoading(false); // Stop loading
        setFirstName(tutorData.first_name);
        setLastName(tutorData.last_name);
        setPhone(tutorData.phone);
        setMatrikelNum(tutorData.matrikel_number);
        setCourse(tutorData.course);
      } catch (error) {
        showToast({ message: `Error fetching tutor data: ${(error as Error).message}.`, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTutor(); // Fetch tutor data only if ID is present
    }
  }, [id]);

  // Function to handle Tutor data update
  const handleUpdate = async () => {
    const data: Partial<Tutor> = {
      first_name,
      last_name,
      phone,
      matrikel_number,
      course,
    };

    try {
      const response = await fetch(`http://localhost:1337/api/tutors/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }), // Send data in the request body
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: "error" });
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}`);
      }

      const result = await response.json();
      showToast({ message: `${result.first_name} ${result.last_name}'s tutor record has been updated successfully.`, type: "success" });

      // Navigate back to tutor list or any other page
      //navigate("/admin/tutors");
    } catch (error) {
      showToast({ message: `Error updating the tutor record: ${(error as Error).message}.`, type: "error" });
    }
  };

  if (loading || !tutor) {
    return <p aria-live="polite" aria-busy="true">Loading tutor data...</p>;
  }

  return (
    <div className="m-5" role="main" aria-labelledby="tutor-details-heading">
        <h1 id="tutor-details-heading" className="text-2xl font-bold mb-4 sr-only">
        Tutor Details
        </h1>
      <EditField
        title="First Name"
        editMode={editMode}
        text={first_name}
        onChange={(e) => setFirstName(e.target.value)}
        aria-label={t("Edit tutor's first name")}
        required={true}
        aria-required="true"
      />

      <EditField
        title="Last Name"
        editMode={editMode}
        text={last_name}
        onChange={(e) => setLastName(e.target.value)}
        aria-label={t("Edit tutor's last name")}
        required={true}
        aria-required="true"
      />

      <EditField
        title="Phone"
        editMode={editMode}
        text={phone}
        hideTitle={false}
        onChange={(e) => setPhone(e.target.value)}
        aria-label={t("Edit tutor's phone")}
        required={true}
        aria-required="true"
      />

      <EditField
        title="Matrikel Nr"
        editMode={editMode}
        text={matrikel_number}
        hideTitle={false}
        onChange={(e) => setMatrikelNum(e.target.value)}
        aria-label={t("Edit tutor's matrikel number")}
      />

      <EditField
        title="Course"
        editMode={editMode}
        text={course}
        hideTitle={false}
        onChange={(e) => setCourse(e.target.value)}
        aria-label={t("Edit tutor's course")}
      />
      <div className="mt-4 flex space-x-2">
        <button onClick={() => navigate(-1)}
          className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:bg-slate-700"
          aria-label="Go back to the previous page">{t("Back")}</button>
        <button
          onClick={() => {
            setEditMode(!editMode);
            if (editMode) handleUpdate();
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
          aria-label={editMode ? "Save changes" : "Enable edit mode"}
        >
          {editMode ? t("Save") : t("Edit")}
        </button>
        {editMode && (
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700"
            onClick={() => setEditMode(false)}
            aria-label="Cancel editing"
          >
            {t("Cancel")}
          </button>
        )}
      </div>
    </div>
  );
}
