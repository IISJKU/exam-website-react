import EntryBase from "./EntryBase";
import Location from "./Location";

export default class Faculty extends EntryBase {
    id!: number;
    name!: string;
    abbreviation!: string;
    locations!: Location[];

    getName(): string {
        return this.name;
    }
}
