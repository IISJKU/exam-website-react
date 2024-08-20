import { useState } from "react";
import Header from "../components/Header";
import InfoBox from "../components/InfoBox/InfoBox";
import SideMenu from "../components/SideMenu";
import { InfoBoxView } from "../components/InfoBox/InfoBox";

import Exam from "../components/classes/Exam";

import tutors from "../TestData/Tutors.json";
import students from "../TestData/Students.json";

export default function Admin() {
  const [boxState, setBoxState] = useState<InfoBoxView>(InfoBoxView.Students);
  const [selDate, setSelDate] = useState<Date>(new Date());
  const [exam, setExam] = useState<Exam>();

  function callback(boxView: InfoBoxView, date?: Date, exam?: Exam) {
    if (date != undefined) setSelDate(date);
    if (exam != undefined) {
      setExam(exam);
      console.log(exam);
    }
    setBoxState(boxView);
  }

  return (
    <div className="h-full w-full">
      <Header />
      <div className="flex flex-column h-full w-full bg-slate-100">
        <div className="basis-1/6 h-max ">
          <SideMenu callback={callback} />
        </div>
        <div className="basis-5/6 h-full w-full">
          <InfoBox switchView={callback} state={boxState} selectedDate={selDate} exam={exam} />
        </div>
      </div>
    </div>
  );
}
