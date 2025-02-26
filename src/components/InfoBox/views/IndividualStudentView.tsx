import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import EditField from "../components/EditField";
import { showToast } from "../components/ToastMessage";
import Student, { InDistrbutionList, PresenceMultimedia } from "../../classes/Student";
import Major from "../../classes/Major";
import DropdownWithSearch from "../components/DropdownWithSearch";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import config from "../../../config";
import Location from "../../classes/Location";
import DisabilityType from "../../classes/DisabilityType";
import Faculty from "../../classes/Faculty";
import { dropdownOptions } from "./ExamEditor";
import BooleanDropdown from "../components/BooleanDropdown";
import EnumSelector from "../components/EnumSelector";
import MultiSelect from "../components/MultiSelect";

export default function IndividualStudent() {
  const { t } = useTranslation();
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
  const [conditions_approved, setConditionsApproved] = useState<boolean>(false);
  const [in_dist_list, setInDistList] = useState<InDistrbutionList>(InDistrbutionList.inDistList_no);
  const [location, setLocation] = useState<number | undefined>();
  const [locations, setLocations] = useState<Location[]>([]);
  const [disability_types, setDisabilityTypes] = useState<DisabilityType[]>([]); 
  const [all_dis_types, setAllDisTypes] = useState<DisabilityType[]>([]); 
  const [faculty, setFaculty] = useState<number | undefined>();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [disability, setDisability] = useState<string>("");
  const [presence_multi, setPresenceMulti] = useState<PresenceMultimedia>();
  const [updates, setUpdates] = useState<string>("");

  const user = useAuth();

  useEffect(() => {
    // Fetch student data based on ID from URL
    const fetchStudent = async () => {
      try {
        const studentResponse = await fetch(`${config.strapiUrl}/api/students/${id}`, {
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
        setConditionsApproved(studentData.conditions_approved || false);
        setInDistList(studentData.in_distribution_list);
        setLocation(studentData.location?.id);
        setDisabilityTypes(studentData.disability_types || []);
        setFaculty(studentData.faculty?.id);
        setDisability(studentData.disability || "");
        setPresenceMulti(studentData.presence_multimedia);
        setUpdates(studentData.updates || "")
      } catch (error) {
        showToast({ message: t("Error fetching student data"), type: "error" });
      } finally {
        setLoading(false);
      }
    };

    const fetchDropdownData = async () => {
      try {
        const [majorsRes, locationsRes, facultyRes, disabilityTypesRes] = await Promise.all([
          fetch(config.strapiUrl + "/api/majors", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch(config.strapiUrl + "/api/locations", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch(config.strapiUrl + "/api/faculties", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
          fetch(config.strapiUrl + "/api/disability-types", { headers: { Authorization: `Bearer ${user.token}` } }).then((res) => res.json()),
        ]);

        setMajors(majorsRes);
        setLocations(locationsRes);
        setFaculties(facultyRes);
        setAllDisTypes(disabilityTypesRes);
      } catch (error) {
        showToast({ message: t("Error fetching dropdown data."), type: "error" });
      }
    };

    fetchStudent();
    fetchDropdownData();
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
      conditions_approved,
      in_distribution_list: in_dist_list,
      disability,
      presence_multimedia: presence_multi,
      updates,
      location,
      disability_types,
      faculty,
    };

    try {
      const response = await fetch(`${config.strapiUrl}/api/students/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }), // Send data in the request body
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${errorData.error.message || t("Unknown error")}}.`, type: "error"});
        return;
      }

      const result = await response.json();
      showToast({ message: `${result.first_name} ${result.last_name} ${t("student record has been updated successfully.")}`, type: "success" });

      //navigate("/admin/students"); // Navigate back to the students list after successful update
    } catch (error) {
      showToast({ message: `${t("Error updating the student record")}: ${(error as Error).message}.`, type: "error" });
    }
  };

  if (loading || !student) {
    return <p aria-live="polite" aria-busy="true">{t("Loading student data...")}</p>;
  }

  return (
    <div className="m-5" role="main" aria-labelledby="student-details-heading">
      <h1 id="student-details-heading" className="text-2xl font-bold mb-4 sr-only">
        {t("Student Details")}
      </h1>
      <div className="flex flex-col md:flex-row justify-between gap-4 px-2" role="region" aria-labelledby="side-by-side-divs-heading" > 
        {/* First div */}
        <div className="w-1/2 p-4 rounded shadow-md" role="region" aria-labelledby="first-div-heading">
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
            editMode={editMode}
            text={last_name}
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
            tableName = "majors"
            label={t("Major")}
            options={dropdownOptions(majors, "name")}
            value={major ?? ""}
            onChange={(newValue) => setMajor(Number(newValue))}
            placeholder={t("Search major...")}
            disabled={!editMode}
            aria-label={t("Select student's major")}
          />

          <EditField
            title={t("Emergency Contact")}
            editMode={editMode}
            text={emergency_contact}
            hideTitle={false} onChange={(e) => setEmergencyContact(e.target.value)}
            aria-label={t("Edit student's emergency contact")}
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
        </div>
        {/* second div */}
        <div className="w-1/2 p-4 rounded shadow-md" role="region" aria-labelledby="second-div-heading">
          <BooleanDropdown
            label={t("Conditions Approved")}
            value={conditions_approved}
            onChange={setConditionsApproved}
            required={true}
            disabled={!editMode}
            aria-label={t("Edit student condition approved value")}
            aria-required="true"
          />

          <EnumSelector
            title={t("In Distribution List")}
            value={in_dist_list || t("N/A")}
            disabled={!editMode}
            onChange={(newValue) => setInDistList((newValue))}
            options={Object.values(InDistrbutionList)}
            aria-label={t("Edit student in distribution list value")}
          />

          <EditField
            title={t("Disability")}
            editMode={editMode}
            text={disability}
            hideTitle={false}
            onChange={(e) => setDisability(e.target.value)}
            aria-label={t("Edit student disability")}
          />

          <DropdownWithSearch
            tableName="locations"
            label={t("Location")}
            options={dropdownOptions(locations, "name")}
            value={location ?? ""}
            onChange={(val) => setLocation(Number(val))}
            disabled={!editMode}
            aria-label={t("Edit student location")}
          />

          <DropdownWithSearch
            tableName="faculties"
            label={t("Faculty")}
            options={dropdownOptions(faculties, "name")}
            value={faculty ?? ""}
            onChange={(val) => setFaculty(Number(val))}
            disabled={!editMode}
            aria-label={t("Edit student faculty")}
          />

          <EnumSelector
            title={t("Presence/Multimedia")}
            value={presence_multi || t("N/A")}
            disabled={!editMode}
            onChange={(newValue) => setPresenceMulti(newValue as PresenceMultimedia)}
            options={Object.values(PresenceMultimedia)}
            aria-label={t("Edit student presence or Multimedia value")}
          />

          <MultiSelect
            label={t("Disability Types")}
            options={dropdownOptions(all_dis_types, "abbreviation")}
            value={disability_types.map((dt) => dt.id)}
            onChange={(disability_types) => {
              setDisabilityTypes(all_dis_types.filter((dt) => disability_types.includes(dt.id)));
            }}
            disabled={!editMode}
            placeholder={t("Select disability types")}
            aria-label={t("Edit student disability types")}
          />
          
          <EditField
            title={t("Updates")}
            editMode={editMode}
            text={updates}
            hideTitle={false}
            onChange={(e) => setUpdates(e.target.value)}
            aria-label={t("Edit student updates")}
          />
        </div>
      </div>  
      <div className="mt-4 flex flex-row md:flex-row space-x-2">
        <button
          onClick={() => navigate(-1)}
          className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:bg-slate-700"
          aria-label={t("Go back to the previous page")}
        >{t("Back")}</button>
      <button
        onClick={() => {
          setEditMode(!editMode);
          if (editMode) handleUpdate();
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
        aria-label={editMode ? t("Save changes") : t("Enable edit mode")}
      >
        {editMode ? t("Save") : t("Edit")}
      </button>
      {editMode && (
        <button
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700"
        onClick={() => setEditMode(false)}
        aria-label={t("Cancel editing")}
        >{t("Cancel")}</button>
      )}
      </div>
    </div>
  );
}
