import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import PopUp from "./PopUp";

export default function LogoutButton() {
  const { t } = useTranslation();
  const auth = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  const handleConfirmLogout = () => {
    auth.logOut(); // Perform logout
  };

  return (
    <div>
      <button
        className="mx-6 my-4 px-2 text-2xl border-slate-900 underline"
        id="logout"
        onClick={() => setShowDialog(true)}
        aria-haspopup="dialog"
        aria-expanded={showDialog}
      >
        {t("Log Out")}
      </button>

      <PopUp
        showDialog={showDialog}
        callback={setShowDialog}
        confirm={handleConfirmLogout}
        text={t("Are you sure you want to log out of your account?")}
        title={t("Confirm Logout")}
        confirmText={t("Log Out")}
      ></PopUp>
    </div>
  );
}
