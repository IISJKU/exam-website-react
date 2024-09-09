import { useTranslation } from "react-i18next";
import { createRef, RefObject, useState } from "react";
import { FocusEvent } from "react";

import Student from "../../classes/Student";
import Tutor from "../../classes/Tutor";

interface MultiFieldProps<T> {
  editMode: boolean;
  elements: T[];
  title: string;
  hideTitle?: boolean;
}

export default function MultiField<T extends { first_name: string; last_name: string }>(props: MultiFieldProps<T>) {
  const { t } = useTranslation();
  let refs: RefObject<any>[] = [];
  const [elements, setElements] = useState<T[]>(props.elements);

  for (let i = 0; i < props.elements.length; i++) {
    refs.push(createRef());
  }

  let classList = "";
  let additionalText = "";

  if (props.editMode) classList = " w-fit pl-1";

  function showPrompt(index: number) {
    refs[index].current.style.visibility = "visible";
  }
  function hidePrompt(index: number) {
    refs[index].current.style.visibility = "hidden";
  }

  function deleteElem(index: number) {
    let t = [...elements];
    t.splice(index, 1);
    console.log(t);
    setElements(t);
  }

  return (
    <div className={"mb-2"}>
      <div className="font-bold">{t(props.title)} </div>

      <div className={classList}>
        {elements.map((element, index) =>
          props.editMode ? (
            <div className="flex">
              <div className="bg-slate-100 w-52 relative group hover:bg-white">
                <button className="absolute left-0 inline-block group-hover:underline">{element.first_name + " " + element.last_name}</button>{" "}
                <button
                  onClick={() => showPrompt(index)}
                  onBlur={() => hidePrompt(index)}
                  className="absolute right-0 inline-block hover:opacity-60 active:ring-2 focus:opacity-30"
                >
                  🗑️
                </button>{" "}
              </div>
              <div className="mx-4 px-2 border-2 border-black " ref={refs[index]} style={{ visibility: "hidden" }}>
                {t("Are you sure?")}
                <button
                  onMouseDown={() => deleteElem(index)}
                  onBlur={(e) => e.preventDefault()}
                  className="hover:opacity-60 hover:underline px-1 hover:bg-slate-200"
                >
                  {t("Yes")}
                </button>
                <button onClick={() => hidePrompt(index)} className="hover:opacity-60 hover:bg-slate-200 hover:underline px-1 ">
                  {t("No")}
                </button>
              </div>
              <br />
            </div>
          ) : (
            <div className="">
              {element.first_name + " " + element.last_name}
              {additionalText}
            </div>
          )
        )}
      </div>

      {props.editMode ? <button className="mb-3 p-1 focus:ring-2 hover:opacity-80 hover:underline">+ Add {props.title}</button> : <></>}
    </div>
  );
}
