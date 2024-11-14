import EntryBase from "./EntryBase";

export default class Room extends EntryBase {
  id!: number;
  name!: string;
  building!: string;
  capacity!: number;
  location!: string;
  isAvailable!: boolean;
  getName(): string {
    return this.name;
  }
}
