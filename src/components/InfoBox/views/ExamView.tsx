import examData from "../../../TestData/Exams.json";
import ExamDate from "../components/ExamDate";

export default function ExamView() {
  return (
    <div className="w-full h-full overflow-auto p-5">
      <h2 className="text-4xl w-full my-2 underline">Upcoming Exams</h2>
      <table className="w-full table-auto text-left">
        <tr>
          <th>Exam Name</th>
          <th>Date</th>
          <th>Student</th>
          <th>Tutor</th>
          <th>Subject</th>
          <th>Course</th>
        </tr>

        {examData.map((exam) => (
          <tr className="hover:bg-slate-300">
            <td>{exam.name}</td>
            <ExamDate date={exam.date} />
            <td>{exam.student}</td>
            <td>{exam.tutor}</td>
            <td>{exam.subject}</td>
            <td>{exam.course}</td>
            <td>
              <button>Edit</button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
}
