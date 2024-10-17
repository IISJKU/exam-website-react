import Header from "../components/Header";
import { Outlet } from "react-router-dom"; // For rendering routed content

export default function Admin() {
  return (
    <div className="h-full w-full">
        {/* The Outlet will render the routed content, like InfoBox views */}
        <Outlet />
      </div>
  );
}
