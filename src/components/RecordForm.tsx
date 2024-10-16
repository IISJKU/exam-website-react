import React, { useState, useEffect } from "react";

interface RecordFormProps {
  record: DataRecord | null;
  onSubmit: (record: DataRecord) => void;
  onCancel: () => void;
  fields: string[]; // Fields to render in the form
  booleanFields?: string[]; // Boolean fields to render as dropdowns
  relationalFields?: { name: string; options: any[], selectedValue?: any }[]; // Relational fields with options and selected value
}

interface DataRecord {
  [key: string]: any; // Dynamic fields based on the table
}

const defaultRecord: DataRecord = {};

export default function RecordForm(props: RecordFormProps) {
  const [formData, setFormData] = useState<DataRecord>(defaultRecord);

  // Update formData when record or relationalFields change
  useEffect(() => {
    if (props.record) {
      const initialData = (props.relationalFields ?? []).reduce((acc, field) => {
        acc[field.name] = field.selectedValue || ""; // Set selectedValue or empty string for relational fields
        return acc;
      }, { ...props.record });

      setFormData(initialData); // Set form data to the provided record if available (for editing)
    } else {
      setFormData(defaultRecord); // Set formData with initialized values
    }
  }, [props.record, props.relationalFields]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    props.onSubmit(formData); // Pass the form data to the parent component via onSubmit callback
  };

  const handleCancel = () => {
    setFormData(defaultRecord); // Clear all form fields by resetting formData to default
    props.onCancel(); // Call the parent cancel handler to trigger any external actions
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {props.fields.map((field) => {
        // Check if the field is a boolean field
        if (props.booleanFields?.includes(field)) {
          return (
            <div className="mb-4" key={field}>
              <label className="block text-gray-700 capitalize">
                {field.replace("_", " ")}:
              </label>
              <select
                name={field}
                value={formData[field] !== undefined ? String(formData[field]) : ""}
                onChange={handleChange}
                className="border border-gray-300 p-2 w-full rounded-md"
                required
              >
                <option value="">Select {field}</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          );
        }
        // Check if the field is a relational field
        const relationalField = props.relationalFields?.find(rField => rField.name === field);
        if (relationalField) {
          return (
            <div className="mb-4" key={field}>
              <label className="block text-gray-700 capitalize">
                {relationalField.name.replace("_", " ")}:
              </label>
              <select
                name={relationalField.name}
                value={formData[relationalField.name] || ""}
                onChange={handleChange}
                className="border border-gray-300 p-2 w-full rounded-md"
                required
              >
                <option value="">Select {relationalField.name.charAt(0).toUpperCase() + relationalField.name.slice(1)}</option>
                {relationalField.options.map((option: any) => (
                  <option key={option.id} value={option.id}>
                    {option.name || option.id}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        // render a text input for normal fields
        return (
          <div className="mb-4" key={field}>
            <label className="block text-gray-700 capitalize">
              {field.replace("_", " ")}:
            </label>
            <input
              type="text"
              name={field}
              value={formData[field] || ""}
              onChange={handleChange}
              className="border border-gray-300 p-2 w-full rounded-md"
              required
            />
          </div>
        );
      })}

      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {props.record ? "Update" : "Add"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
