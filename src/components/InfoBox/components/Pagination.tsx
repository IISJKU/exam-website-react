import { useTranslation } from "react-i18next";

interface PaginationInterface {
  activePage: number;
  callback: Function;
  pageNames: (number | string)[];
}

export default function Pagination(props: PaginationInterface) {
  const { t } = useTranslation();
  let pageNames: (number | string)[] = [];

  for (let i = 0; i < props.pageNames.length; i++) {
    pageNames.push(props.pageNames[i]);
  }

  if (pageNames.length <= 1) return <div></div>;

  if (pageNames.length > 7) {
    let t: (number | string)[] = [];

    let pointsEntered = false;

    props.pageNames.forEach((pageName, index) => {
      if (index == 0 || index == props.pageNames.length - 1) {
        t.push(pageName);
        pointsEntered = false;
      } else if (props.activePage >= index - 1 && props.activePage <= index + 3) {
        t.push(pageName);
        pointsEntered = false;
      } else if (!pointsEntered) {
        t.push("...");
        pointsEntered = true;
      }
    });

    pageNames = t;
  }

  return (
    <div className="center my-10 text-l flex w-full center justify-center overflow-hidden select-none" aria-label={t("Pagination Navigation")} >
      {pageNames.map((p, index) =>
        p === "..." ? (
          <div key={index} aria-hidden="true" className="w-7 aspect-square text-slate-700 text-center">{p}</div>
        ) : p === props.activePage ? (
          <button key={index} aria-current="page" aria-label={`Page ${p} (current page)`} className="w-7 aspect-square underline hover:opacity-60 border-2">
            {p}
          </button>
        ) : (
          <button key={index} onClick={() => props.callback(p)} aria-label={`${t("Go to page")} ${p}`} className="w-7 aspect-square hover:opacity-60 text-slate-700 border-2">
            {p}
          </button>
        )
      )}
    </div>
  );
}
