import LanguageSwitch from "./LanguageSwitch";

export default function Header() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between select-none max-w-full w-full p-5">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-lexend flex-grow xl:basis-10/12 basis-3/5">IIS Exam Page</h1>
        <div className="absolute right-5 flex-shrink-0">
          <LanguageSwitch />
        </div>
      </div>

      <hr className="h-px mx-2 bg-gray-500 border-0 max-w-full w-full"></hr>
    </>
  );
}
