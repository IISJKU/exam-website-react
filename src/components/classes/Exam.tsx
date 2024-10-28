import EntryBase from "./EntryBase";
import Examiner from "./Examiner";
import ExamMode from "./ExamMode";
import Institute from "./Institute";
import Major from "./Major";
import Room from "./Room";
import Student from "./Student";
import Tutor from "./Tutor";

export default class Exam {
  id!: number;
  title!: string;
  date!: string;
  duration!: number;
  student!: number; // Student name or ID
  tutor!: number; // List of tutor names or ID
  examiner!: number; // List of examiners or ID
  major!: number; // Major name or ID
  institute!: number; // Institute name or ID
  exam_mode!: number; // ExamMode object or ID (number)
  room!: number; // ExamMode object or ID (number)
  lva_num!: number;
  student_misc!: string;
  status!: string;
  tutor_id!: number;
  student_id!: number;
  examiner_id!: number;
  major_id!: number;
  institute_id!: number;
  mode_id!: number;
  room_id!: number;
  confirmed!: boolean;
}
