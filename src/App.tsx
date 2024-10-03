import "./App.css";
import "./Pages/Login";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Admin from "./Pages/Admin";
import { Views } from "./Views";
import DataAdministration from "./components/InfoBox/views/DataAdministration"; // Import the DataAdministration component
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [view, setView] = useState<Views>(Views.Login); // Manage view states

  function changePage(v: Views) {
    setView(v);
  }

  return (
    <>
      {/* Render current view */}
      {view === Views.Login && <Login callback={changePage} />}
      {view === Views.Register && <Register />}
      {view === Views.Admin && <Admin />}
      {view === Views.DataAdmin && <DataAdministration tableName="students" selectedFields={["first_name", "last_name", "email", "matrikel_number", "phone", "emergency_contact", "bonus_time", "misc"]} populateFields={[
        { name: "major", endpoint: "majors" }, // Relational field 
      ]} />}

      {/* Add the ToastContainer */}
      <ToastContainer />
    </>
  );
}
