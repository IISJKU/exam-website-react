import studentData from "../../../TestData/Students.json";
import Student from "../../classes/Student";
import examData from "../../../TestData/Exams.json";
import SearchBar from "../components/SearchBar";
import { useState } from "react";
import SortableHeaders from "../components/SortableHeaders";

interface StudentViewInterface {
  callback: Function;
}

export default function StudentView(props: StudentViewInterface) {
  const [filtered, setFilteredData] = useState<Student[]>(studentData);
  const fields = ["First Name", "Last Name", "eMail", "Phone", "Emergency Contact", "Registration Number", "Bonus Time"];
  const keys = ["firstName", "lastName", "eMail", "phone", "emergencyPhone", "registrationNumber", "bonusTime"];

  //<div>▲▼</div>

  return (
    <div className="w-full h-full overflow-auto p-5">
      <div className="flex w-full content-center items-center">
        <h2 className="text-4xl w-1/3 my-2 underline">Students</h2>
        <SearchBar items={studentData} filter={setFilteredData} />
      </div>
      <table className="w-full table-auto text-left">
        <SortableHeaders fields={fields} keys={keys} />

        {filtered.map((student) => (
          <tr
            className="hover:bg-slate-300"
            onClick={() => {
              props.callback(student);
            }}
          >
            <td>{student.firstName}</td>
            <td>{student.lastName}</td>
            <td>{student.eMail}</td>
            <td>{student.phone}</td>
            <td>{student.emergencyPhone}</td>
            <td>{student.registrationNumber}</td>
            <td>{student.bonusTime}</td>
            <td>
              <button>Edit</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
