import EntryBase from "./EntryBase";

export default class Institute extends EntryBase {
  id!: number;
  name!: string;
  abbreviation!: string;
  faculty!: string;
  email!: string;
  city!: string;
  department!: string;
  getName(): string {
    return this.name;
  }
}
