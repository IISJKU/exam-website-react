import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import DataAdministration from "./DataAdministration";
import { useEffect } from "react";

// Configuration for tables
const tableConfigurations = {
    students: {
      tableName: "students",
      selectedFields: ["first_name", "last_name", "matrikel_number", "phone", "emergency_contact", "bonus_time", "misc"],
      optionalFields: ["misc"],
      populateFields: [{ name: "major", populateTable: "majors", displayField: ["name"] },],
    },
    tutors: {
      tableName: "tutors",
      selectedFields: ["first_name", "last_name", "matrikel_number", "phone"],
      optionalFields: [],
      populateFields: [],
    },
    exams: {
      tableName: "exams",
      selectedFields: ["title", "date", "duration", "lva_num", "status"],
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
      selectedFields: ["name", "abbreviation", "email", "faculty", "city", "department"],
      optionalFields: ["city", "department"],
      populateFields: [],
    },
    majors: {
      tableName: "majors",
      selectedFields: ["name", "abbreviation", "faculty"],
      optionalFields: [],
      populateFields: [],
    },
    rooms: {
      tableName: "rooms",
      selectedFields: ["name", "building", "capacity", "location", "isAvailable"],
      optionalFields: [],
      populateFields: [],
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
};

export default function DataAdministrationPage() {
    const { tableName } = useParams<{ tableName?: string }>(); // Mark tableName as optional
    const navigate = useNavigate(); // Hook for navigation
  
    // Ensure that tableName exists and is valid
    const config = tableName ? tableConfigurations[tableName as keyof typeof tableConfigurations] : undefined;
  
    // Redirect to TableLinks if tableName is invalid or not found
    useEffect(() => {
      if (!config) {
        navigate("/admin/data-administration"); // Redirect to the main TableLinks view if tableName is invalid
      }
    }, [config, navigate]);
  
    if (!config) {
      return <div>Loading...</div>; // Display loading state while redirecting
    }
  
    // Ensure tableName is defined before manipulating strings
    const displayName = tableName
      ? tableName.charAt(0).toUpperCase() + tableName.slice(1).replace("_", " ")
      : "Unknown Table";
  
    return (
      <div className="container mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Data Administration - {displayName}
        </h1>
  
        {/* Back Button */}
        <button
          onClick={() => navigate("/admin/data-administration")} 
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
        >
          Back
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