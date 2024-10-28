import EntryBase from "./EntryBase";

export default class Student extends EntryBase {
  id!: number;
  first_name!: string;
  last_name!: string;
  email!: string;
  phone!: string;
  emergency_contact!: string;
  matrikel_number!: string;
  bonus_time!: number;
  misc!: string;
  major!: string | number;
  major_id!: number;

  getName(): string {
    return this.first_name + " " + this.last_name;
  }
}
