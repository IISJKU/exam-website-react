import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataAdministration from "./DataAdministration";
import { useTranslation } from "react-i18next";

// Configuration for tables
const tableConfigurations = {
    students: {
      tableName: "students",
      selectedFields: ["first_name", "last_name", "matrikel_number", "phone", "emergency_contact", "bonus_time", "misc", "conditions_approved", "in_distribution_list", "disability", "presence_multimedia", "updates"],
      optionalFields: ["misc","conditions_approved","disability", "presence_multimedia", "updates", "disability_type"],
      populateFields: [
        { name: "major", populateTable: "majors", displayField: ["name"] },
        { name: "location", populateTable: "locations", displayField: ["name"] },
        { name: "disability_types", populateTable: "disability-types", displayField: ["abbreviation"] },
        { name: "faculty", populateTable: "faculties", displayField: ["name"] },
      ],
    },
    tutors: {
      tableName: "tutors",
      selectedFields: ["first_name", "last_name", "matrikel_number", "phone", "study", "contract_type", "contract_completed", "salto_access", "distribution_list"],
      optionalFields: ["matrikel_number", "study", "contract_type", "contract_completed", "salto_access", "distribution_list", "location"],
      populateFields: [
        { name: "location", populateTable: "locations", displayField: ["name"] },
      ],
    },
    exams: {
      tableName: "exams",
      selectedFields: ["title", "date", "duration", "lva_num", "notes", "status", "confirmed"],
      optionalFields: [],
      populateFields: [
        { name: "student", populateTable: "students", displayField: ["matrikel_number"] },
        { name: "tutor", populateTable: "tutors", displayField: ["first_name", "last_name"] },
        { name: "examiner", populateTable: "examiners", displayField: ["first_name", "last_name"] },
        { name: "exam_mode", populateTable: "exam-modes", displayField: ["name"] },
        { name: "institute", populateTable: "institutes", displayField: ["name"] },
        { name: "room", populateTable: "rooms", displayField: ["name"] },
      ],
    },
    examiners: {
      tableName: "examiners",
      selectedFields: ["first_name", "last_name", "email", "phone"],
      optionalFields: [],
      populateFields: [],
    },
    exam_modes: {
      tableName: "exam-modes",
      selectedFields: ["name", "description"],
      optionalFields: ["description"],
      populateFields: [],
    },
    institutes: {
      tableName: "institutes",
      selectedFields: ["name", "abbreviation", "email", "department"],
      optionalFields: ["department"],
      populateFields: [],
    },
    majors: {
      tableName: "majors",
      selectedFields: ["name", "abbreviation"],
      optionalFields: [],
      populateFields: [
        { name: "faculty", populateTable: "faculties", displayField: ["name"] },
      ],
    },
    rooms: {
      tableName: "rooms",
      selectedFields: ["name", "building", "capacity", "isAvailable"],
      optionalFields: [],
      populateFields: [
        { name: "location", populateTable: "locations", displayField: ["name"] },
      ],
    },
    users: {
      tableName: "users",
      selectedFields: ["username", "email", "provider", "confirmed", "blocked", "password"],
      optionalFields: ["provider","password", "student", "tutor"],
      populateFields: [
        { name: "role", populateTable: "users-permissions/roles", displayField: ["name"] },
        { name: "student", populateTable: "students", displayField: ["first_name", "last_name"] },
        { name: "tutor", populateTable: "tutors", displayField: ["first_name", "last_name"] },
      ],
    },
    disability_type: {
    tableName: "disability-types",
    selectedFields: ["abbreviation", "definition"],
    optionalFields: [],
    populateFields: [],
    },
    faculty: {
    tableName: "faculties",
    selectedFields: ["abbreviation", "name"],
    optionalFields: [],
    populateFields: [
      { name: "location", populateTable: "locations", displayField: ["name"] },
    ],
    },
    location: {
    tableName: "locations",
    selectedFields: ["name"],
    optionalFields: [],
    populateFields: [
      { name: "faculty", populateTable: "faculties", displayField: ["name"] },
    ],
  },
};

export default function DataAdministrationPage() {
  const { tableName } = useParams<{ tableName?: string }>(); // Mark tableName as optional
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Ensure that tableName exists and is valid
  const config = tableName ? tableConfigurations[tableName as keyof typeof tableConfigurations] : undefined;
  
  // Redirect to TableLinks if tableName is invalid or not found
  useEffect(() => {
    if (!config) {
      navigate("/admin/data-administration"); // Redirect to the main TableLinks view if tableName is invalid
    }
  }, [config, navigate]);
  
  if (!config) {
    return <div role="status" aria-live="polite" aria-busy="true">{t("Loading...")}</div>;
  }
  
    // Ensure tableName is defined before manipulating strings
  const displayName = tableName ? tableName.charAt(0).toUpperCase() + tableName.slice(1).replace("_", " ") : t("Unknown Table");
  
  return (
    <div className="container mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg" role="region" aria-labelledby="data-admin-title">
      <h1 id="data-admin-title" role="heading" tabIndex={0} className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {t("Data Administration")} - {t(displayName)}
      </h1>
  
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/data-administration")} 
        className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={t("Go back to Data Administration menu")}
      >
        {t("Back")}
      </button>
  
      <DataAdministration
        tableName={config.tableName}
        selectedFields={config.selectedFields}
        optionalFields={config.optionalFields}
        populateFields={config.populateFields}
      />
    </div>
  );
}