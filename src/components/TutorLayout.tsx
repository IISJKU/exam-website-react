import { Outlet } from "react-router-dom";
import Header from "./Header";
import LogoutButton from "./InfoBox/components/LogoutButton";
import TutorMenu from "./TutorMenu";

export default function TutorLayout() {
  return (
    <div className="h-full w-full">
      <Header />
      <div className="md:flex flex-column h-full w-full">
        {/* Side Menu */}
        <div className="basis-1/6 h-max ">
          <TutorMenu /> {/* Persistent Side Menu */}
          <div className="h-max flex justify-center">
            <LogoutButton />
          </div>
        </div>

        {/* Main Content */}
        <div className="basis-5/6 h-screen w-full">
          <Outlet /> {/* This is where the routed content will be displayed */}
        </div>
      </div>
    </div>
  );
}
