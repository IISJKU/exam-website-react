import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const tableConfigurations = {
  students: { tableName: "students"},
  tutors: { tableName: "tutors" },
  exams: { tableName: "exams" },
  examiners: { tableName: "examiners" },
  exam_modes: { tableName: "exam_modes" },
  institutes: { tableName: "institutes" },
  majors: { tableName: "majors" },
  rooms: { tableName: "rooms" },
  users: { tableName: "users" },
  disability_type: { tableName: "disability-types" },
  faculty: { tableName: "faculties" },
  location: { tableName: "locations" },
};

export default function TableLinks() {
  const { t } = useTranslation(); 
  return (
    <nav className="container mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg" aria-label={t("Database Table Navigation")}>
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center" id="table-links-title">{t("Database Tables")}</h1>

      <ul className="grid grid-cols-2 md:grid-cols-4 gap-6" role="list" aria-labelledby="table-links-title">
        {Object.keys(tableConfigurations).map((table) => (
          <li
            key={table}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500"
            role="listitem"
          >
            <Link
              to={`/admin/data-administration/${table}`} // Navigate to DataAdministration view
              className="block w-full h-full text-center py-4 text-lg font-medium text-gray-800 hover:text-white hover:bg-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={`${t("Navigate to")} ${table
                .charAt(0)
                .toUpperCase()}${table.slice(1).replace("_", " ")} ${t("table")}`}
            >
              {t(table.charAt(0).toUpperCase() + table.slice(1).replace("_", " "))}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
