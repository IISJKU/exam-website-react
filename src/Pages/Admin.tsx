import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import { Outlet } from "react-router-dom"; // For rendering routed content

export default function Admin() {
  const { t } = useTranslation();
  return (
    <div className="h-full w-full" role="main" aria-label={t("Admin dashboard main content")}>
      {/* The Outlet will render the routed content, like InfoBox views */}
      <Outlet />
    </div>
  );
}
