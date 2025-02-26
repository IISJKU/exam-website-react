import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useParams to get the route params
import EditField from "../components/EditField";
import { showToast } from "../components/ToastMessage";
import Tutor, { ContractCompleted, ContractType, DistributionList } from "../../classes/Tutor";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import config from "../../../config";
import EnumSelector from "../components/EnumSelector";
import DateField from "../components/DateField";
import moment from "moment";
import DropdownWithSearch from "../components/DropdownWithSearch";
import { dropdownOptions } from "./ExamEditor";
import Location from "../../classes/Location";

export default function IndividualTutor() {
  const { t } = useTranslation();
  const { id } = useParams(); // Extract the tutor ID from the route parameters
  const navigate = useNavigate(); // For navigation
  const [loading, setLoading] = useState<boolean>(true);
  const [tutor, setTutor] = useState<Tutor | null>(null); // Initially null until the data is fetched
  const [editMode, setEditMode] = useState<boolean>(false);
  const [first_name, setFirstName] = useState<string>("");
  const [last_name, setLastName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [matrikel_number, setMatrikelNum] = useState<string>("");
  const [study, setStudy] = useState<string>("");
  const [contract_type, setContractType] = useState<ContractType>();
  const [contract_completed, setContractCompleted] = useState<ContractCompleted>(ContractCompleted.completed_no);
  const [distribution_list, setDistributionList] = useState<DistributionList>(DistributionList.DistList_no);
  const [salto_access, setSaltoAccess] = useState<string>("No");
  const [location, setLocation] = useState<number | undefined>();
  const [locationOptions, setLocationOptions] = useState<Location[]>([]);

  const user = useAuth();

  // Fetch the tutor data by ID
  useEffect(() => {
    const fetchTutor = async () => {
      try {
        const response = await fetch(`${config.strapiUrl}/api/tutors/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const tutorData = await response.json();
        if (!response.ok) {
          showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${tutorData.error.message || t("Unknown error")}}.`, type: "error"});
        }
        setTutor(tutorData); // Set the fetched tutor data
        setLoading(false); // Stop loading
        setFirstName(tutorData.first_name);
        setLastName(tutorData.last_name);
        setPhone(tutorData.phone);
        setMatrikelNum(tutorData.matrikel_number);
        setStudy(tutorData.study);
        setContractType(tutorData.contract_type);
        setContractCompleted(tutorData.contract_completed);
        setDistributionList(tutorData.distribution_list);
        setSaltoAccess(tutorData.salto_access);
        setLocation(tutorData.location?.id)
      } catch (error) {
        showToast({ message: `${t("Error fetching tutor data")}: ${(error as Error).message}.`, type: "error" });
      } finally {
        setLoading(false);
      }
    };

    // Fetch majors data for the dropdown
    const fetchLocations = async () => {
      try {
        const response = await fetch(config.strapiUrl +"/api/locations", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const result = await response.json();
        if (!response.ok) {
          showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${result.error.message || t("Unknown error")}}.`, type: "error"});
        }
        setLocationOptions(result);
      } catch (error) {
        showToast({ message: t("Error fetching locations."), type: "error" });
      }
    };


    if (id) {
      fetchTutor(); // Fetch tutor data only if ID is present
      fetchLocations()
    }
  }, [id]);

  // Function to handle Tutor data update
  const handleUpdate = async () => {
    const data: Partial<Tutor> = {
      first_name,
      last_name,
      phone,
      matrikel_number,
      study,
      contract_type,
      contract_completed,
      distribution_list,
      salto_access,
      location,
    };

    try {
      const response = await fetch(`${config.strapiUrl}/api/tutors/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }), // Send data in the request body
      });

      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${errorData.error.message || t("Unknown error")}}.`, type: "error" });
        throw new Error(`${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${errorData.error.message || t("Unknown error")}}.`);
      }

      const result = await response.json();
      showToast({ message: `${result.first_name} ${result.last_name} ${t("tutor record has been updated successfully.")}`, type: "success" });

      // Navigate back to tutor list or any other page
      //navigate("/admin/tutors");
    } catch (error) {
      showToast({ message: `${t("Error updating the tutor record")}: ${(error as Error).message}.`, type: "error" });
    }
  };

    const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedDate = event.target.value;
      
      // Use the proper format for combining the date and time
      const updatedDate = moment(`${selectedDate}`, "YYYY-MM-DDT").utc().toISOString();
      setSaltoAccess(updatedDate);
    };

  if (loading || !tutor) {
    return <p aria-live="polite" aria-busy="true">{t("Loading tutor data...")}</p>;
  }

  return (
    <div className="m-5" role="main" aria-labelledby="tutor-details-heading">
        <h1 id="tutor-details-heading" className="text-2xl font-bold mb-4 sr-only">
          {t("Tutor Details")}
        </h1>
      <EditField
        title={t("First Name")}
        editMode={editMode}
        text={first_name}
        onChange={(e) => setFirstName(e.target.value)}
        aria-label={t("Edit tutor's first name")}
        required={true}
        aria-required="true"
      />

      <EditField
        title={t("Last Name")}
        editMode={editMode}
        text={last_name}
        onChange={(e) => setLastName(e.target.value)}
        aria-label={t("Edit tutor's last name")}
        required={true}
        aria-required="true"
      />

      <EditField
        title={t("Phone")}
        editMode={editMode}
        text={phone}
        hideTitle={false}
        onChange={(e) => setPhone(e.target.value)}
        aria-label={t("Edit tutor's phone")}
        required={true}
        aria-required="true"
      />

      <EditField
        title={t("Matrikel Number")}
        editMode={editMode}
        text={matrikel_number}
        hideTitle={false}
        onChange={(e) => setMatrikelNum(e.target.value)}
        aria-label={t("Edit tutor's matrikel number")}
      />

      <EditField
        title={t("Study")}
        editMode={editMode}
        text={study || t("N/A")}
        hideTitle={false}
        onChange={(e) => setStudy(e.target.value)}
        aria-label={t("Edit tutor's Study")}
      />

      <EnumSelector
        title={t("Contract Type")}
        value={contract_type}
        disabled={!editMode}
        onChange={(newValue) => setContractType((newValue))}
        options={Object.values(ContractType)}
      />

      <EnumSelector
        title={t("Contract Completed")}
        value={contract_completed}
        disabled={!editMode}
        onChange={(newValue) => setContractCompleted((newValue))}
        options={Object.values(ContractCompleted)}
      />

      <EnumSelector
        title={t("In Distribution List")}
        value={distribution_list || t("N/A")}
        disabled={!editMode}
        onChange={(newValue) => setDistributionList((newValue))}
        options={Object.values(DistributionList)}
      />

      {(!salto_access) && (!editMode) ? (
        <EditField
        title={t("Salto Access")}
        editMode={false}
        text={t("No")}
        hideTitle={false}
        aria-label={t("Salto Access not granted")}
        />
      ) : (
        <DateField
          title={t("Salto Access")}
          editMode={editMode}
          dateValue={salto_access}
          onDateChange={handleDateChange}
          aria-label={t("Date until Salto Access granted")}
          required={true}
        />
      )}

      <DropdownWithSearch
        tableName="locations"
        label={t("Location")}
        options={dropdownOptions(locationOptions, "name")}
        value={location ?? ""}
        onChange={(newValue) => setLocation(Number(newValue))}
        placeholder={t("Search Location...")}
        disabled={!editMode}
        aria-label={t("Tutor location")}
        required={true}
      />

      <div className="mt-4 flex space-x-2">
        <button onClick={() => navigate(-1)}
          className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:bg-slate-700"
          aria-label={t("Go back to the previous page")}>{t("Back")}</button>
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
          >
            {t("Cancel")}
          </button>
        )}
      </div>
    </div>
  );
}
