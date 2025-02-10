import EntryBase from "./EntryBase";
import Faculty from "./Faculty";

export default class Location extends EntryBase {
    id!: number;
    name!: string;
    faculties!: Faculty[];

    getName(): string {
        return this.name;
    }
}
