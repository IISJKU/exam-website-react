import EntryBase from "./EntryBase";

export default class ExamMode extends EntryBase {
  id!: number;
  name!: string;
  description!: string;
  getName(): string {
    return this.name;
  }
}
