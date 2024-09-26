import "./App.css";
import "./Pages/Login";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Admin from "./Pages/Admin";
import { Views } from "./Views";

import { useState } from "react";
import { ToastContainer } from "react-toastify";  
import "react-toastify/dist/ReactToastify.css"; 


export default function App() {
  const [view, setView] = useState<Views>(Views.Login);

  function changePage(v: Views) {
    setView(v);
  }

  return (
    <>
      {/* Render current view */}
      {view === Views.Login && <Login callback={changePage} />}
      {view === Views.Register && <Register />}
      {view === Views.Admin && <Admin />}

      {/* Add the ToastContainer */}
      <ToastContainer />
    </>
  );
}
