import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import PopUp from "./PopUp";
import config from "../../../config";

interface DeleteExamButtonProps {
  id: number;
  success: Function;
}

export default function DeleteExamButton(props: DeleteExamButtonProps) {
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const user = useAuth();

  async function deleteExam() {
    try {
      const response = await fetch(config.strapiUrl + "/api/exams/" + props.id, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
      props.success();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }

  return (
    <>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:bg-red-700 absolute right-10"
        onClick={() => {
          setShowDialog(true);
        }}
      >
        {"⚠️ " + t("Delete Exam") + " ⚠️"}
      </button>
      <PopUp
        showDialog={showDialog}
        callback={setShowDialog}
        confirm={deleteExam}
        title={t("Confirm Delete")}
        text={t("Are you sure you want to delete this exam?")}
        confirmText={t("Delete")}
      ></PopUp>
    </>
  );
}
