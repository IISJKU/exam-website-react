import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import EditField from "../components/EditField";
import { showToast } from "../components/ToastMessage";
import Student from "../../classes/Student";
import Major from "../../classes/Major";
import DropdownWithSearch from "../components/DropdownWithSearch";
import { useAuth } from "../../../hooks/AuthProvider";
import { t } from "i18next";

export default function IndividualStudent() {
  const { id } = useParams(); // Get the student ID from the URL params
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [student, setStudent] = useState<Student | null>(null); // Store student data
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [matrikel_number, setMatrikelNum] = useState<string>("");
  const [emergency_contact, setEmergencyContact] = useState<string>("");
  const [bonus_time, setOvertime] = useState<number | undefined>();
  const [misc, setMisc] = useState<string>("");
  const [major, setMajor] = useState<number | undefined>();

  const [majors, setMajors] = useState<Major[]>([]); // Store majors data

  const user = useAuth();

  useEffect(() => {
    // Fetch student data based on ID from URL
    const fetchStudent = async () => {
      try {
        const studentResponse = await fetch(`http://localhost:1337/api/students/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const studentData = await studentResponse.json();

        setStudent(studentData);
        setFirstName(studentData.first_name);
        setLastName(studentData.last_name);
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
        const response = await fetch("http://localhost:1337/api/majors", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const result = await response.json();
        if (!response.ok) {
          showToast({ message: `HTTP error! Status: ${response.status}, Message: ${result.error.message || "Unknown error"}.`, type: "error", });
        }
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
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }), // Send data in the request body
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: "error" });
        return;
      }

      const result = await response.json();
      showToast({ message: `${result.first_name} ${result.last_name}'s student record has been updated successfully.`, type: "success" });

      //navigate("/admin/students"); // Navigate back to the students list after successful update
    } catch (error) {
      showToast({ message: `Error updating the student record: ${(error as Error).message}.`, type: "error" });
    }
  };

  const majorOptions = majors.map((major) => ({
    value: major.id,
    label: major.name,
  }));

  if (loading || !student) {
    return <p aria-live="polite" aria-busy="true">Loading student data...</p>;
  }

  return (
    <div className="m-10" role="main" aria-labelledby="student-details-heading">
      <h1 id="student-details-heading" className="text-2xl font-bold mb-4 sr-only">
        Student Details
      </h1>
      <EditField
        title={t("First Name")}
        editMode={editMode}
        text={first_name}
        onChange={(e) => setFirstName(e.target.value)}
        aria-label={t("Edit student's first name")}
        required={true}
        aria-required="true"
      />

      <EditField
        title={t("Last Name")}
        editMode={editMode} text={last_name}
        onChange={(e) => setLastName(e.target.value)}
        aria-label={t("Edit student's last name")}
        required={true}
        aria-required="true"
      />

      <EditField
        title={t("Phone")}
        editMode={editMode}
        text={phone}
        hideTitle={false}
        onChange={(e) => setPhone(e.target.value)}
        aria-label={t("Edit student's phone")}
        required={true}
        aria-required="true"
      />

      <EditField
        title={t("Matrikel Number")}
        editMode={editMode}
        hideTitle={false}
        text={matrikel_number} onChange={(e) => setMatrikelNum(e.target.value)}
        aria-label={t("Edit student's matrikel number")}
        required={true}
        aria-required="true"
      />

      <DropdownWithSearch
        tableName = {t("majors")}
        label="Major"
        options={majorOptions}
        value={major ?? ""}
        onChange={(newValue) => setMajor(Number(newValue))}
        placeholder="Search major..."
        disabled={!editMode}
        aria-label={t("Select student's major")}
      />

      <EditField
        title={t("Emergency Contact")}
        editMode={editMode}
        text={emergency_contact}
        hideTitle={false} onChange={(e) => setEmergencyContact(e.target.value)}
        aria-label={t("Edit student's emergency contact")}
        required={true}
        aria-required="true"
      />

      <EditField
        title={t("Overtime")}
        editMode={editMode}
        text={bonus_time ? bonus_time.toString() : ""}
        hideTitle={false}
        onChange={(e) => setOvertime(Number(e.target.value))}
        aria-label={t("Edit student's overtime allowance")}
        required={true}
        aria-required="true" />
      
      <EditField
        title={t("Misc")}
        editMode={editMode}
        text={misc}
        hideTitle={false}
        onChange={(e) => setMisc(e.target.value)}
        aria-label={t("Edit miscellaneous student details")}
        required={true}
        aria-required="true"
      />
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => navigate(-1)}
          className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:bg-slate-700"
          aria-label="Go back to the previous page"
        >{t("Back")}</button>
      <button
        onClick={() => {
          setEditMode(!editMode);
          if (editMode) handleUpdate();
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
        aria-label={editMode ? "Save changes" : "Enable edit mode"}
      >
        {editMode ? "Save" : "Edit"}
      </button>
      {editMode && (
        <button
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700"
        onClick={() => setEditMode(false)}
        aria-label="Cancel editing"
        >{t("Cancel")}</button>
      )}
      </div>
    </div>
  );
}
