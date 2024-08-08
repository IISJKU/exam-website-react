import LanguageSwitch from "./LanguageSwitch";

export default function Header() {
  return (
    <>
      <div className="flex bg-slate-200 items-center select-none">
        <h1 className="md:text-5xl text-3xl font-bold font-lexend underline p-5 xl:basis-11/12 basis-3/4">IIS Exam Page</h1>
        <LanguageSwitch />
      </div>

      <hr className="h-px m-2 bg-gray-500 border-0 "></hr>
    </>
  );
}
