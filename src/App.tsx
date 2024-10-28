import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout"; // Import the layout
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Admin from "./Pages/Admin";
import TableLinks from "./components/InfoBox/views/TableLinks";
import ExamView from "./components/InfoBox/views/ExamView";
import IndividualTutor from "./components/InfoBox/views/IndividualTutor";
import IndividualStudent from "./components/InfoBox/views/IndividualStudentView";
import StudentView from "./components/InfoBox/views/StudentView";
import TutorView from "./components/InfoBox/views/TutorView";
import ExamEditor from "./components/InfoBox/views/ExamEditor";
import DataAdministrationPage from "./components/InfoBox/views/DataAdministrationPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BigCalendar from "./components/InfoBox/views/BigCalendar";
import IndividualNotification from "./components/InfoBox/views/IndividualNotification";

import AuthProvider from "./hooks/AuthProvider";
import NotificationView from "./components/InfoBox/views/NotificationView";

export default function App() {
  return (
    <Router>
      <div className="App">
        {/* AuthProvider handles login*/}
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Admin Routes (Inside Layout) */}
            <Route element={<AdminLayout />}>
              {" "}
              {/* Layout keeps the side menu persistent */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/exams" element={<ExamView />} />
              <Route path="/admin/notifications" element={<NotificationView />} />
              <Route path="/admin/students" element={<StudentView />} />
              <Route path="/admin/tutors" element={<TutorView />} />
              <Route path="/admin/tutors/:id" element={<IndividualTutor />} />
              <Route path="/admin/students/:id" element={<IndividualStudent />} />
              <Route path="/admin/notifications/:id" element={<IndividualNotification />} />
              <Route path="/admin/exams/:id" element={<ExamEditor />} />
              <Route path="/admin/data-administration" element={<TableLinks />} />
              <Route path="/admin/data-administration/:tableName" element={<DataAdministrationPage />} />
              <Route path="admin/calendar/:year/:month/:day" element={<BigCalendar />} /> {/* BigCalendar Route */}
            </Route>
          </Routes>

          {/* ToastContainer for notifications */}
          <ToastContainer />
        </AuthProvider>
      </div>
    </Router>
  );
}
