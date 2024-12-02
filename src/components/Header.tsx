import LanguageSwitch from "./LanguageSwitch";

export default function Header() {
  return (
    <>
      <div className="flex relative items-center select-none max-w-full w-full">
        <h1 className="md:text-5xl text-3xl font-bold font-lexend underline p-5  xl:basis-10/12 basis-3/5">IIS Exam Page</h1>
        <div className="absolute right-5">
          <LanguageSwitch />
        </div>
      </div>

      <hr className="h-px m-2 bg-gray-500 border-0"></hr>
    </>
  );
}
