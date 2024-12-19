import EntryBase from "./EntryBase";
import Examiner from "./Examiner";
import ExamMode from "./ExamMode";
import Institute from "./Institute";
import Major from "./Major";
import Room from "./Room";
import Student from "./Student";
import Tutor from "./Tutor";

export enum ExamStatus {
  NoEmailExaminer = "Email Examiner Needed",
  noMaterial = "Material Needed",
  noTutor = "No Tutor Needed",
  noAction = "No Action Required",
  archived = "Archived",
}

export default class Exam {
  id!: number;
  title!: string;
  date!: string;
  duration!: number;
  student!: Student | number; // Student name or ID
  tutor!: Tutor | number; // List of tutor names or ID
  registeredTutors!: Tutor[];
  examiner!: Examiner | number; // List of examiners or ID
  major!: Major | number; // Major name or ID
  institute!: Institute | number; // Institute name or ID
  exam_mode!: ExamMode | number; // ExamMode object or ID (number)
  room!: Room | number | null; // ExamMode object or ID (number)
  lva_num!: number;
  student_misc!: string;
  notes!: string;
  status!: ExamStatus;
  tutor_id!: number;
  student_id!: number;
  examiner_id!: number;
  major_id!: number;
  institute_id!: number;
  mode_id!: number;
  room_id!: number;
  confirmed!: boolean;
  student_email!: string;
  tutor_email!: string;
}
