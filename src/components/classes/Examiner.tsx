import EntryBase from "./EntryBase";
import Exam from "./Exam";

export default class Examiner extends EntryBase {
  id!: number;
  first_name!: string;
  last_name!: string;
  email!: string;
  phone!: string;
  exams!: Array<Exam>;

  getName(): string {
    return this.first_name + " " + this.last_name;
  }
}
