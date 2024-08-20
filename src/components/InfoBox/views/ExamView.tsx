import { useState } from "react";
import examData from "../../../TestData/Exams.json";
import ExamDate from "../components/ExamDate";
import SearchBar from "../components/SearchBar";
import Exam from "../../classes/Exam";

export default function ExamView() {
  const [filteredExams, setExams] = useState<Exam[]>(examData);

  return (
    <div className="w-full h-full overflow-auto p-5">
      <h2 className="text-4xl w-full my-2 underline"></h2>

      <div className="flex w-full content-center items-center">
        <h2 className="text-4xl w-1/3 my-2 underline">Upcoming Exams</h2>
        <SearchBar items={examData} filter={setExams} />
      </div>
      <div>
        <table className="w-full table-auto text-left">
          <tr>
            <th>Exam Name</th>
            <th>Date</th>
            <th>Student</th>
            <th>Tutor</th>
            <th>Subject</th>
            <th>Course</th>
          </tr>

          {filteredExams.map((exam) => (
            <tr className="hover:bg-slate-300">
              <td>{exam.name}</td>
              <ExamDate date={exam.date} />
              <td>{exam.students[0]}</td>
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
    </div>
  );
}
