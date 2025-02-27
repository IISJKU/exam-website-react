import { Outlet } from "react-router-dom";
import Header from "./Header";
import LogoutButton from "./InfoBox/components/LogoutButton";
import { useAuth } from "../hooks/AuthProvider";
import StudentMenu from "./StudentMenu";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function StudentLayout() {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0); // Track refresh state for notifications
  const handleNotificationRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };
  
  return (
    <div className="h-full w-full" role="region" aria-label={t("Student Layout")}>
      {/* Header Section */}
      <header role="banner" aria-label={t("Application Header")}>
        <Header />
      </header>

      <div className="md:flex flex-column h-full w-full">
        {/* Side Menu Section */}
        <nav role="navigation" aria-label={t("Side Menu")} className="w-full basis-1/6 md:min-w-64  h-max">
          <StudentMenu onNotificationRefresh={handleNotificationRefresh}/>
          <div className="h-max flex justify-center">
            <LogoutButton aria-label={t("Logout from the application")} />
          </div>
        </nav>

        {/* Main Content Section */}
        <main role="main" aria-label={t("Logout from the application")} className="bg-white h-full w-full">
          <Outlet context={{ refreshKey }} />
        </main>
      </div>
    </div>
  );
}
