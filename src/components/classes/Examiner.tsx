import Exam from "./Exam";

export default class Examiner {
  id!: number;
  first_name!: string;
  last_name!: string;
  email!: string;
  phone!: string;
  exams!: Array<Exam>;
}
