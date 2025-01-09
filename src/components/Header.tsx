import LanguageSwitch from "./LanguageSwitch";
import HeaderUsername from "./HeaderUsername";
import { useTranslation } from "react-i18next";

export default function Header() {
  const { t } = useTranslation();
  return (
    <>
      <header className="flex flex-wrap items-center justify-between select-none max-w-full w-full p-5" role="banner" aria-label={t("Page Header")}>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-lexend flex-grow xl:basis-10/12 basis-3/5" aria-label={t("IIS Exam Page Title")}>
          {t("IIS Exam Page")}
        </h1>
        <div className="pr-5" role="navigation" aria-label={t("Logged in username")}>
          <HeaderUsername />
        </div>
        <div className="right-5 flex-shrink-0" role="navigation" aria-label={t("Language Switch")}>
          <LanguageSwitch />
        </div>
      </header>
      <hr className="h-px mx-2 bg-gray-500 border-0" aria-hidden="true"></hr>
    </>
  );
}
