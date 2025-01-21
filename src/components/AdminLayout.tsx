import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideMenu from "./SideMenu";
import Header from "./Header";
import LogoutButton from "./InfoBox/components/LogoutButton";
import { useTranslation } from "react-i18next";

export default function AdminLayout() {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0); // Track refresh state for notifications
  const handleNotificationRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };
  
  return (
    <div className="h-full w-full" role="region" aria-label={t("Admin Layout")}>
      {/* Header Section */}
      <header role="banner" aria-label={t("Application Header")}>
        <Header />
      </header>

      <div className="md:flex flex-column h-full w-full">
        {/* Side Menu Section */}
        <nav role="navigation" aria-label={t("Side Menu")} className="w-full basis-1/6 md:min-w-64 h-max">
          <SideMenu onNotificationRefresh={handleNotificationRefresh} />
          <div className="h-max flex justify-center">
            <LogoutButton aria-label={t("Logout from the application")} />
          </div>
        </nav>

        {/* Main Content Section */}
        <main role="main" aria-label={t("Logout from the application")} className="basis-5/6 h-full w-full">
          <Outlet context={{ refreshKey }}/>
        </main>
      </div>
    </div>
  );
}
