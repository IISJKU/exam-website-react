import { useTranslation } from "react-i18next";
import { createRef, RefObject, useState } from "react";

interface MultiFieldProps<T> {
  editMode: boolean;
  elements: T[];
  title: string;
  hideTitle?: boolean;
}

export default function MultiField<T extends { first_name: string; last_name: string }>(props: MultiFieldProps<T>) {
  const { t } = useTranslation();
  //let refs: RefObject<any>[] = [];
  const refs: RefObject<HTMLDivElement>[] = props.elements.map(() => createRef<HTMLDivElement>());
  const [elements, setElements] = useState<T[]>(props.elements);
  const classList = props.editMode ? "w-fit pl-1" : "";

  function showPrompt(index: number) {
    const currentRef = refs[index]?.current;
    if (currentRef) {
      currentRef.style.visibility = "visible";
    }
  }

  function hidePrompt(index: number) {
    const currentRef = refs[index]?.current;
    if (currentRef) {
      currentRef.style.visibility = "hidden";
    }
  }

  function deleteElem(index: number) {
    const updatedElements = [...elements];
    updatedElements.splice(index, 1);
    setElements(updatedElements);
  }

  return (
    <div className="mb-2">
      {props.hideTitle !== true && (
        <label id={`${props.title.toLowerCase()}-label`} className="font-bold">{t(props.title)} </label>
      )}

      <div className={classList} aria-labelledby={`${props.title.toLowerCase()}-label`} role="list">
        {elements.map((element, index) =>
          props.editMode ? (
            <div className="flex" role="listitem" key={index}>
              <div className="bg-slate-100 w-52 relative group hover:bg-white">
                <button className="absolute left-0 inline-block group-hover:underline" aria-label={`Edit ${element.first_name} ${element.last_name}`}>
                  {element.first_name + " " + element.last_name}</button>
                <button
                  onClick={() => showPrompt(index)}
                  onBlur={() => hidePrompt(index)}
                  className="absolute right-0 inline-block hover:opacity-60 active:ring-2 focus:opacity-30"
                  aria-label={`Delete ${element.first_name} ${element.last_name}`}
                >
                  🗑️
                </button>{" "}
              </div>
              <div className="mx-4 px-2 border-2 border-black" ref={refs[index]} style={{ visibility: "hidden" }} aria-hidden="true">
                {t("Are you sure?")}
                <button
                  onMouseDown={() => deleteElem(index)}
                  onBlur={(e) => e.preventDefault()}
                  className="hover:opacity-60 hover:underline px-1 hover:bg-slate-200"
                  aria-label={`Confirm delete ${element.first_name} ${element.last_name}`}
                >
                  {t("Yes")}
                </button>
                <button onClick={() => hidePrompt(index)} className="hover:opacity-60 hover:bg-slate-200 hover:underline px-1" aria-label={`Cancel delete ${element.first_name} ${element.last_name}`}>
                  {t("No")}
                </button>
              </div>
              <br />
            </div>
          ) : (
            <div role="listitem" key={index}>
              {element.first_name + " " + element.last_name}
            </div>
          )
        )}
      </div>

      {props.editMode && (
      <button className="mb-3 p-1 focus:ring-2 hover:opacity-80 hover:underline"
        onClick={() => setElements([...elements, { first_name: "", last_name: "" } as T])}
        aria-label={`Add new ${props.title}`} >
          + Add {props.title}
        </button>
      )}
    </div>
  );
}
