import { useState } from "react";
import i18n from "../i18n";

enum Language {
  EN,
  DE,
}

export default function LanguageSwitch() {
  let initLang = i18n.language == "en" ? Language.EN : Language.DE; //this is so that the actual button depends on global langugae

  const [lang, setLang] = useState<Language>(initLang);

  function switchLang(lang: Language) {
    if (lang === Language.EN) i18n.changeLanguage("en");
    else i18n.changeLanguage("de");
    setLang(lang);
  }

  if (lang == Language.EN)
    return (
      <button
        type="button"
        onClick={() => {
          switchLang(Language.DE);
        }}
        className="select-none flex flex-row border-2 border-black text-2xl h-min w-min "
      >
        <div className="basis-1/2 bg-black text-white p-1" aria-current="true">
          EN
        </div>
        <div className="basis-1/2 p-1">DE</div>
      </button>
    );
  else
    return (
      <button
        type="button"
        onClick={() => {
          switchLang(Language.EN);
        }}
        className="select-none flex flex-row border-2 border-black text-2xl h-min w-min"
      >
        <div className="basis-1/2 p-1">EN</div>
        <div className="basis-1/2 bg-black text-white p-1" aria-current="true">
          DE
        </div>
      </button>
    );
}
