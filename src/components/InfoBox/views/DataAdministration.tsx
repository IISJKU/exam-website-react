import React, { useState, useEffect, useMemo } from "react";
import RecordForm from "../../RecordForm";
import { showToast } from "../components/ToastMessage";
import { useAuth } from "../../../hooks/AuthProvider";
import fetchAll from "./FetchAll";
import {formatDateTime } from "./ContentView";
import { useTranslation } from "react-i18next";
import config from "../../../config";

interface DataAdministrationProps {
  tableName: string;
  selectedFields: string[]; // The fields to display
  optionalFields?: string[];
  populateFields?: { name: string; populateTable: string; displayField: string[] }[]; // Relational fields, their tableName, and the display fields
}

interface DataRecord {
  id?: number;
  [key: string]: any;
}

interface RelationalRecord {
  id: any;
  displayValue: string;
  email?: string | null; // Optional property for email
}

export default function DataAdministration(props: DataAdministrationProps) {
  const { t } = useTranslation();
  const user = useAuth();
  const [data, setData] = useState<DataRecord[]>([]); // Data for the selected table
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fields, setFields] = useState<string[]>([]); // Fields to display
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [relationalData, setRelationalData] = useState<{ [key: string]: any[] }>({}); // Relational data for dropdowns
  const [booleanFields, setBooleanFields] = useState<string[]>([]); // Boolean fields
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  const fetchData = async () => {
    setData([]);
    setFields([]);
    setIsLoading(true);

    try {
      // Exclude 'password' from selectedFields if tableName is 'users'
      const filteredFields = props.tableName === "users" ? props.selectedFields.filter((field) => field !== "password") : props.selectedFields;
      const query = filteredFields.length ? filteredFields.map((field, index) => `fields[${index}]=${field}`).join("&") : "";
      const populateQuery = props.populateFields?.length ? `&populate=${props.populateFields.map((field) => field.name).join(",")}` : "";

      const result = await fetchAll(`${config.strapiUrl}/api/${props.tableName}?${query}${populateQuery}`, user.token, t("HTTP error!"));

      if (result && Array.isArray(result)) {
        const fetchedData = result.map((item: any) => {
          const record: DataRecord = { id: item.id, ...item };

          // Identify boolean fields dynamically
          const detectedBooleanFields: string[] = [];
          filteredFields.forEach((field) => {
            if (result.some((item: any) => typeof item[field] === "boolean")) {
              detectedBooleanFields.push(field);
            }
          });

          setBooleanFields(detectedBooleanFields);

          // Handle relational fields
          props.populateFields?.forEach((field) => {
            if (item[field.name]) {
              // Concatenate multiple display fields
              const displayValue =
                Array.isArray(item[field.name]) ? item[field.name].map((obj: any) => field.displayField.map((df) => obj[df]).filter(Boolean).join(" ")).join(", ") // separate multiple items with comma
                  : field.displayField.map((df) => item[field.name]?.[df]).filter(Boolean).join(" ");
              record[field.name] = displayValue || "N/A";
              // Build ID(s)
              record[`${field.name}_id`] = Array.isArray(item[field.name])
              ? item[field.name].map((obj: any) => obj.id)
              : item[field.name].id;
            } else {
              record[field.name] = "N/A";
              record[`${field.name}_id`] = Array.isArray(item[field.name]) ? [] : null;
            }
          });

          return record;
        });

        // Add 'password' back to fields for users form, if applicable
        const finalFields = props.tableName === "users" ? [...filteredFields, "password"] : filteredFields;

        setData(fetchedData);
        setFields(finalFields); // Include 'password' for form fields if table is 'users'
      } else {
        showToast({ message: `${t("Invalid API response")}: ${result}.`, type: "error" });
      }
    } catch (error) {
      showToast({ message: `${t("Error fetching data")}: ${error}.`, type: "error" });
    }
    setIsLoading(false);
  };

  // Fetch relational data for dropdowns
  const fetchRelationalData = async () => {
    const relationalPromises = props.populateFields?.map(async (field) => {
      const result = await fetchAll(`${config.strapiUrl}/api/${field.populateTable}`, user.token, t(`HTTP error!`));

      const records =
        Array.isArray(result) && result.length > 0 && Array.isArray(result[result.length - 1]?.roles)
          ? result[result.length - 1].roles
          : result; // Use roles if it exists and is an array, otherwise use result


      if (Array.isArray(records)) {
          return {
            fieldName: field.name,
            data: records.map((item: any): RelationalRecord => {
              // Build the base object with ID and display value
              const baseObject: RelationalRecord = {
                id: item.id,
                displayValue: field.displayField
                  .map((df) => item[df])
                  .filter(Boolean)
                  .join(" "),
              };

              // Conditionally add student_email or tutor_email
              if (field.populateTable === "students") {
                baseObject["email"] = item.student_email || item.user?.data?.attributes?.email || null;
              } else if (field.populateTable === "tutors") {
                baseObject["email"] = item.tutor_email || item.user?.data?.attributes?.email || null;
              }

              return baseObject;
            }),
          };
      } else {
        throw new Error(`${t("Invalid response format for")} ${field.populateTable}`);
      }
    });

    try {
      const results = await Promise.all(relationalPromises || []);
      const relationalDataObject = results.reduce((acc, { fieldName, data }) => {
        acc[fieldName] = data;
        return acc;
      }, {} as { [key: string]: any[] });
      setRelationalData(relationalDataObject);
    } catch (error) {
      showToast({ message: `${t("Error fetching relational data")}: ${error}.`, type: "error" });
    }
  };

  const addRecord = async (record: DataRecord) => {
    try {
      // fix user add issue
      const bodyContent = props.tableName == "users" ? record : { data: record };
      const response = await fetch(`${config.strapiUrl}/api/${props.tableName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyContent),
      });
      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `${t("Error adding record")}: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: "error" });
      }
      fetchData();
    } catch (error) {
      showToast({ message: `${t("Error adding record")}: ${error}.`, type: "error" });
    }
  };

  const updateRecord = async (record: DataRecord) => {
    try {
      // fix user roles update issue
      const bodyContent = props.tableName == "users" ? record : { data: record };
      const response = await fetch(`${config.strapiUrl}/api/${props.tableName}/${record.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyContent),
      });
      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `${t("Error updating record")}: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: "error" });
      }
      fetchData();
    } catch (error) {
      showToast({ message: `${t("Error updating record")}: ${error}.`, type: "error" });
    }
  };

  const deleteRecord = async (id: number) => {
    if (!id) return;
    try {
      const response = await fetch(`${config.strapiUrl}/api/${props.tableName}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        showToast({ message: `${t("Error deleting record")}: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: "error" });
      }
      fetchData();
    } catch (error) {
      showToast({ message: `${t("Error deleting record")}: ${error}.`, type: "error" });
    }
  };

  const openConfirmDialog = (id: number) => {
    setRecordToDelete(id);
    setShowConfirmDialog(true);
  };
  
  const closeConfirmDialog = () => {
    setRecordToDelete(null);
    setShowConfirmDialog(false);
  };
  
  const handleConfirmDeletion = async () => {
    if (recordToDelete !== null) {
      await deleteRecord(recordToDelete);
      closeConfirmDialog();
    }
  };

  useEffect(() => {
    fetchData();
    if (props.populateFields?.length) {
      fetchRelationalData();
    }
  }, [props.tableName, props.selectedFields, props.populateFields]);

  const handleEditClick = (record: DataRecord) => {
    setEditingRecord(record);
  };

  const handleFormSubmit = (record: DataRecord) => {
    if (record.id) {
      updateRecord(record);
    } else {
      addRecord(record);
    }
    setEditingRecord(null);
  };

  return (
    <div className="p-4 h-full" role="region" aria-labelledby="data-admin-title">
      <h1 id="data-admin-title" className="text-2xl font-bold mb-4 capitalize" tabIndex={0} role="heading">{t("Data Administration")} - {t(props.tableName.replace("-", " "))}</h1>

      {isLoading ? (
        <p aria-live="polite" aria-busy="true">{t("Loading...")}</p>
      ) : (
        <div className="h-80 overflow-y-auto mb-4">
          <table className="table-auto w-full bg-white shadow-md rounded-lg" role="table">
            <thead>
              <tr role="row">
               {/*  // hide ID field
                <th role="columnheader" scope="col" className="border px-4 py-2">{t("ID")}</th> */}
                <th role="columnheader" scope="col" className="border px-4 py-2">{t("Actions")}</th>
                {fields.map((field) => (
                  <th role="columnheader" scope="col" className="border px-4 py-2 capitalize" key={field}>
                    {field.replace("_", " ")}
                  </th>
                ))}
                {props.populateFields?.map((field) => (
                  <th role="columnheader" scope="col" className="border px-4 py-2 capitalize" key={field.name}>
                    {t(field.name).replace("_", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((record, idx) => (
                <tr key={record.id} className="hover:bg-gray-100 text-center" role="row" aria-label={`${t("Row")} ${idx + 1}`}>
                  {/*  // hide ID field
                  <td className="border px-4 py-2" role="cell">{record.id}</td> */}
                   <td className="border px-4 py-2" role="cell">
                    <button
                      className="text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`${t("Edit record")} ${record.id}`}
                      onClick={() => handleEditClick(record)}
                    >
                      {t("Edit")}
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 ml-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`${t("Delete record")} ${record.id}`}
                      onClick={() => openConfirmDialog(record.id!)}
                    >
                      {t("Delete")}
                    </button>
                  </td>
                  {fields.map((field) => (
                    <td className="border px-4 py-2" role="cell" key={`${record.id}-${field}`}>
                      {typeof record[field] === "boolean"
                        ? record[field]
                          ? "True"
                          : "False"
                        : typeof record[field] === "object" && record[field]
                          ? record[field].name
                        : field == "date" && record[field]
                          ? formatDateTime(record[field])
                      : record[field] || t("N/A")
                          }
                    </td>
                  ))}
                  {props.populateFields?.map((field) => (
                    <td className="border px-4 py-2" role="cell" key={`${record.id}-${field.name}`}>
                      {Array.isArray(record[field.name])
                        ? record[field.name].map((item: any) => item.abbreviation || item.displayValue || item.name).join(", ")
                        : (record[field.name] || t("N/A"))
                      }
                    </td>
                  ))}
                 
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showConfirmDialog && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-description"
        >
          <div className="bg-white p-4 rounded shadow-lg max-w-sm">
            <h2 id="confirm-dialog-title" className="text-lg font-bold mb-4">
              {t("Confirm Deletion")}
            </h2>
            <p id="confirm-dialog-description" className="mb-4">
              {t("Are you sure you want to delete this record? This action cannot be undone.")}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeConfirmDialog}
                className="border-2 border-gray-300 bg-gray-200 text-gray-700 py-1 px-3 rounded hover:bg-gray-300 focus:ring-2 focus:ring-gray-400"
                aria-label={t("Cancel deletion")}
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleConfirmDeletion}
                className="border-2 border-red-500 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500"
                aria-label={t("Confirm deletion")}
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
      <h2 id="record-form-title" className="text-xl font-bold mt-4" tabIndex={0} role="heading">{editingRecord ? t("Edit Record") : t("Add Record")}</h2>
      <div className="h-96 overflow-y-auto">
        <RecordForm
          record={editingRecord}
          onSubmit={handleFormSubmit}
          onCancel={() => setEditingRecord(null)}
          fields={fields}
          optionalFields={props.optionalFields}
          booleanFields={booleanFields}
          relationalFields={props.populateFields?.map((field) => ({
            name: field.name,
            displayField: field.displayField, // Pass display fields for concatenation
            options: relationalData[field.name] || [],
            selectedValue: editingRecord ? editingRecord[`${field.name}_id`] : null,
          }))}
        />
      </div>
    </div>
  );
}