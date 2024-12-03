import React, { useEffect, useState } from "react";

import { showToast } from "../components/ToastMessage";
import DropdownWithSearch from "../components/DropdownWithSearch";
import { useAuth } from "../../../hooks/AuthProvider";
import Exam from "../../classes/Exam";
import Room from "../../classes/Room";
import { useTranslation } from "react-i18next";
import RoomsCalender from "./RoomsCalender";
import fetchAll from "./FetchAll";
import Notification from "../../classes/Notification";
import { NotificationType } from "../../classes/Notification";

export default function RoomManagement() {
  const user = useAuth();
  const { t } = useTranslation();
  const [exams, setExams] = useState<Exam[]>([]);
  const [allExams, setAllExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [pendingRoomId, setPendingRoomId] = useState<number | null>(null); // New state to track pending room

  useEffect(() => {
    fetchAllExams();
    fetchData("exams", setExams);
    fetchData("rooms", setRooms);
  }, []);

  const fetchData = async (type: "exams" | "rooms", setData: Function) => {
    try {
      if (type === "exams") {
        const data = (await fetchAll(`http://localhost:1337/api/${type}`, user.token, `Failed to fetch ${type}`)) as Exam[];
        data.forEach((exam: Exam) => {});

        const examsWithNullRoom = data.filter((exam: Exam) => !exam.room);
        setData(examsWithNullRoom);
      } else {
        const data = (await fetchAll(`http://localhost:1337/api/${type}`, user.token, `Failed to fetch ${type}`)) as Room[];
        const availableRooms = data.filter((room: Room) => room.isAvailable === true);
        setData(availableRooms);
      }
    } catch (error) {
      showToast({ message: `Error fetching ${type}: ${error}`, type: "error" });
    }
  };

  // Fetch exams
  const fetchAllExams = async () => {
    const response = await fetch("http://localhost:1337/api/exams", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const data = await response.json();
    setAllExams(data);
  };

  const updateExamRoom = async (exam: Exam) => {
    let examId = exam.id;
    let roomId = exam.room_id;
    setSelectedExam(examId);

    if (!roomId) {
      showToast({ message: "Please select a room to save.", type: "warning" });
      return;
    }

    try {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) {
        return showToast({ message: "Room not found", type: "error" });
      }

      // Ensure room capacity is greater than zero or show confirmation dialog if it is zero
      if (room.capacity <= 0 && !showConfirmDialog) {
        setShowConfirmDialog(true);
        return;
      }

      console.log(exam.room_id);

      let notif = new Notification('{"room_id":' + exam.room_id + "}", "{}", user.user, examId);

      notif.type = NotificationType.adminChange;

      const notify = await fetch(`http://localhost:1337/api/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ data: notif }),
      });

      // Update the exam with the selected room ID
      const examUpdateResponse = await fetch(`http://localhost:1337/api/exams/${examId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ data: { room: roomId } }),
      });

      if (!examUpdateResponse.ok) throw new Error("Failed to update exam room");

      fetchData("exams", setExams); // Refresh exams to reflect changes
    } catch (error) {
      showToast({ message: `Error updating exam room: ${error}.`, type: "error" });
    }
  };

  const handleRoomChange = (examId: number, newRoomId: number) => {
    setSelectedExam(examId);
    const room = rooms.find((r) => r.id === newRoomId);
    const selectedExam = exams.find((exam) => exam.id === examId);

    if (!selectedExam || !room) return;

    // Convert selected exam start time and end time to Date objects
    const selectedExamStart = new Date(selectedExam.date);
    const selectedExamEnd = new Date(selectedExamStart.getTime() + selectedExam.duration * 60000);

    // Check for overlapping exams in the same room
    const overlappingExams = allExams.filter((exam) => {
      if (exam.id === examId || exam.room_id !== newRoomId || exam.room_id === null) return false;

      const examStart = new Date(exam.date);
      const examEnd = new Date(examStart.getTime() + exam.duration * 60000);

      // Check if there is a time overlap
      return (
        examStart < selectedExamEnd && examEnd > selectedExamStart // Overlapping condition
      );
    });

    // Check if the overlapping exams exceed room capacity
    if (overlappingExams.length + 1 > room.capacity) {
      showToast({
        message: "Room capacity exceeded with overlapping exams.",
        type: "error",
      });
      return;
    }

    // If capacity allows, assign the room
    if (room.capacity === 0) {
      setPendingRoomId(newRoomId); // Temporarily store the room ID
      setShowConfirmDialog(true);
    } else {
      setExams((prevExams) => prevExams.map((exam) => (exam.id === examId ? { ...exam, room_id: newRoomId } : exam)));
      showToast({ message: `Room capacity: ${room.capacity}`, type: "info" });
    }
  };

  const handleConfirmRoomSelection = () => {
    setSelectedRoom(pendingRoomId); // Set the room from the pending state
    setExams((prevExams) => prevExams.map((exam) => (exam.id === selectedExam ? { ...exam, room_id: pendingRoomId ?? exam.room_id } : exam)));
    setShowConfirmDialog(false);
    showToast({ message: "Room with 0 capacity selected", type: "warning" });
  };

  const handleCancelRoomSelection = () => {
    setShowConfirmDialog(false);
    setPendingRoomId(null);
    setSelectedRoom(null);
    showToast({ message: "Room selection canceled", type: "info" });
  };

  const handleRoomSelection = (roomId: number) => {
    setSelectedRoom(roomId);
  };

  const renderExamsTable = () => (
    <div className="max-h-72 min-h-72 overflow-y-scroll my-6 border-collapse border border-gray-200 rounded-md">
      <table className="w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2">Exam Title</th>
            <th className="border px-4 py-2">LVA Nr.</th>
            <th className="border px-4 py-2">Date/Time</th>
            <th className="border px-4 py-2">Duration</th>
            <th className="border px-4 py-2">Mode</th>
            <th className="border px-4 py-2">Student</th>
            <th className="border px-4 py-2">Room</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.id} className="odd:bg-gray-100 even:bg-white hover:bg-gray-200 text-center">
              <td className="p-3 border border-gray-300">{exam.title}</td>
              <td className="p-3 border border-gray-300">{exam.lva_num}</td>
              <td className="p-3 border border-gray-300">
                {new Date(exam.date).toLocaleDateString("en-GB")}{" "}
                {new Date(exam.date).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </td>
              <td className="p-3 border border-gray-300">{exam.duration} mins</td>
              <td className="p-3 border border-gray-300">{typeof exam.exam_mode === "object" && exam.exam_mode !== null ? exam.exam_mode.name : "Unknown"}</td>
              <td className="p-3 border border-gray-300">
                {typeof exam.student === "object" && exam.student !== null ? `${exam.student.first_name} ${exam.student.last_name}` : "N/A"}
              </td>
              <td className="p-3 border border-gray-300 text-justify">
                <DropdownWithSearch
                  tableName="rooms"
                  label=""
                  options={rooms.map((r) => ({ value: r.id, label: r.name }))}
                  value={exam.room_id}
                  onChange={(newRoomId) => handleRoomChange(exam.id, Number(newRoomId))}
                />
              </td>
              <td className="p-3 border border-gray-300">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={() => updateExamRoom(exam)}>
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderRoomButtons = () => (
    <div className="flex flex-wrap my-4">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => handleRoomSelection(room.id)}
          className={`mr-2 mb-2 px-4 py-2 rounded text-white ${
            selectedRoom === room.id ? "bg-blue-700" : "bg-blue-500"
          } hover:bg-blue-600 transition duration-200`}
        >
          {room.name}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Room Management</h1>
      {renderExamsTable()}
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
      <h3 className="text-xl font-semibold mt-6 mb-4">Select a Room to View Calendar</h3>
      {renderRoomButtons()}
      <RoomsCalender selectedRoomId={selectedRoom} />
    </div>
  );
}