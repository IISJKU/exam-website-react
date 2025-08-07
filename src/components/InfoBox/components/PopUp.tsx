import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";

interface PopUpProps {
  showDialog: boolean;
  callback: Function;
  confirm: Function;
  title: string;
  text: string;
  confirmText: string;
}

export default function PopUp(props: PopUpProps) {
  const { t } = useTranslation();

  // Handle keyboard interaction (Escape key to close dialog)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && props.showDialog) {
        props.callback(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props.showDialog]);

  const handleConfirmLogout = () => {
    props.confirm();
    props.callback(false);
  };

  const handleCancelLogout = () => {
    props.callback(false);
  };

  return (
    <>
      {props.showDialog && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" aria-hidden="true"></div>
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
          >
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 id="logout-dialog-title" className="text-lg font-bold mb-4">
                {props.title}
              </h2>
              <p id="logout-dialog-description" className="mb-6">
                {props.text}
              </p>
              <div className="flex justify-end space-x-4">
                <button onClick={handleCancelLogout} className="px-4 py-2 border border-gray-300 bg-gray-200 rounded hover:bg-gray-300">
                  {t("Cancel")}
                </button>
                <button onClick={handleConfirmLogout} className="px-4 py-2 border border-red-600 bg-red-500 text-white rounded hover:bg-red-600">
                  {props.confirmText}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
