import React, { useState, useEffect } from "react";
import RecordForm from "../../RecordForm";

interface DataAdministrationProps {
  tableName: string;
  selectedFields: string[]; // The fields to display
  populateFields?: { name: string; endpoint: string }[]; // Relational fields and their endpoints
}

// Define the type for your data record
interface DataRecord {
  id?: number;
  [key: string]: any; // Dynamically handle fields
}

export default function DataAdministration(props: DataAdministrationProps) {
  const [data, setData] = useState<DataRecord[]>([]); // Data for the selected table
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fields, setFields] = useState<string[]>(props.selectedFields); // Fields to display
  const [editingRecord, setEditingRecord] = useState<DataRecord | null>(null);
  const [relationalData, setRelationalData] = useState<{ [key: string]: any[] }>({}); // Relational data for dropdowns

  // Fetch data using fetch API, and filter by selected fields
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const query = props.selectedFields.length
        ? props.selectedFields.map((field, index) => `fields[${index}]=${field}`).join("&")
        : "";
      const populateQuery = props.populateFields?.length
        ? `&populate=${props.populateFields.map((field) => field.name).join(",")}`
        : "";

      const response = await fetch(`http://localhost:1337/api/${props.tableName}?${query}${populateQuery}`);
      const result = await response.json();

      if (result && result.data && Array.isArray(result.data)) {
        // Map through the data to format it properly, including relational fields
        const fetchedData = result.data.map((item: any) => {
          const record: DataRecord = { id: item.id, ...item.attributes };

          // Dynamically extract relational fields' names from nested attributes
          props.populateFields?.forEach((field) => {
            if (item.attributes[field.name]?.attributes) {
              record[field.name] = item.attributes[field.name].attributes.name || "N/A"; // Extract 'name' of the relation
              record[`${field.name}_id`] = item.attributes[field.name].attributes.id; // Also store the relation ID
            } else {
              record[field.name] = "N/A"; // Handle missing relational data
            }
          });

          return record;
        });

        setData(fetchedData);
      } else {
        console.error("Invalid API response", result);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    }
    setIsLoading(false);
  };

  // Fetch relational data for dropdowns
  const fetchRelationalData = async () => {
    const relationalPromises = props.populateFields?.map(async (field) => {
      const response = await fetch(`http://localhost:1337/api/${field.endpoint}`);
      const result = await response.json();

      // Extract the relational data from the 'attributes' object
      return {
        fieldName: field.name,
        data: result.data.map((item: any) => ({ id: item.id, ...item.attributes })),
      };
    });

    try {
      const results = await Promise.all(relationalPromises || []);
      const relationalDataObject = results.reduce((acc, { fieldName, data }) => {
        acc[fieldName] = data;
        return acc;
      }, {} as { [key: string]: any[] });
      setRelationalData(relationalDataObject);
    } catch (error) {
      console.error("Error fetching relational data", error);
    }
  };

  const addRecord = async (record: DataRecord) => {
    try {
      await fetch(`http://localhost:1337/api/${props.tableName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: record,
        }),
      });
      fetchData();
    } catch (error) {
      console.error("Error adding record", error);
    }
  };

  const updateRecord = async (record: DataRecord) => {
    try {
      await fetch(`http://localhost:1337/api/${props.tableName}/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: record,
        }),
      });
      fetchData();
    } catch (error) {
      console.error("Error updating record", error);
    }
  };

  const deleteRecord = async (id: number) => {
    if (!id) return;
    try {
      await fetch(`http://localhost:1337/api/${props.tableName}/${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting record", error);
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
      <h1 className="text-2xl font-bold mb-4">Data Administration - {props.tableName}</h1>

      {/* Scrollable table container */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="h-80 overflow-y-auto mb-4"> {/* Set a fixed height and make it scrollable */}
          <table className="table-auto w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                <th className="border px-4 py-2">ID</th>
                {fields.map((field) => (
                  <th className="border px-4 py-2 capitalize" key={field}>{field.replace("_", " ")}</th>
                ))}
                {props.populateFields?.map((field) => (
                  <th className="border px-4 py-2 capitalize" key={field.name}>{(field.name).replace("_", " ")}</th>
                ))}
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr key={record.id} className="hover:bg-gray-100">
                  <td className="border px-4 py-2">{record.id}</td>
                  {fields.map((field) => (
                    <td className="border px-4 py-2" key={`${record.id}-${field}`}>
                      {typeof record[field] === "object" && record[field]?.attributes 
                        ? record[field].attributes.abbreviation 
                        : record[field]}
                    </td>
                  ))}
                  {props.populateFields?.map((field) => (
                    <td className="border px-4 py-2" key={`${record.id}-${field.name}`}>
                      {record[field.name] || "N/A"} {/* Display the populated relational field */}
                    </td>
                  ))}
                  <td className="border px-4 py-2">
                    <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEditClick(record)} disabled={isLoading}>
                      Edit
                    </button>
                    <button className="text-red-500 hover:text-red-700 ml-2" onClick={() => deleteRecord(record.id!)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Scrollable form container */}
      <h2 className="text-xl font-bold mt-4">{editingRecord ? "Edit Record" : "Add New Record"}</h2>
      <div className="h-96 overflow-y-auto"> {/* Set a fixed height and make the form scrollable */}
        <RecordForm
          record={editingRecord}
          onSubmit={handleFormSubmit}
          onCancel={() => setEditingRecord(null)}
          fields={fields}
          relationalFields={props.populateFields?.map((field) => ({
            name: field.name,
            options: relationalData[field.name] || [],
            selectedValue: editingRecord ? editingRecord[`${field.name}_id`] : null, // Pass the selected relational field ID
          }))}
        />
      </div>
    </div>
  );
}
