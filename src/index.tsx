import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "./i18n";
import reportWebVitals from "./reportWebVitals";
import i18n from './i18n';

const t = i18n.t;
// Add accessible label to the root element
const rootElement = document.getElementById("root") as HTMLElement;
rootElement.setAttribute("aria-label", t("Application Root"));

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
