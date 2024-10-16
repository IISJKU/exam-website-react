import React, { useState } from "react";
import DataAdministration from "./DataAdministration"; // Assuming you have this component

// List of tables with their fields and relational fields
const tableConfigurations = {
  students: {
    tableName: "students",
    selectedFields: ["first_name", "last_name", "email", "matrikel_number", "phone", "emergency_contact", "bonus_time", "misc"],
    populateFields: [{ name: "major", populateTable: "majors" , displayField: "name" }],
  },
  tutors: {
    tableName: "tutors",
    selectedFields: ["first_name", "last_name", "email", "matrikel_number", "phone"],
    populateFields: [],
  },
  Exams: {
    tableName: "exams",
    selectedFields: ["title", "date", "duration", "lva_num", "status"],
    populateFields: [{ name: "student", populateTable: "students" , displayField: "matrikel_number" }, { name: "tutor", populateTable: "tutors" , displayField: "first_name"}, { name: "examiner", populateTable: "examiners", displayField: "first_name" },
      { name: "exam_mode", populateTable: "exam-modes" , displayField: "name"}, { name: "institute", populateTable: "institutes" , displayField: "name"}, { name: "room", populateTable: "rooms" , displayField: "name"}],
    },
    examiners: {
        tableName: "examiners",
        selectedFields: ["first_name", "last_name", "email", "phone"],
        populateFields: [],
    },
    exam_Modes: {
        tableName: "exam-modes",
        selectedFields: ["name", "description"],
        populateFields: [],
    },
    institutes: {
        tableName: "institutes",
        selectedFields: ["name", "abbreviation", "email", "faculty", "city", "department"],
        populateFields: [],
    },
    majors: {
        tableName: "majors",
        selectedFields: ["name", "abbreviation", "faculty"],
        populateFields: [],
    },
    rooms: {
        tableName: "rooms",
        selectedFields: ["name", "building", "capacity", "location", "isAvailable"],
        populateFields: [],
    },
    users: {
        tableName: "users",
        selectedFields: ["username", "email", "provider", "confirmed", "blocked"], //password, resetPasswordToken, confirmationToken ??
        populateFields: [],
    },
};

type TableName = keyof typeof tableConfigurations; // Create a type for the keys of tableConfigurations

export default function TableLinks() {
  const [selectedTable, setSelectedTable] = useState<TableName | null>(null); // Use the TableName type for state

  // Handler to update the selected table
  const handleSelectTable = (table: TableName) => {
    setSelectedTable(table);
  };

  return (
    <div className="container mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Database Tables</h1>
      
      {/* Grid with 4 columns on medium screens and higher, 2 columns on smaller screens */}
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Object.keys(tableConfigurations).map((table) => (
          <li key={table} className="bg-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            <button
              onClick={() => handleSelectTable(table as TableName)} // Cast to TableName
              className="block w-full h-full text-center py-4 text-lg font-medium text-gray-800 hover:text-white hover:bg-blue-500 rounded-lg"
            >
              {table.charAt(0).toUpperCase() + table.slice(1).replace("_", " ")}
            </button>
          </li>
        ))}
      </ul>
  
      {/* Conditionally render the DataAdministration component based on the selected table */}
      {selectedTable && (
        <div className="">
          <DataAdministration
            tableName={tableConfigurations[selectedTable].tableName}
            selectedFields={tableConfigurations[selectedTable].selectedFields}
            populateFields={tableConfigurations[selectedTable].populateFields}
          />
        </div>
      )}
    </div>
  );
  

}
