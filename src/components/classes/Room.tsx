import EntryBase from "./EntryBase";
import Location from "./Location";

export default class Room extends EntryBase {
  id!: number;
  name!: string;
  building!: string;
  capacity!: number;
  isAvailable!: boolean;
  location!: Location | number;

  getName(): string {
    return this.name;
  }
}
