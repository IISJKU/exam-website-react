import LanguageSwitch from "./LanguageSwitch";
import HeaderUsername from "./HeaderUsername";

export default function Header() {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between select-none max-w-full w-full p-5" role="banner" aria-label="Page Header">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-lexend flex-grow xl:basis-10/12 basis-3/5" aria-label="IIS Exam Page Title">
          IIS Exam Page
        </h1>
        <div className="pr-5" role="navigation" aria-label="Language Switch">
          <HeaderUsername />
        </div>
        <div className="right-5 flex-shrink-0" role="navigation" aria-label="Language Switch">
          <LanguageSwitch />
        </div>
      </header>
      <hr className="h-px mx-2 bg-gray-500 border-0 max-w-full w-full" aria-hidden="true"></hr>
    </>
  );
}
