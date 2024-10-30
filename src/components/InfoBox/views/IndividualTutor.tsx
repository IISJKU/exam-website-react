import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useParams to get the route params
import EditField from "../components/EditField";
import { showToast } from "../components/ToastMessage";
import Tutor from "../../classes/Tutor";
import { useAuth } from "../../../hooks/AuthProvider";

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
    return <p>Loading tutor data...</p>;
  }

  return (
    <div className="m-10">
      <EditField title="First Name" editMode={editMode} text={first_name} onChange={(e) => setFirstName(e.target.value)} />
      <EditField title="Last Name" editMode={editMode} text={last_name} onChange={(e) => setLastName(e.target.value)} />
      <EditField title="Phone" editMode={editMode} text={phone} hideTitle={false} onChange={(e) => setPhone(e.target.value)} />
      <EditField title="Matrikel Nr" editMode={editMode} text={matrikel_number} hideTitle={false} onChange={(e) => setMatrikelNum(e.target.value)} />
      <EditField title="Course" editMode={editMode} text={course} hideTitle={false} onChange={(e) => setCourse(e.target.value)} />
      <br />
      <button
        onClick={() => {
          setEditMode(!editMode);
          if (editMode) handleUpdate();
        }}
        className="border-2 border-black p-1 hover:bg-slate-400 hover:underline"
      >
        {editMode ? "Save" : "Edit"}
      </button>
      {editMode ? (
        <button
          className="ml-2 border-2 border-black p-1 hover:bg-red-400 hover:underline"
          onClick={() => {
            setEditMode(!editMode);
          }}
        >
          Cancel
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}
