import EntryBase from "./EntryBase";

export default class Tutor extends EntryBase {
  id!: number;
  first_name!: string;
  last_name!: string;
  phone!: string;
  matrikel_number!: string;
  course!: string;

  getName(): string {
    return this.first_name + " " + this.last_name;
  }
}
