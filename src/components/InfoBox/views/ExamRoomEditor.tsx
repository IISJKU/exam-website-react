import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EditField from "../components/EditField";
import DateField from "../components/DateField";
import Exam from "../../classes/Exam";
import { showToast } from "../components/ToastMessage";
import DropdownWithSearch from "../components/DropdownWithSearch";
import Room from "../../classes/Room";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";

export default function ExamRoomEditor() {
  const { id } = useParams(); // Get exam ID from URL params

  const { t } = useTranslation();
  const user = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [title, setTitle] = useState<string>("");
  const [lva_num, setLvaNum] = useState<number | undefined>();
  const [date, setDate] = useState<string>("");
  const [duration, setDuration] = useState<number | undefined>();
  const [tutorName, setTutorName] = useState<string>(""); // Full name for tutor
  const [studentName, setStudentName] = useState<string>(""); // Full name for student
  const [mode, setMode] = useState<string>("");
  const [room, setRoom] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const [options, setOptions] = useState<{ rooms: Room[] }>({ rooms: [] });

  // Fetch exam data based on ID from URL
  useEffect(() => {
    const fetchExam = async () => {
      try {
        let path = `http://localhost:1337/api/exams/${id}`;
        const examResponse = await fetch(path, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const rawData = await examResponse.json();

        if (!examResponse.ok) {
          showToast({ message: `HTTP error! Status: ${examResponse.status}, Message: ${rawData.error.message || "Unknown error"}.`, type: "error" });
        }

        let examData: Exam | undefined;
        examData = rawData;

        if (examData) {
          setExam(examData);
          setTitle(examData.title);
          setLvaNum(examData.lva_num);
          setDate(examData.date);
          setDuration(examData.duration);
          setRoom(examData.room_id);
          // Combine first name and last name for tutor and student
          const tutorFullName =
            typeof examData.tutor === "object" && examData.tutor !== null ? `${examData.tutor.first_name} ${examData.tutor.last_name}` : "N/A";
          const studentFullName =
            typeof examData.student === "object" && examData.student !== null ? `${examData.student.first_name} ${examData.student.last_name}` : "N/A";
          setTutorName(tutorFullName);
          setStudentName(studentFullName);
          const examModeName = typeof examData.exam_mode === "object" && examData.exam_mode !== null ? examData.exam_mode.name : "Unknown";
          setMode(examModeName);
        } else {
          showToast({ message: "No exam data found", type: "error" });
        }
      } catch (error) {
        showToast({ message: "Error fetching exam data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    const fetchRoomOptions = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/rooms", {
          method: "GET",
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const roomData = await response.json();
        setOptions({ rooms: roomData || [] });
      } catch (error) {
        showToast({ message: "Error fetching room options", type: "error" });
      }
    };
    fetchExam();
    fetchRoomOptions();
  }, [id]);

  const handleUpdate = async () => {
    const data: Partial<Exam> = {
      room,
    };

    try {
      const response = await fetch(`http://localhost:1337/api/exams/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        showToast({
          message: `HTTP error! Status: ${response.status}, Message: ${errorData.error.message || "Unknown error"}.`,
          type: "error",
        });
        return;
      }

      if (exam) {
        let notif = new Notification("", JSON.stringify(exam), user.user, exam.id);
        notif.type = NotificationType.adminChange;

        const notify = await fetch(`http://localhost:1337/api/notifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: notif }),
        });

        if (!notify.ok) {
          const errorData = await notify.json();
          showToast({
            message: `HTTP error! Status: ${notify.status}, Message: ${errorData.error.message || "Unknown error"}.`,
            type: "error",
          });
          return;
        }
      }
      showToast({ message: "Exam updated successfully", type: "success" });
    } catch (error) {
      showToast({ message: "Error updating exam", type: "error" });
    }
  };

  const handleRoomChange = async (newVal: string | number) => {
    setRoom(Number(newVal));
    try {
      const response = await fetch(`http://localhost:1337/api/rooms/${newVal}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch room capacity");

      const roomData = await response.json();
      const roomCapacity = roomData?.capacity;
      if (roomCapacity === 0) {
        setShowConfirmDialog(true);
      } else {
        showToast({ message: `Selected room capacity: ${roomCapacity}`, type: "info" });
      }
    } catch (error) {
      showToast({ message: "Error fetching room capacity", type: "error" });
    }
  };

  const handleConfirmRoomSelection = () => {
    setShowConfirmDialog(false);
    showToast({ message: "Room with 0 capacity selected", type: "warning" });
  };

  const handleCancelRoomSelection = () => {
    setShowConfirmDialog(false);
    setRoom(null);
    showToast({ message: "Room selection canceled", type: "info" });
  };

  const dropdownOptions = (list: Room[]) =>
    list.map((item) => ({
      value: item.id,
      label: item.name,
    }));

  if (loading || !exam) {
    return <p>Loading exam data...</p>;
  }

  return (
    <div className="m-5">
      <EditField title={t("Exam Title")} editMode={false} text={title} hideTitle={false} />
      <EditField title={t("LVA Num")} editMode={false} text={lva_num ? lva_num.toString() : ""} hideTitle={false} />
      <DateField editMode={false} dateValue={date} />
      <EditField title={t("Duration")} editMode={false} text={duration ? duration.toString() : ""} hideTitle={false} />
      <EditField title={"Student"} text={studentName ?? ""} editMode={false} hideTitle={false} />
      <EditField title={"Tutor"} text={tutorName ?? ""} editMode={false} hideTitle={false} />
      <EditField title={t("Mode")} text={mode ?? ""} editMode={false} hideTitle={false} />

      <DropdownWithSearch
        tableName="rooms"
        label={t("Room")}
        options={dropdownOptions(options.rooms)}
        value={room ?? ""}
        onChange={handleRoomChange}
        placeholder={t("Search rooms...")}
        disabled={!editMode}
      />

      <button
        onClick={() => {
          setEditMode(!editMode);
          if (editMode) handleUpdate();
        }}
        className="border-2 border-black p-1 hover:bg-slate-400 hover:underline"
      >
        {editMode ? t("Save") : t("Edit")}
      </button>
      {editMode ? (
        <button
          className="ml-2 border-2 border-black p-1 hover:bg-red-400 hover:underline"
          onClick={() => {
            setEditMode(!editMode);
          }}
        >
          Cancel
        </button>
      ) : (
        <></>
      )}
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-sm">
            <p className="mb-4">{t("The selected room has a capacity of 0. Do you want to continue?")}</p>
            <div className="flex justify-end">
              <button
                onClick={handleCancelRoomSelection}
                className="border-2 border-gray-300 bg-gray-200 text-gray-700 py-1 px-3 rounded mr-2 hover:bg-gray-300"
              >
                {t("Cancel")}
              </button>
              <button onClick={handleConfirmRoomSelection} className="border-2 border-red-500 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600">
                {t("Confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
