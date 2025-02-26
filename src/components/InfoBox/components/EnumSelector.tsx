import React from "react";
import { useTranslation } from "react-i18next";

interface EnumSelectorProps<T> {
  title: string; 
  value: T;
  disabled?: boolean;
  onChange: (newValue: T) => void;
  options: T[];
  description?: string;
}

export default function EnumSelector<T>(props: EnumSelectorProps<T>) {
  const { t } = useTranslation();

  // Determine the class list based on whether a title is provided
  let classList = props.title ? "flex flex-col relative w-96 mt-1" : "flex flex-col relative w-full";

  return (
    <div className={classList}>
      {/* Title */}
      {props.title && (
        <label htmlFor={t(props.title)} className="font-bold" id={t(props.title) + "-" + t("label")}>
          {t(props.title)}
        </label>
      )}

      {/* Description */}
      {props.description && (
        <p id={t(props.title) + "-" + t("description")} className="text-sm text-gray-500">
          {t(props.description)}
        </p>
      )}

      {/* Disabled State */}
      {props.disabled ? (
        <div className="mb-2">{t(String(props.value))}</div>
      ) : (
          <select
            id={t(props.title)}
            value={String(props.value)} // Convert value to string for compatibility with <select>
            onChange={(e) => props.onChange(e.target.value as unknown as T)} // Convert back to T
            className={`mt-1 mb-2 border border-gray-300 p-2 w-80 rounded-md px-1 rounded-md`}
            aria-labelledby={t(props.title) + "-"+ t("label")}
            aria-describedby={props.description ? t(props.title) + "-" + t("description") : undefined}
        >
          {/* Map over options and render <option> elements */}
          {props.options.map((option) => (
            <option key={String(option)} value={String(option)}>
              {t(String(option).charAt(0).toUpperCase() + String(option).slice(1))} {/* Capitalized */}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}