import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideMenu from "./SideMenu"; // Import your side menu component
import Header from "./Header";
import LogoutButton from "./InfoBox/components/LogoutButton";

export default function AdminLayout() {
  return (
    <div className="h-full w-full overflow-y-auto">
      <Header />
      <div className="flex flex-column h-full w-full">
        {/* Side Menu */}
        <div className="basis-1/6 h-max ">
          <SideMenu /> {/* Persistent Side Menu */}
          <div className="h-max flex justify-center">
            <LogoutButton />
          </div>
        </div>

        {/* Main Content */}
        <div className="basis-5/6 h-full w-full">
          <Outlet /> {/* This is where the routed content will be displayed */}
        </div>
      </div>
    </div>
  );
}
