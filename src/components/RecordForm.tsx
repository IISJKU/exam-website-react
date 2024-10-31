import React, { useState, useEffect } from "react";

interface RecordFormProps {
  record: DataRecord | null;
  onSubmit: (record: DataRecord) => void;
  onCancel: () => void;
  fields: string[];
  optionalFields?: string[];
  booleanFields?: string[];
  relationalFields?: { name: string; options: any[], selectedValue?: any, displayField: string[] }[];
}

interface DataRecord {
  [key: string]: any;
}

const defaultRecord: DataRecord = {};

export default function RecordForm(props: RecordFormProps) {
  const [formData, setFormData] = useState<DataRecord>(defaultRecord);
  const [role, setRole] = useState(formData.role || "");

  useEffect(() => {
    if (props.record) {
      const initialData = (props.relationalFields ?? []).reduce((acc, field) => {
        acc[field.name] = field.selectedValue || "";
        return acc;
      }, { ...props.record });

      setFormData(initialData);

      // Find the role value in relationalFields if it exists
      const roleField = props.relationalFields?.find((field) => field.name === "role");
      const roleValue = roleField?.options.find((option) => option.id === initialData.role)?.displayValue.toLowerCase() || "";
      setRole(roleValue); // Initialize role state if role field exists

    } else {
      setFormData(defaultRecord);
    }
  }, [props.record, props.relationalFields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    let roleText = value;
  
    // If the target is a select element and the field name is 'role', get the selected option's display text
    if (e.target instanceof HTMLSelectElement && name === "role") {
      roleText = e.target.selectedOptions[0]?.text.toLowerCase() || "";
    }
  
    setFormData((prev) => {
      if (name === "role") {
        return {
          ...prev,
          [name]: value,
          student: roleText === "student" ? prev.student : null,
          tutor: roleText === "tutor" ? prev.tutor : null,
        };
      }
  
      // For other fields, just update normally
      return {
        ...prev,
        [name]: value,
      };
    });
  
    // Update role state if the field name is 'role'
    if (name === "role") {
      setRole(roleText);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare formData to avoid empty strings for relational fields
    const sanitizedData = {
      ...formData,
      student: formData.student || null,
      tutor: formData.tutor || null,
    };

    props.onSubmit(sanitizedData);
    setFormData(defaultRecord); 
    setRole("");
  };

  const handleCancel = () => {
    setFormData(defaultRecord);
    setRole("");
    props.onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {props.fields.map((field) => {
        const isRequired = !(props.optionalFields ?? []).includes(field);

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
                required={isRequired}
              >
                <option value="">Select {field}</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          );
        }

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
              required={isRequired}
            />
          </div>
        );
      })}

      {/* Render relational fields */}
      {(props.relationalFields ?? [])
        .filter(field => !props.fields.includes(field.name))
        .map((field) => {
          const isRequired = !(props.optionalFields ?? []).includes(field.name);

          // Enable only 'student' field if role is 'student' and only 'tutor' field if role is 'tutor'
          const isDisabled =
            (field.name === "student" && role !== "student") ||
            (field.name === "tutor" && role !== "tutor");

          return (
            <div className="mb-4" key={field.name}>
              <label className="block text-gray-700 capitalize">
                {field.name.replace("_", " ")}:
              </label>
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className={`border border-gray-300 p-2 w-full rounded-md ${isDisabled ? "opacity-50" : ""}`}
                disabled={isDisabled}
                required={isRequired}
              >
                <option value="">
                  Select {(field.name.charAt(0).toUpperCase() + field.name.slice(1)).replace("_", " ")}
                </option>
                {field.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.displayValue}
                  </option>
                ))}
              </select>
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
