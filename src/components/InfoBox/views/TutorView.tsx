import tutorData from "../../../TestData/Tutors.json";
import Tutor from "../../classes/Tutor";
import ContentView from "./ContentView";

interface TutorViewInterface {
  callback: Function;
}

export default function TutorView(props: TutorViewInterface) {
  let tutors: Tutor[];

  const fields = ["First Name", "Last Name", "eMail", "Phone", "Registration Number", "Course"];
  const keys: (keyof Tutor)[] = ["firstName", "lastName", "eMail", "phone", "registrationNumber", "course"];

  return <ContentView title={"Tutors"} callback={props.callback} fields={fields} keys={keys} data={tutorData} />;
}
