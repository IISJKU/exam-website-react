import React from "react";
import { Outlet } from "react-router-dom";
import SideMenu from "./SideMenu";
import Header from "./Header";
import LogoutButton from "./InfoBox/components/LogoutButton";

export default function AdminLayout() {
  return (
    <div className="h-full w-full" role="region" aria-label="Admin Layout">
      {/* Header Section */}
      <header role="banner" aria-label="Application Header">
        <Header />
      </header>

      <div className="md:flex flex-column h-full w-full">
        {/* Side Menu Section */}
        <nav role="navigation" aria-label="Side Menu" className="w-full basis-1/6 md:min-w-64 h-max">
          <SideMenu />
          <div className="h-max flex justify-center">
            <LogoutButton aria-label="Logout from the application" />
          </div>
        </nav>

        {/* Main Content Section */}
        <main role="main" aria-label="Main Content Area" className="basis-5/6 h-full w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
