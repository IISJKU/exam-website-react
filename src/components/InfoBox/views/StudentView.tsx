import studentData from "../../../TestData/Students.json";
import examData from "../../../TestData/Exams.json";

export default function StudentView() {
  return (
    <div className="w-full h-full overflow-auto p-5">
      <h2 className="text-4xl w-full my-2 underline">Students</h2>
      <table className="w-full table-auto text-left">
        <tr>
          <th>First Name</th>
          <th>Last Name</th>
          <th>eMail</th>
          <th>Phone</th>
          <th>Emergency Contact</th>
          <th>Registration Number</th>
          <th>Bonus Time</th>
        </tr>

        {studentData.map((student) => (
          <tr className="hover:bg-slate-300">
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
