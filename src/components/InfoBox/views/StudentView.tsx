import studentData from "../../../TestData/Students.json";
import Student from "../../classes/Student";
import examData from "../../../TestData/Exams.json";
import SearchBar from "../components/SearchBar";
import { useState } from "react";
import SortableHeaders from "../components/SortableHeaders";
import ContentView from "./ContentView";

interface StudentViewInterface {
  callback: Function;
}

export default function StudentView(props: StudentViewInterface) {
  const fields = ["First Name", "Last Name", "eMail", "Phone", "Emergency Contact", "Registration Number", "Bonus Time"];
  const keys: (keyof Student)[] = ["firstName", "lastName", "eMail", "phone", "emergencyPhone", "registrationNumber", "bonusTime"];

  return <ContentView title={"Students"} callback={props.callback} fields={fields} keys={keys} data={studentData} />;
}
