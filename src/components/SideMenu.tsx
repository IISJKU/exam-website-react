import Calendar from "./Calendar";
import { InfoBoxView } from "./InfoBox/InfoBox";

import { useTranslation } from "react-i18next";

interface SidemenuProps {
  callback: Function;
}

export default function SideMenu(props: SidemenuProps) {
  const { t } = useTranslation();

  return (
    <div className="p-5 text-xl h-full w-full bg-slate-200">
      <button
        onClick={() => {
          props.callback(InfoBoxView.Exams);
        }}
        className="w-full text-left border-2 active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Exam Overview")}
      </button>
      <button
        onClick={() => {
          props.callback(InfoBoxView.Students);
        }}
        className="w-full text-left border-2 active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Students")}
      </button>
      <button
        onClick={() => {
          props.callback(InfoBoxView.Tutors);
        }}
        className="w-full text-left border-2 active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline"
      >
        {t("Tutors")}
      </button>
      <Calendar callback={props.callback} />
    </div>
  );
}
