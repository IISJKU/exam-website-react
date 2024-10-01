import { useEffect, useState } from "react";
import EditField from "../components/EditField";
import { showToast } from '../components/ToastMessage'; 
import Student from "../../classes/Student";
import Major from "../../classes/Major";
import DropdownWithSearch from "../components/DropdownSearch";

interface IndividualStudentProps {
  student: Student;
}

export default function IndividualStudent(props: IndividualStudentProps) {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [first_name, setFirstName] = useState<string>(props.student.first_name);
  const [last_name, setLastName] = useState<string>(props.student.last_name);
  const [email, setEmail] = useState<string>(props.student.email);
  const [phone, setPhone] = useState<string>(props.student.phone);
  const [matrikel_number, setMatrikelNum] = useState<string>(props.student.matrikel_number);
  const [emergency_contact, setEmergencyContact] = useState<string>(props.student.emergency_contact);
  const [bonus_time, setOvertime] = useState<number | undefined>(props.student.bonus_time);
  const [misc, setMisc] = useState<string>(props.student.misc);
  const [major, setMajor] = useState<number>(props.student.major_id);

  const [majors, setMajors] = useState<Major[]>([]);

  
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/majors");
        const result = await response.json();
        setMajors(result["data"].map((major: any) => major.attributes)); // Update state with fetched students
      } catch (error) {
        showToast({ message: "Error fetching majors.", type: "error" });
      }
    };

    fetchMajors();
  }, []);

  const majorOptions = majors.map(major => ({
    value: major.id,
    label: `${major.name}`
  }));
  
  // Function to handle student data update
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
      // Fetch API to send a PUT request to update the students data
      const response = await fetch(`http://localhost:1337/api/students/${props.student.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `5bad2121f82b63a7e0ba19074b66b646228a9903a550bdca6ae721ba2996be07c4afa42d15dbc1b3ac3b43cf8fc33408c9f730e3aa76533b8fe19e01acd140df0407a55d58f842dc4adc72f940c8517b6f5431ca7b5e0496eb70321c56e378ce61c99b0b52e8367aeaa7cda748961e9edee3dcb9cccd1d905260de298e8eb012`,
          },
          body: JSON.stringify({ data }), // Send data in the request body
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: 'error' });
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}`);
      }

      const result = await response.json();
      showToast({ message: `${result.data.attributes.first_name} ${result.data.attributes.last_name}'s student record has been updated successfully.`, type: 'success' });
    } catch (error) {
      showToast({ message: `Error updating the student record: ${(error as Error).message}.`, type: 'error' });
    }
  };

  return (
    <div className="m-10 ">
      <EditField
        title="First Name"
        editMode={editMode}
        text={props.student.first_name}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <EditField
        title="Last Name"
        editMode={editMode}
        text={props.student.last_name}
        onChange={(e) => setLastName(e.target.value)}
      />
      <EditField
        title="EMail"
        editMode={editMode}
        text={props.student.email}
        hideTitle={false}
        onChange={(e) => setEmail(e.target.value)}
      />
      <EditField
        title="Phone"
        editMode={editMode}
        text={props.student.phone}
        hideTitle={false}
        onChange={(e) => setPhone(e.target.value)}
      />
      <EditField
        title="Matrikel Nr"
        editMode={editMode}
        text={props.student.matrikel_number}
        hideTitle={false}
        onChange={(e) => setMatrikelNum(e.target.value)}
      />
      <DropdownWithSearch
        label="Major"
        options={majorOptions}
        value={major}
        onChange={(newValue) => setMajor(Number(newValue))}
        placeholder="Search major..."
        disabled={!editMode}
      />
      <EditField
        title="Emergency Contact"
        hideTitle={false}
        editMode={editMode}
        text={props.student.emergency_contact}
        onChange={(e) => setEmergencyContact(e.target.value)}
      />
      <EditField
        title="Overtime"
        hideTitle={false}
        editMode={editMode}
        text={props.student.bonus_time}
        onChange={(e) => setOvertime(Number(e.target.value))}
      />
      <EditField
        title="Misc"
        editMode={editMode}
        text={props.student.misc}
        hideTitle={false}
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
         {editMode ? "Stop Editing" : "Click to Edit"}
      </button>
    </div>
  );
}
