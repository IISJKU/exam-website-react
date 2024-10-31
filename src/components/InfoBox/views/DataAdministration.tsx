import React, { useState, useEffect, useMemo } from "react";
import RecordForm from "../../RecordForm";
import { showToast } from "../components/ToastMessage";
import { useAuth } from "../../../hooks/AuthProvider";

interface DataAdministrationProps {
  tableName: string;
  selectedFields: string[]; // The fields to display
  optionalFields?: string[]; 
  populateFields?: { name: string; populateTable: string; displayField: string[] }[]; // Relational fields, their tableName, and the display fields
}

interface DataRecord {
  id?: number;
  [key: string]: any; // Dynamically handle fields
}

export default function DataAdministration(props: DataAdministrationProps) {
  const [data, setData] = useState<DataRecord[]>([]); // Data for the selected table
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fields, setFields] = useState<string[]>([]); // Fields to display
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [relationalData, setRelationalData] = useState<{ [key: string]: any[] }>({}); // Relational data for dropdowns
  const [booleanFields, setBooleanFields] = useState<string[]>([]); // Boolean fields
  const user = useAuth();

  const fetchData = async () => {
    setData([]);
    setFields([]);
    setIsLoading(true);

    try {
      // Exclude 'password' from selectedFields if tableName is 'users'
      const filteredFields = props.tableName === "users" ? props.selectedFields.filter(field => field !== "password") : props.selectedFields;
      const query = filteredFields.length ? filteredFields.map((field, index) => `fields[${index}]=${field}`).join("&") : "";
      const populateQuery = props.populateFields?.length ? `&populate=${props.populateFields.map((field) => field.name).join(",")}` : "";

      const response = await fetch(`http://localhost:1337/api/${props.tableName}?${query}${populateQuery}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
       showToast({ message: `HTTP error! Status: ${response.status}, Message: ${result.error.message || "Unknown error"}.`, type: "error", });
      }

      if (result && Array.isArray(result)) {
        const fetchedData = result.map((item: any) => {
          const record: DataRecord = { id: item.id, ...item };

          // Identify boolean fields dynamically
          const detectedBooleanFields: string[] = [];
          filteredFields.forEach((field) => {
            if (typeof item[field] === "boolean") {
              detectedBooleanFields.push(field);
            }
          });

          setBooleanFields(detectedBooleanFields);

          // Handle relational fields
          props.populateFields?.forEach((field) => {
            if (item[field.name]) {
              // Concatenate multiple display fields
              const displayValue = field.displayField
                .map((df) => item[field.name][df])
                .filter(Boolean)
                .join(" ");
              record[field.name] = displayValue || "N/A";
              record[`${field.name}_id`] = item[field.name].id;
            } else {
              record[field.name] = "N/A";
            }
          });

          return record;
        });

        // Add 'password' back to fields for users form, if applicable
        const finalFields = props.tableName === "users" ? [...filteredFields, "password"] : filteredFields;

        setData(fetchedData);
        setFields(finalFields);  // Include 'password' for form fields if table is 'users'
      } else {
        showToast({ message: `Invalid API response: ${result}.`, type: "error" });
      }
    } catch (error) {
      showToast({ message: `Error fetching data: ${error}.`, type: "error" });
    }
    setIsLoading(false);
  };


  // Fetch relational data for dropdowns
  const fetchRelationalData = async () => {
    const relationalPromises = props.populateFields?.map(async (field) => {
      const response = await fetch(`http://localhost:1337/api/${field.populateTable}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const result = await response.json();

      if (!response.ok) {
       showToast({ message: `HTTP error! Status: ${response.status}, Message: ${result.error.message || "Unknown error"}.`, type: "error", });
      }
      
      // fix user roles update issue 
      const records = result.roles || result; // If roles array exists, use it; otherwise use result

      if (Array.isArray(records)) {
        return {
          fieldName: field.name,
          data: records.map((item: any) => ({
            id: item.id,
            // Concatenate display fields for dropdown options
            displayValue: field.displayField
              .map((df) => item[df])
              .filter(Boolean)
              .join(" "),
          })),
        };
      } else {
        throw new Error(`Invalid response format for ${field.populateTable}`);
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
      showToast({ message: `Error fetching relational data: ${error}.`, type: "error" });
    }
  };

  const addRecord = async (record: DataRecord) => {
    try {
       // fix user add issue 
       const bodyContent = props.tableName == "users" ? record : { data: record };
       const response = await fetch(`http://localhost:1337/api/${props.tableName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyContent),
       });
       if (!response.ok) {
          const errorData = await response.json();
         showToast({ message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: "error", });
        }
      fetchData();
    } catch (error) {
      showToast({ message: `Error adding record: ${error}.`, type: "error" });
    }
  };

  const updateRecord = async (record: DataRecord) => {
    try { 
      // fix user roles update issue 
      const bodyContent = props.tableName == "users" ? record : { data: record };
      const response = await fetch(`http://localhost:1337/api/${props.tableName}/${record.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyContent),
      });
      if (!response.ok) {
        const errorData = await response.json();
       showToast({ message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: "error", });
      }
      fetchData();
    } catch (error) {
      showToast({ message: `Error updating record: ${error}.`, type: "error" });
    }
  };

  const deleteRecord = async (id: number) => {
    if (!id) return;
    try {
      const response = await fetch(`http://localhost:1337/api/${props.tableName}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
       showToast({ message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`, type: "error", });
      }
      fetchData();
    } catch (error) {
      showToast({ message: `Error deleting record: ${error}.`, type: "error" });
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
    <div className="p-4 h-full">
      <h1 className="text-2xl font-bold mb-4 capitalize">Data Administration - {props.tableName.replace("-", " ")}</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="h-80 overflow-y-auto mb-4">
          <table className="table-auto w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="border px-4 py-2">ID</th>
                {fields.map((field) => (
                  <th className="border px-4 py-2 capitalize" key={field}>
                    {field.replace("_", " ")}
                  </th>
                ))}
                {props.populateFields?.map((field) => (
                  <th className="border px-4 py-2 capitalize" key={field.name}>
                    {field.name.replace("_", " ")}
                  </th>
                ))}
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr key={record.id} className="hover:bg-gray-100 text-center">
                  <td className="border px-4 py-2">{record.id}</td>
                  {fields.map((field) => (
                    <td className="border px-4 py-2" key={`${record.id}-${field}`}>
                      {typeof record[field] === "boolean"
                        ? record[field]
                          ? "True"
                          : "False"
                        : typeof record[field] === "object" && record[field]
                        ? record[field].name
                        : record[field] || "N/A"}
                    </td>
                  ))}
                  {props.populateFields?.map((field) => (
                    <td className="border px-4 py-2" key={`${record.id}-${field.name}`}>
                      {record[field.name] || "N/A"}
                    </td>
                  ))}
                  <td className="border px-4 py-2">
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEditClick(record)}>
                      Edit
                    </button>
                    <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => deleteRecord(record.id!)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="text-xl font-bold mt-4">{editingRecord ? "Edit Record" : "Add New Record"}</h2>
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