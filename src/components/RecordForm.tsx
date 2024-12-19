import React, { useState, useEffect } from "react";
import DateField from "./InfoBox/components/DateField";
import { t } from "i18next";
import { sendEmail } from "../services/EmailService";
import { useAuth } from "../hooks/AuthProvider";
import { match } from "./InfoBox/views/IndividualNotification";
import moment from "moment";
import StatusSelector from "./InfoBox/components/StatusSelector";

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
  student_email?: string | null;
  tutor_email?: string | null;
}

const defaultRecord: DataRecord = {};

export default function RecordForm(props: RecordFormProps) {
  const [formData, setFormData] = useState<DataRecord>(defaultRecord);
  const [role, setRole] = useState(formData.role || "");
  const user = useAuth();

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

  function matchValue(options: any[], value: any): string {
    if (!value || !options) return "N/A";
    const item = options.find((option) => option.id === Number(value));
    return item ? item.displayValue : "N/A";
  }

  function getEmail(options: any[], selectedId: number): string | null {
    if (!options || !selectedId) return null;
  
    const selectedItem = options.find((option) => option.id === Number(selectedId));
    if (!selectedItem) return null;
  
    // Check for 'student_email' directly
    if (selectedItem.email) {
      return selectedItem.email;
    }
  
    // Check for nested 'user' email
    if (selectedItem.user?.data?.attributes?.email) {
      return selectedItem.user.data.attributes.email;
    }
  
    return null;
  }
  

  function generateChangesHtml(oldData: any, newData: any, options: any): string {
    console.log('old'+ JSON.stringify(oldData))
    console.log('new'+ JSON.stringify(newData))
    const generateRow = (fieldName: string, oldValue: any, newValue: any) => {
      const prev = oldValue || "N/A";
      const next = newValue || prev;
      const nextStyle = prev !== next ? `<span style="color: red; font-weight: bold;">${next}</span>` : next;
  
      return `
        <tr>
          <td style="padding: 8px;">${fieldName}</td>
          <td style="padding: 8px;">${prev}</td>
          <td style="padding: 8px;">${nextStyle}</td>
        </tr>
      `;
    };
  
    return `
      <h3>Exam Changes</h3>
      <p>The following changes have been made:</p>
      <table border="1" style="border-collapse: collapse; width: 70%;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left;">Field</th>
            <th style="padding: 8px; text-align: left;">Old</th>
            <th style="padding: 8px; text-align: left;">New</th>
          </tr>
        </thead>
        <tbody>
          ${generateRow("Title", oldData?.title, newData?.title)}
          ${generateRow("LVA Number", oldData?.lva_num, newData?.lva_num)}
          ${generateRow("Date", oldData?.date ? moment(oldData.date).format("DD.MM.YYYY HH:mm") : "N/A",
            newData.date ? moment(newData.date).format("DD.MM.YYYY HH:mm") : moment(oldData.date).format("DD.MM.YYYY HH:mm"))}
          ${generateRow("Duration", oldData?.duration, newData?.duration)}
          ${generateRow("Student", matchValue(options.student, oldData?.student_id), matchValue(options.student, newData?.student))}
          ${generateRow("Tutor", matchValue(options.tutor, oldData?.tutor_id), matchValue(options.tutor, newData?.tutor))}
          ${generateRow("Examiner", matchValue(options.examiner, oldData?.examiner_id), matchValue(options.examiner, newData?.examiner))}
          ${generateRow("Major", matchValue(options.major, oldData?.major_id), matchValue(options.major, newData?.major))}
          ${generateRow("Institute", matchValue(options.institute, oldData?.institute_id), matchValue(options.institute, newData?.institute))}
          ${generateRow("Mode", matchValue(options.exam_mode, oldData?.exam_mode_id), matchValue(options.exam_mode, newData?.exam_mode))}
          ${generateRow("Room", matchValue(options.room, oldData?.room_id), matchValue(options.room, newData?.room))}
          ${generateRow("Notes", oldData?.notes, newData?.notes)}
          ${generateRow("Status", oldData?.status, newData?.status)}
        </tbody>
      </table>
    `;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(formData);
    e.preventDefault();

    const sanitizedData: DataRecord = {
      ...formData,
      student: formData.student || null,
      tutor: formData.tutor || null,
    };
  
    const options = props.relationalFields?.reduce((acc, field) => {
      acc[field.name] = field.options ?? [];
      return acc;
    }, {} as Record<string, any[]>);

    // retrieve the student and tutor emails
    const studentEmail = getEmail(options?.student ?? [], sanitizedData.student);
    const tutorEmail = getEmail(options?.tutor ?? [], sanitizedData.tutor);

    // Assign the emails to sanitizedData
    sanitizedData.student_email = studentEmail || null;
    sanitizedData.tutor_email = tutorEmail || null;

    const changesHtml = generateChangesHtml(props.record, sanitizedData, options);

    props.onSubmit(sanitizedData);
  
    if (props.record) {
      try {
        const emailPromises = [];
        if (tutorEmail) {
          emailPromises.push(
            sendEmail({
              to: tutorEmail,
              subject: "Exam Update Notification",
              text: "The exam details have been updated.",
              html: changesHtml,
              token: user.token,
            })
          );
        }
        if (studentEmail) {
          emailPromises.push(
            sendEmail({
              to: studentEmail,
              subject: "Exam Update Notification",
              text: "The exam details have been updated.",
              html: changesHtml,
              token: user.token,
            })
          );
        }
        await Promise.all(emailPromises);
        console.log("Emails sent successfully!");
      } catch (error) {
        console.error("Error sending emails:", error);
      }
    }
  
    setFormData(defaultRecord);
    setRole("");
  };  

  const handleCancel = () => {
    setFormData(defaultRecord);
    setRole("");
    props.onCancel();
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    const currentTime = moment.utc(formData.date).format("HH:mm:ss"); // Preserve time, use UTC
  
    // Combine date and time in ISO format
    const updatedDate = moment(`${selectedDate}T${currentTime}`, "YYYY-MM-DDTHH:mm:ss").utc().toISOString();
    setFormData((prev) => ({ ...prev, date: updatedDate }));
  };
  
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = event.target.value;
    const currentDate = moment.utc(formData.date).format("YYYY-MM-DD"); // Preserve date, use UTC
  
    // Combine date and time in ISO format
    const updatedDate = moment(`${currentDate}T${selectedTime}`, "YYYY-MM-DDTHH:mm:ss").utc().toISOString();
    setFormData((prev) => ({ ...prev, date: updatedDate }));
  };

  return (
    <form onSubmit={handleSubmit} aria-labelledby="record-form-title" className="mt-4">

      {props.fields.map((field) => {
        const isRequired = !(props.optionalFields ?? []).includes(field);
        const errorId = `${field}-error`;

        if (props.booleanFields?.includes(field)) {
          return (
            <div className="mb-4" key={field}>
              <label id={`${field}-label`} htmlFor={field} className="block text-gray-700 capitalize">
                {field.replace("_", " ")}:
              </label>
              <select
                id={field}
                name={field}
                value={formData[field] !== undefined ? String(formData[field]) : ""}
                onChange={handleChange}
                className="border border-gray-300 p-2 w-full rounded-md"
                required={isRequired}
                aria-required={isRequired}
                aria-labelledby={`${field}-label`}
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
            <label id={`${field}-label`} htmlFor={field} className="block text-gray-700 capitalize">
              {field.replace("_", " ")}:
            </label>
            {field === "date" ? (
            <DateField editMode={true} dateValue={formData[field]} onDateChange={handleDateChange} onTimeChange={handleTimeChange} />
            ) : field === "status" ? (
              <StatusSelector
                value={formData[field] || ""}
                onChange={(newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    [field]: newValue,
                  }));
                }}
              />
            ) : (
              <input
                type="text"
                id={field}
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
                className="border border-gray-300 p-2 w-full rounded-md"
                required={isRequired}
                min="3"
                aria-required={isRequired}
                aria-describedby={isRequired ? errorId : undefined}
            /> )}
          </div>
        );
      })}

      {/* Render relational fields */}
      {(props.relationalFields ?? [])
        .filter(field => !props.fields.includes(field.name))
        .map((field) => {
          const isRequired = !(props.optionalFields ?? []).includes(field.name);
          const containsRoleField = props.relationalFields?.some(
            (field) => field.name === "role"
          );
          // Enable only 'student' field if role is 'student' and only 'tutor' field if role is 'tutor'
          const isDisabled =
          (containsRoleField) &&
          ((field.name === "student" && role !== "student") ||
           (field.name === "tutor" && role !== "tutor"));

          return (
            <div className="mb-4" key={field.name}>
              <label id={`${field}-label`} htmlFor={field.name} className="block text-gray-700 capitalize">
                {field.name.replace("_", " ")}:
              </label>
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={handleChange}
                className={`border border-gray-300 p-2 w-full rounded-md ${isDisabled ? "opacity-50" : ""}`}
                disabled={isDisabled}
                required={isRequired}
                aria-required={isRequired}
                aria-labelledby={`${field.name}-label`}
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
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
          aria-label={props.record ? "Update record" : "Add record"}
        >
          {props.record ? t("Update") : t("Add")}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700"
          aria-label={t("Cancel form")}
        >
          {t("Cancel")}
        </button>
      </div>
    </form>
  );
}