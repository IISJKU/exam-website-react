import React, { useState, useEffect } from "react";
import DateField from "./InfoBox/components/DateField";
import { sendEmail } from "../services/EmailService";
import { useAuth } from "../hooks/AuthProvider";
import moment from "moment";
import { useTranslation } from "react-i18next";
import EnumSelector from "./InfoBox/components/EnumSelector";
import { InDistrbutionList, PresenceMultimedia } from "./classes/Student";
import { ContractCompleted, ContractType, DistributionList } from "./classes/Tutor";
import { ExamStatus } from "./classes/Exam";
import MultiSelect from "./InfoBox/components/MultiSelect";
import { dropdownOptions } from "./InfoBox/views/ExamEditor";

interface RecordFormProps {
  record: DataRecord | null;
  onSubmit: (record: DataRecord) => void;
  onCancel: () => void;
  fields: string[];
  optionalFields?: string[];
  booleanFields?: string[];
  relationalFields?: { name: string; options: any[]; selectedValue?: any; displayField: string[] }[];
}

interface DataRecord {
  [key: string]: any;
  student_email?: string | null;
  tutor_email?: string | null;
}

const defaultRecord: DataRecord = {};

export default function RecordForm(props: RecordFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<DataRecord>(defaultRecord);
  const [role, setRole] = useState(formData.role || "");
  const user = useAuth();

  useEffect(() => {
    if (props.record) {
      const initialData = (props.relationalFields ?? []).reduce(
        (acc, field) => {
          acc[field.name] = field.selectedValue || "";
          return acc;
        },
        { ...props.record }
      );

      setFormData(initialData);

      // Find the role value in relationalFields if it exists
      const roleField = props.relationalFields?.find((field) => field.name === "role");
      const roleValue = roleField?.options.find((option) => option.id === initialData.role)?.displayValue?.toLowerCase() || "";
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
      return { ...prev, [name]: value };
    });

    // Update role state if the field name is 'role'
    if (name === "role") {
      setRole(roleText);
    }
  };

  function matchValue(options: any[], value: any): string {
    if (!value || !options) return t("N/A");
    const item = options.find((option) => option.id === Number(value));
    return item ? item.displayValue : t("N/A");
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
    const generateRow = (fieldName: string, oldValue: any, newValue: any) => {
      const prev = oldValue || t("N/A");
      const next = newValue || prev;
      const nextStyle = prev !== next ? `<span style="color: red; font-weight: bold;">${next}</span>` : next;

      return `
        <tr>
          <td style="padding: 8px;">${t(fieldName)}</td>
          <td style="padding: 8px;">${prev}</td>
          <td style="padding: 8px;">${nextStyle}</td>
        </tr>
      `;
    };

    return `
      <h3>${t("Exam Changes")}</h3>
      <p>${t("The following changes have been made")}:</p>
      <table border="1" style="border-collapse: collapse; width: 70%;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left;">${t("Field")}</th>
            <th style="padding: 8px; text-align: left;">${t("Old")}</th>
            <th style="padding: 8px; text-align: left;">${t("New")}</th>
          </tr>
        </thead>
        <tbody>
          ${generateRow(t("Title"), oldData?.title, newData?.title)}
          ${generateRow(t("LVA Number"), oldData?.lva_num, newData?.lva_num)}
          ${generateRow(
            t("Date"),
            oldData?.date ? moment(oldData.date).format("DD.MM.YYYY HH:mm") : "N/A",
            newData?.date ? moment(newData.date).format("DD.MM.YYYY HH:mm") : oldData?.date ? moment(oldData.date).format("DD.MM.YYYY HH:mm") : "N/A"
          )}
          ${generateRow(t("Duration"), oldData?.duration, newData?.duration)}
          ${generateRow(t("Student"), matchValue(options.student, oldData?.student_id), matchValue(options.student, newData?.student))}
          ${generateRow(t("Tutor"), matchValue(options.tutor, oldData?.tutor_id), matchValue(options.tutor, newData?.tutor))}
          ${generateRow(t("Examiner"), matchValue(options.examiner, oldData?.examiner_id), matchValue(options.examiner, newData?.examiner))}
          ${generateRow(t("Major"), matchValue(options.major, oldData?.major_id), matchValue(options.major, newData?.major))}
          ${generateRow(t("Institute"), matchValue(options.institute, oldData?.institute_id), matchValue(options.institute, newData?.institute))}
          ${generateRow(t("Mode"), matchValue(options.exam_mode, oldData?.exam_mode_id), matchValue(options.exam_mode, newData?.exam_mode))}
          ${generateRow(t("Room"), matchValue(options.room, oldData?.room_id), matchValue(options.room, newData?.room))}
          ${generateRow(t("Notes"), oldData?.notes, newData?.notes)}
          ${generateRow(t("Status"), oldData?.status, newData?.status)}
        </tbody>
      </table>
    `;
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
              subject: t("Exam Update Notification"),
              text: t("The following exam details have been updated."),
              html: changesHtml,
              token: user.token,
            })
          );
        }
        if (studentEmail) {
          emailPromises.push(
            sendEmail({
              to: studentEmail,
              subject: t("Exam Update Notification"),
              text: t("The following exam details have been updated."),
              html: changesHtml,
              token: user.token,
            })
          );
        }
        await Promise.all(emailPromises);
      } catch (error) {
        console.error(t("Error sending emails"), error);
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

 /*  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = event.target.value;
    const currentTime = moment.utc(formData.date).format("HH:mm:ss"); // Preserve time, use UTC
    console.log("selected selectedDate "+ selectedDate )

    // Combine date and time in ISO format
    const updatedDate = selectedDate;  //currentTime ? moment(`${selectedDate}T${currentTime}`, "YYYY-MM-DDTHH:mm:ss").utc().toISOString() : selectedDate;
    setFormData((prev) => ({ ...prev, date: updatedDate }));
  }; */

  const handleDateChange = (fieldName: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
  const selectedDate = event.target.value;
  setFormData((prev) => ({ ...prev, [fieldName]: selectedDate }));
};


  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = event.target.value;
    const currentDate = moment.utc(formData.date).format("YYYY-MM-DD"); // Preserve date, use UTC
    // Combine date and time in ISO format
    const updatedDate = moment(`${currentDate}T${selectedTime}`, "YYYY-MM-DDTHH:mm:ss").utc().toISOString() ;
    setFormData((prev) => ({ ...prev, date: updatedDate }));
  };

  return (
    <form onSubmit={handleSubmit} aria-labelledby="record-form-title" className="mt-4">
      <h1 id="record-form-title" className="text-xl mb-4 sr-only">
        {props.record ? t("Update Record") : t("Add New Record")}
      </h1>

      {props.fields.map((field) => {
        const isRequired = !(props.optionalFields ?? []).includes(field);
        const errorId = `${field}-error`;

        if (props.booleanFields?.includes(field)) {
          return (
            <div className="mb-4" key={field}>
              <label id={`${field}-label`} htmlFor={field} className="block text-gray-700 capitalize">
                {t(field.replace("_", " "))}:
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
        const handleEnumChange = (fieldName: string, newValue: any) => {
          setFormData((prev) => ({
            ...prev,
            [fieldName]: newValue,
          }));
        };

        const fieldComponents: Record<string, JSX.Element> = {
          date: <DateField editMode={true}  dateValue={formData.date} onDateChange={handleDateChange("date")} onTimeChange={handleTimeChange} />,
          salto_access: <DateField editMode={true}  dateValue={formData.salto_access} onDateChange={handleDateChange("salto_access")} />,
          status: <EnumSelector value={formData[field] || ""} onChange={(v) => handleEnumChange(field, v)} options={Object.values(ExamStatus)} />,
          in_distribution_list: (
            <EnumSelector value={formData[field] || ""} onChange={(v) => handleEnumChange(field, v)} options={Object.values(InDistrbutionList)} />
          ),
          presence_multimedia: (
            <EnumSelector value={formData[field] || ""} onChange={(v) => handleEnumChange(field, v)} options={Object.values(PresenceMultimedia)} />
          ),
          contract_type: <EnumSelector value={formData[field] || ""} onChange={(v) => handleEnumChange(field, v)} options={Object.values(ContractType)} />,
          contract_completed: (
            <EnumSelector value={formData[field] || ""} onChange={(v) => handleEnumChange(field, v)} options={Object.values(ContractCompleted)} />
          ),
          distribution_list: (
            <EnumSelector value={formData[field] || ""} onChange={(v) => handleEnumChange(field, v)} options={Object.values(DistributionList)} />
          ),
        };

        return (
          <div className="mb-4" key={field}>
            <label id={`${field}-label`} htmlFor={field} className="block text-gray-700 capitalize">
              {t(field.replace("_", " "))}:
            </label>
            {fieldComponents[field] ?? (
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
              />
            )}
          </div>
        );
      })}

      {/* Render relational fields */}
      {(props.relationalFields ?? [])
        .filter((field) => !props.fields.includes(field.name))
        .map((field) => {
          const isRequired = !(props.optionalFields ?? []).includes(field.name);
          const containsRoleField = props.relationalFields?.some((field) => field.name === "role");
          // Enable only 'student' field if role is 'student' and only 'tutor' field if role is 'tutor'
          const isDisabled = containsRoleField && ((field.name === "student" && role !== "student") || (field.name === "tutor" && role !== "tutor"));

          return (
            <div className="mb-4" key={field.name}>
              <label id={`${field}-label`} htmlFor={field.name} className="block text-gray-700 capitalize">
                {t(field.name.replace("_", " "))}:
              </label>
              {field.name === "disability_types" ? (
                <MultiSelect
                  options={dropdownOptions(field.options, "displayValue")}
                  value={
                    Array.isArray(formData[field.name])
                      ? formData[field.name].map((item: any) => (typeof item === "object" && item !== null ? item.id : item))
                      : []
                  }
                  onChange={(selectedIds) => {
                    setFormData((prev) => ({
                      ...prev,
                      [field.name]: field.options.filter((option) => selectedIds.includes(option.id)),
                    }));
                  }}
                  placeholder={t("Select Disability Types")}
                  aria-label={t("Edit student disability types")}
                />
              ) : (
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
                  <option value="">Select {(field.name.charAt(0).toUpperCase() + field.name.slice(1)).replace("_", " ")}</option>
                  {field.options.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.displayValue}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}

      <div className="flex justify-between">
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:bg-blue-700"
          aria-label={props.record ? t("Update Record") : t("Add New Record")}
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
