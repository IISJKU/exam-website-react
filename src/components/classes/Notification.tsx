export default class Notification {
  id!: number;
  sentBy!: string;
  information!: string;
  seenBy: any;
  examName: any;

  constructor(information: any, sentBy: any, examName: any) {
    this.information = information;
    this.sentBy = sentBy;
    this.examName = examName;
  }
}
