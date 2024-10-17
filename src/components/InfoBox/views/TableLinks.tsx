import React from "react";
import { Link } from "react-router-dom";

const tableConfigurations = {
  students: { tableName: "students" },
  tutors: { tableName: "tutors" },
  exams: { tableName: "exams" },
  examiners: { tableName: "examiners" },
  exam_modes: { tableName: "exam_modes" },
  institutes: { tableName: "institutes" },
  majors: { tableName: "majors" },
  rooms: { tableName: "rooms" },
  users: { tableName: "users" },
};

export default function TableLinks() {
  return (
    <div className="container mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Database Tables</h1>

      {/* Grid with 4 columns on medium screens and higher, 2 columns on smaller screens */}
      <ul className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {Object.keys(tableConfigurations).map((table) => (
          <li key={table} className="bg-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
            <Link
              to={`/admin/data-administration/${table}`} // Navigate to DataAdministration view
              className="block w-full h-full text-center py-4 text-lg font-medium text-gray-800 hover:text-white hover:bg-blue-500 rounded-lg"
            >
              {table.charAt(0).toUpperCase() + table.slice(1).replace("_", " ")}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
