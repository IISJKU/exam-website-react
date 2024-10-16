import React, { useState, useEffect } from "react";
import RecordForm from "../../RecordForm";
import { showToast } from "../components/ToastMessage";

interface DataAdministrationProps {
  tableName: string;
  selectedFields: string[]; // The fields to display
  populateFields?: { name: string; populateTable: string; displayField: string }[]; // Relational fields, their tableName, and the display field
}

// Define the type for your data record
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

  // Fetch data using fetch API, and filter by selected fields
  const fetchData = async () => {
    // Clear the table by resetting the data and fields
    setData([]); // Reset the data to clear the table before fetching new data
    setFields([]); // Clear the fields
    setIsLoading(true); // Indicate that loading is in progress

    try {
      const query = props.selectedFields.length ? props.selectedFields.map((field, index) => `fields[${index}]=${field}`).join("&") : "";
      const populateQuery = props.populateFields?.length ? `&populate=${props.populateFields.map((field) => field.name).join(",")}` : "";

      const response = await fetch(`http://localhost:1337/api/${props.tableName}?${query}${populateQuery}`);
      const result = await response.json();

      if (result && Array.isArray(result)) {
        // Map through the data to format it properly, including relational fields
        const fetchedData = result.map((item: any) => {
          const record: DataRecord = { id: item.id, ...item };

          // Dynamically extract relational fields' names from nested attributes
          props.populateFields?.forEach((field) => {
            if (item[field.name]) {
              record[field.name] = item[field.name][field.displayField] || "N/A"; // Extract the specified 'displayField' from the relation
              record[`${field.name}_id`] = item[field.name].id; // Also store the relation ID
            } else {
              record[field.name] = "N/A"; // Handle missing relational data
            }
          });

          return record;
        });

        setData(fetchedData);
        setFields(props.selectedFields); // Reset the fields after fetching
      } else {
        showToast({ message: `Invalid API response: ${result}.`, type: 'error' });

      }
    } catch (error) {
      showToast({ message: `Error fetching data: ${error}.`, type: 'error' });

    }
    setIsLoading(false); // Data fetching is complete
  };

  // Fetch relational data for dropdowns
const fetchRelationalData = async () => {
  const relationalPromises = props.populateFields?.map(async (field) => {
    const response = await fetch(`http://localhost:1337/api/${field.populateTable}`);
    const result = await response.json();

    // Check if result is an array directly
    if (Array.isArray(result)) {
      return {
        fieldName: field.name,
        data: result.map((item: any) => ({
          id: item.id,
          [field.displayField]: item[field.displayField], // Use the displayField to get the appropriate field from the result directly
        })),
      };
    } else {
      throw new Error(`Invalid response format for ${field.populateTable}`);
    }
  });

  try {
    const results = await Promise.all(relationalPromises || []);
    const relationalDataObject = results.reduce((acc, { fieldName, data }) => {
      acc[fieldName] = data; // Fix: Use `data` instead of `results`
      return acc;
    }, {} as { [key: string]: any[] });
    
    setRelationalData(relationalDataObject);
  } catch (error) {
    showToast({ message: `Error fetching relational data: ${error}.`, type: 'error' });
  }
};


  const addRecord = async (record: DataRecord) => {
    try {
      await fetch(`http://localhost:1337/api/${props.tableName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `5bad2121f82b63a7e0ba19074b66b646228a9903a550bdca6ae721ba2996be07c4afa42d15dbc1b3ac3b43cf8fc33408c9f730e3aa76533b8fe19e01acd140df0407a55d58f842dc4adc72f940c8517b6f5431ca7b5e0496eb70321c56e378ce61c99b0b52e8367aeaa7cda748961e9edee3dcb9cccd1d905260de298e8eb012`,
        },
        body: JSON.stringify({
          data: record,
        }),
      });
      fetchData();
    } catch (error) {
      showToast({ message: `Error adding record: ${error}.`, type: 'error' });
    }
  };

  const updateRecord = async (record: DataRecord) => {
    try {
      await fetch(`http://localhost:1337/api/${props.tableName}/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `5bad2121f82b63a7e0ba19074b66b646228a9903a550bdca6ae721ba2996be07c4afa42d15dbc1b3ac3b43cf8fc33408c9f730e3aa76533b8fe19e01acd140df0407a55d58f842dc4adc72f940c8517b6f5431ca7b5e0496eb70321c56e378ce61c99b0b52e8367aeaa7cda748961e9edee3dcb9cccd1d905260de298e8eb012`,
        },
        body: JSON.stringify({
          data: record,
        }),
      });
      fetchData();
    } catch (error) {
      showToast({ message: `Error updating record: ${error}.`, type: 'error' });
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
      showToast({ message: `Error deleting record: ${error}.`, type: 'error' });
    }
  };

  // Clear data and fetch new data when the tableName or fields change
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
                <tr key={record.id} className="hover:bg-gray-100 text-center">
                  <td className="border px-4 py-2">{record.id}</td>
                  {fields.map((field) => (
                    <td className="border px-4 py-2" key={`${record.id}-${field}`}>
                      {/* Handle boolean fields and relational objects */}
                      {typeof record[field] === "boolean" 
                        ? record[field] ? "True" : "False" // Display "True"/"False" for boolean fields
                        : typeof record[field] === "object" && record[field] 
                          ? record[field].name 
                          : record[field] || "N/A"} {/* Handle non-boolean fields */}
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
