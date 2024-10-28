import EntryBase from "./EntryBase";

export default class Major extends EntryBase {
  id!: number;
  name!: string;
  abbreviation!: string;
  faculty!: string;
  getName(): string {
    return this.name;
  }
}
