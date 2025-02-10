import EntryBase from "./EntryBase";
import Faculty from "./Faculty";

export default class Major extends EntryBase {
  id!: number;
  name!: string;
  abbreviation!: string;
  faculty!: Faculty | number;

  getName(): string {
    return this.name;
  }
}
