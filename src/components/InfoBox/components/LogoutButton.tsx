import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/AuthProvider";
import { t } from "i18next";

export default function LogoutButton() {
  const auth = useAuth();
  const [showDialog, setShowDialog] = useState(false);

   // Handle keyboard interaction (Escape key to close dialog)
   useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDialog) {
        setShowDialog(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDialog]);

  const handleConfirmLogout = () => {
    auth.logOut(); // Perform logout
    setShowDialog(false); 
  };

  const handleCancelLogout = () => {
    setShowDialog(false);
  };

  return (
    <div>
      <button
        className="mx-6 my-4 px-2 text-2xl border border-slate-900 hover:underline"
        id="logout"
        onClick={() => setShowDialog(true)}
        aria-haspopup="dialog" 
        aria-expanded={showDialog}
      >
        {t("Log Out")}
      </button>

      {showDialog && (
        <>
          <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          aria-hidden="true"
          >
        </div>
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            role="dialog"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
          >
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
              <h2 id="logout-dialog-title" className="text-lg font-bold mb-4">
              {t("Confirm Logout")}
              </h2>
              <p id="logout-dialog-description" className="mb-6">
                {t("Are you sure you want to log out of your account?")}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelLogout}
                  className="px-4 py-2 border border-gray-300 bg-gray-200 rounded hover:bg-gray-300"
                >
                  {t("Cancel")}
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 border border-red-600 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  {t("Log Out")}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
