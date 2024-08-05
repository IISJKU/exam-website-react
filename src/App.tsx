import React from "react";
import "./App.css";
import "./Pages/Login";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Admin from "./Pages/Admin";
import { Views } from "./Views";

import { useState } from "react";
import { useCallback } from "react";

export default function App() {
  const [view, setView] = useState<Views>(Views.Admin);

  function changePage(v: Views) {
    setView(v);
  }

  switch (view) {
    case Views.Login:
      return <Login callback={changePage}></Login>;
    case Views.Register:
      return <Register />;
    case Views.Admin:
      return <Admin />;
    default:
      return <Login callback={changePage}></Login>;
  }
}
