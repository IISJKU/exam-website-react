import DisabilityType from "./DisabilityType";
import EntryBase from "./EntryBase";
import Faculty from "./Faculty";
import Location from "./Location";

export enum PresenceMultimedia {
  presence = "Presence",
  multimedia = "Multimedia",
  fernuni_hagen = "Fernuni Hagen",
}

export enum InDistrbutionList {
  inDistList_yes = "Yes",
  inDistList_no = "No",
  inDistList_notAnymore = "Not anymore",
}

export default class Student extends EntryBase {
  id!: number;
  first_name!: string;
  last_name!: string;
  phone!: string;
  emergency_contact!: string;
  matrikel_number!: string;
  bonus_time!: number;
  misc!: string;
  major!: string | number;
  major_id!: number;
  conditions_approved!: boolean;
  in_distribution_list!: InDistrbutionList;
  location!: Location | number;
  disability!: string;
  disability_types!: DisabilityType[] | number;
  presence_multimedia!: PresenceMultimedia;
  faculty!: Faculty | number;
  updates!: string;

  getName(): string {
    return this.first_name + " " + this.last_name;
  }
}
