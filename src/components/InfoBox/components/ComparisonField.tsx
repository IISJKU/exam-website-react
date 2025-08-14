import { useState } from "react";
import { useTranslation } from "react-i18next";
import { showToast } from "./ToastMessage";
import { useAuth } from "../../../hooks/AuthProvider";
import EditField from "./EditField";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface ComparisonField {
  label: string;
  options: DropdownOption[];
  value: string | number;
  proposedVal: string | { first_name: string; last_name: string; email: string; phone: string };
  onUpdateExaminer?: (updatedExaminer: { firstName: string; lastName: string; email: string; phone: string }) => void;
}

export default function ComparisonField(props: ComparisonField) {
  const user = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  // Get the label of the currently selected value (if any)
  const selectedOptionLabel = props.options.find((option) => option.value === props.value)?.label || props.value?.toString() || "";
  const isNewExaminer = typeof props.proposedVal === "object";

  const handleEditClick = () => {
    if (typeof props.proposedVal === "object" && props.proposedVal !== null) {
      // If `proposedVal` is an object
      setFirstName(props.proposedVal.first_name || "");
      setLastName(props.proposedVal.last_name || "");
      setEmail(props.proposedVal.email || "");
      setPhone(props.proposedVal.phone || "");
    }
    setIsEditing(true);
  };

  const handleSaveChanges = () => {
    if (!firstName || !lastName) {
      showToast({ message: t("Both first and last name are required"), type: "error" });
      return;
    }
    // Pass updated examiner details to parent
    // Call the onUpdateExaminer prop
    if (props.onUpdateExaminer) {
      props.onUpdateExaminer({
        firstName,
        lastName,
        email,
        phone,
      });
    }
    setIsEditing(false);
    showToast({ message: t("Examiner updated successfully"), type: "success" });
  };

  const renderProposedValue = () => {
    if (typeof props.proposedVal === "object" && props.proposedVal !== null) {
      return `${props.proposedVal.first_name} ${props.proposedVal.last_name} (${t("New Examiner")})`;
    }
    return props.proposedVal;
  };

  return (
    <div
      className="relative w-96"
      role="region" // Defines this as a distinct region for screen readers
      aria-labelledby={`comparison-field-${props.label?.toLowerCase()}`}
    >
      {/* Label for the dropdown */}
      {props.label && (
        <label id={`comparison-field-${props.label?.toLowerCase()}`} className="font-bold">
          {t(props.label)}:
        </label>
      )}

      {/* Current and Proposed Values */}
      <div className="mb-2 ">
        {props.proposedVal ? (
          <>
            <div className="line-through" aria-label={`${t("Current value")}:  ${selectedOptionLabel}`}>
              {selectedOptionLabel}
            </div>
            <div className="text-red-500" aria-label={`${t("Proposed value")}: ${renderProposedValue()}`}>
              {renderProposedValue()}
              {!isEditing ? (
                <>
                  {isNewExaminer && (
                    <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded" onClick={handleEditClick}>
                      {t("Edit")}
                    </button>
                  )}
                </>
              ) : (
                <form className="p-4 border border-gray-300 bg-gray-50" aria-labelledby="add-examiner-form" onSubmit={handleSaveChanges}>
                  <EditField title={t("First Name")} editMode={true} text={firstName} onChange={(e) => setFirstName(e.target.value)} required={true} />
                  <EditField title={t("Last Name")} editMode={true} text={lastName} onChange={(e) => setLastName(e.target.value)} required={true} />
                  <EditField title={t("Email")} type="email" editMode={true} text={email} onChange={(e) => setEmail(e.target.value)} required={true} />
                  <EditField title={t("Phone")} editMode={true} text={phone} onChange={(e) => setPhone(e.target.value)} />
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
                    {t("Save")}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div aria-label={`${t("Current value")}: ${t(selectedOptionLabel)}`}>{t(selectedOptionLabel)}</div>
        )}
      </div>
    </div>
  );
}
