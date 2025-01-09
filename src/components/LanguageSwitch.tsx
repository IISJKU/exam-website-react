import { useState } from "react";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";

enum Language {
  EN,
  DE,
}

export default function LanguageSwitch() {
  const { t } = useTranslation();
  let initLang = i18n.language == "en" ? Language.EN : Language.DE; //this is so that the actual button depends on global language

  const [lang, setLang] = useState<Language>(initLang);

  function switchLang(lang: Language) {
    if (lang === Language.EN) {
      i18n.changeLanguage("en");
    } else {
      i18n.changeLanguage("de");
    }
    setLang(lang);
  }

  return (
    <button
      type="button"
      onClick={() => {
        switchLang(lang === Language.EN ? Language.DE : Language.EN);
      }}
      className="select-none flex flex-row border-2 border-black text-2xl h-min w-min focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label={t(lang === Language.EN ? "Switch to German language" : "Switch to English language")}
      aria-live="polite"
    >
      <div
        className={`basis-1/2 p-1 ${lang === Language.EN ? "bg-black text-white" : ""}`}
        aria-current={lang === Language.EN ? "true" : undefined}
        aria-label={t("Current language: English")}
      >
        {t("EN")}
      </div>
      <div
        className={`basis-1/2 p-1 ${lang === Language.DE ? "bg-black text-white" : ""}`}
        aria-current={lang === Language.DE ? "true" : undefined}
        aria-label={t("Current language: German")}
      >
        {t("DE")}
      </div>
    </button>
  );
}
