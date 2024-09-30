export default class Exam {
  id!: number;
  title!: string;
  date!: string;
  duration!: number;
  student!: string | number;
  tutor!: Array<string> | number;
  examiner!: Array<string> | number;
  major!: string;
  institute!: string;
  mode!: string;
  lva_num!: number;
  student_misc!: string;
  status!: string;
  tutor_id!: number;
  student_id!: number;
  examiner_id!: number;
}
