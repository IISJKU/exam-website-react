import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import EditField from "../components/EditField";
import { showToast } from '../components/ToastMessage'; 
import Student from "../../classes/Student";
import Major from "../../classes/Major";
import DropdownWithSearch from "../components/DropdownSearch";

export default function IndividualStudent() {
  const { id } = useParams(); // Get the student ID from the URL params
  const navigate = useNavigate(); // For navigating back or to other views
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [student, setStudent] = useState<Student | null>(null); // Store student data
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [matrikel_number, setMatrikelNum] = useState<string>("");
  const [emergency_contact, setEmergencyContact] = useState<string>("");
  const [bonus_time, setOvertime] = useState<number | undefined>();
  const [misc, setMisc] = useState<string>("");
  const [major, setMajor] = useState<number | undefined>();

  const [majors, setMajors] = useState<Major[]>([]); // Store majors data

  useEffect(() => {
    // Fetch student data based on ID from URL
    const fetchStudent = async () => {
      try {
        const studentResponse = await fetch(`http://localhost:1337/api/students/${id}`);
        const studentData = await studentResponse.json();
        
        setStudent(studentData);
        setFirstName(studentData.first_name);
        setLastName(studentData.last_name);
        setEmail(studentData.email);
        setPhone(studentData.phone);
        setMatrikelNum(studentData.matrikel_number);
        setEmergencyContact(studentData.emergency_contact);
        setOvertime(studentData.bonus_time);
        setMisc(studentData.misc);
        setMajor(studentData.major_id);
      } catch (error) {
        showToast({ message: "Error fetching student data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    // Fetch majors data for the dropdown
    const fetchMajors = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/majors");
        const result = await response.json();
        setMajors(result);
      } catch (error) {
        showToast({ message: "Error fetching majors.", type: "error" });
      }
    };

    fetchStudent();
    fetchMajors();
  }, [id]);

  // Handle student data update
  const handleUpdate = async () => {
    const data: Partial<Student> = {
      first_name,
      last_name,
      email,
      phone,
      emergency_contact,
      matrikel_number,
      bonus_time,
      misc,
      major,
    };

    try {
      const response = await fetch(`http://localhost:1337/api/students/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }), // Send data in the request body
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: 'error' });
        return;
      }

      const result = await response.json();
      showToast({ message: `${result.first_name} ${result.last_name}'s student record has been updated successfully.`, type: 'success' });

      navigate("/admin/students"); // Navigate back to the students list after successful update
    } catch (error) {
      showToast({ message: `Error updating the student record: ${(error as Error).message}.`, type: 'error' });
    }
  };

  const majorOptions = majors.map(major => ({
    value: major.id,
    label: major.name,
  }));

  if (loading || !student) {
    return <p>Loading student data...</p>;
  }

  return (
    <div className="m-10">
      <EditField
        title="First Name"
        editMode={editMode}
        text={first_name}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <EditField
        title="Last Name"
        editMode={editMode}
        text={last_name}
        onChange={(e) => setLastName(e.target.value)}
      />
      <EditField
        title="Email"
        editMode={editMode}
        text={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <EditField
        title="Phone"
        editMode={editMode}
        text={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <EditField
        title="Matrikel Number"
        editMode={editMode}
        text={matrikel_number}
        onChange={(e) => setMatrikelNum(e.target.value)}
      />
      <DropdownWithSearch
        label="Major"
        options={majorOptions}
        value={major ?? ""}
        onChange={(newValue) => setMajor(Number(newValue))}
        placeholder="Search major..."
        disabled={!editMode}
      />
      <EditField
        title="Emergency Contact"
        editMode={editMode}
        text={emergency_contact}
        onChange={(e) => setEmergencyContact(e.target.value)}
      />
      <EditField
        title="Overtime"
        editMode={editMode}
        text={bonus_time ? bonus_time.toString() : ""}
        onChange={(e) => setOvertime(Number(e.target.value))}
      />
      <EditField
        title="Misc"
        editMode={editMode}
        text={misc}
        onChange={(e) => setMisc(e.target.value)}
      />
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
      <button
        onClick={() => navigate("/admin/students")} // Navigate back to students list
        className="ml-4 border-2 border-red-500 p-1 hover:bg-red-400 hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
