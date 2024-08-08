import tutorData from "../../../TestData/Tutors.json";
import Tutor from "../../classes/Tutor";
interface TutorViewInterface {
  callback: Function;
}

export default function TutorView(props: TutorViewInterface) {
  let tutors: Tutor[];

  return (
    <div className="w-full h-full overflow-auto p-5">
      <h2 className="text-4xl w-full my-2 underline">Tutors</h2>
      <table className="w-full table-auto text-left">
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>eMail</th>
          <th>Phone</th>
          <th>Registration Number</th>
          <th>Course</th>
        </tr>

        {tutorData.map((tutor) => (
          <tr
            className="hover:bg-slate-300"
            onClick={() => {
              props.callback(tutor);
            }}
          >
            <td>{tutor.firstName}</td>
            <td>{tutor.lastName}</td>
            <td>{tutor.eMail}</td>
            <td>{tutor.phone}</td>
            <td>{tutor.registrationNumber}</td>
            <td>{tutor.course}</td>
            <td>
              <button>Edit</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
