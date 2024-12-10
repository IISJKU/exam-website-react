import { Outlet } from "react-router-dom";
import Header from "./Header";
import LogoutButton from "./InfoBox/components/LogoutButton";
import { useAuth } from "../hooks/AuthProvider";
import StudentMenu from "./StudentMenu";

export default function StudentLayout() {
  return (
    <div className="h-full w-full" role="region" aria-label="Student Layout">
      {/* Header Section */}
      <header role="banner" aria-label="Application Header">
        <Header />
      </header>

      <div className="md:flex flex-column h-full w-full">
        {/* Side Menu Section */}
        <nav role="navigation" aria-label="Side Menu" className="basis-1/6 h-max" >
          <StudentMenu />
          <div className="h-max flex justify-center">
            <LogoutButton aria-label="Logout from the application" />
          </div>
        </nav>

        {/* Main Content Section */}
        <main role="main" aria-label="Main Content Area" className="basis-5/6 h-full w-full" >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
