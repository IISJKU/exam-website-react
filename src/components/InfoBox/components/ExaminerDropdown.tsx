import React, { useState } from "react";
import EditField from "./EditField";
import { useTranslation } from "react-i18next";
import Examiner from "../../../components/classes/Examiner"; 
import { showToast } from "./ToastMessage";

interface ExaminerDropdownProps {
    examiners: Examiner[];
    onAddExaminer: (newExaminer: Examiner) => void;
    onSelectExaminer: (examinerId: number) => void;
    required?: boolean;
}

export default function ExaminerDropdown(props: ExaminerDropdownProps) {
  const { t } = useTranslation();
  const [dropdownExaminers, setDropdownExaminers] = useState<Examiner[]>(props.examiners);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [selectedExaminer, setSelectedExaminer] = useState<number | "">("");

  const handleAddExaminer = () => {
    if (!firstName || !lastName) {
      showToast({ message: t("Both first and last name are required"), type: "error" });
      return;
    }

    const newExaminer = new Examiner(); // Create a new instance of the Examiner class
    newExaminer.id = dropdownExaminers.length + 1; // Assign a unique ID
    newExaminer.first_name = firstName;
    newExaminer.last_name = lastName;
    newExaminer.email = email;
    newExaminer.phone = ""; // Default value
    newExaminer.exams = []; // Default empty array

    // Add to the dropdown list
    setDropdownExaminers((prev) => [...prev, newExaminer]);
    
    // Set the new examiner as selected
    setSelectedExaminer(newExaminer.id);
    props.onSelectExaminer(newExaminer.id);

    // Pass back to parent
    props.onAddExaminer(newExaminer);

    // Reset fields
    setFirstName("");
    setLastName("");
    setEmail("");
    setShowAddForm(false);
  };
    
  return (
    <div>
      <label className="block font-bold">{t("Examiner")}
        {props.required && <span className="text-red-500"> *</span>}
      </label>
      <select
        className="mb-2 border border-gray-300 p-2 w-80 rounded-md px-1 placeholder-black text-black"
        value={selectedExaminer}
        onChange={(e) => {
            const selectedId = Number(e.target.value);
            setSelectedExaminer(selectedId);
            props.onSelectExaminer(selectedId);
          }}
        aria-label={t("Select an examiner")}
        required={props.required}
      >
        <option value="">{t("Select Examiner")}</option>
        {dropdownExaminers.map((examiner) => (
          <option key={examiner.id} value={examiner.id}>
            {examiner.first_name} {examiner.last_name}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="mt-2 px-4 py-2 rounded focus:outline-none"
        onClick={() => setShowAddForm(!showAddForm)}
        aria-expanded={showAddForm}
      >
        {showAddForm ? t("Cancel") : t("Add New")}
      </button>

      {showAddForm && (
        <div
          className="mt-4 p-4 border border-gray-300 shadow-lg rounded-lg bg-gray-50"
          aria-labelledby="add-examiner-form"
        >
          <h4 id="add-examiner-form" className="mb-4 font-bold text-lg">
            {t("Add New Examiner")}
          </h4>
          <EditField
            title={t("First Name")}
            editMode={true}
            text={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-label={t("Enter examiner first name")}
            required={true}
          />
          <EditField
            title={t("Last Name")}
            editMode={true}
            text={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-label={t("Enter examiner last name")}
            required={true}
          />        
          <EditField
            title={t("Email")}
            editMode={true}
            text={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-label={t("Enter examiner email")}
            required={true}
          />
          <button
            type="button"
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none"
            onClick={handleAddExaminer}
          >
            {t("Save")}
          </button>
            
        </div>
        )}
    </div>
  );
}
