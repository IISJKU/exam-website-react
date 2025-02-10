import EntryBase from "./EntryBase";
import Location from "./Location";

export enum ContractType {
  occasional = "Occasional",
  secondary_employment = "Secondary Employment",
}

export enum ContractCompleted {
  completed_yes = "Yes",
  completed_no = "No",
  completed_notNecessary = "Not Necessary",
}

export enum DistributionList {
  DistList_yes = "Yes",
  DistList_no = "No",
}


export default class Tutor extends EntryBase {
  id!: number;
  first_name!: string;
  last_name!: string;
  phone!: string;
  matrikel_number!: string;
  study!: string;
  contract_type!: ContractType;
  contract_completed!: ContractCompleted;
  distribution_list!: DistributionList;
  salto_access!: string;
  location!: Location | number;

  getName(): string {
    return this.first_name + " " + this.last_name;
  }
}
