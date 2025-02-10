import EntryBase from "./EntryBase";
import Faculty from "./Faculty";

export default class Institute extends EntryBase {
  id!: number;
  name!: string;
  abbreviation!: string;
  email!: string;
  department!: string;

  getName(): string {
    return this.name;
  }
}
