export enum NotificationType {
  confirmChange = "confirmChange",
  discardChange = "discardChange",
  createExam = "createExam",
  createExamOld = "createExamOld",
  proposeChange = "proposeChange",
  adminChange = "adminChange",
  tutorConfirm = "tutorConfirm",
  tutorDecline = "tutorDecline",
  deleteRequest = "deleteRequest",
}

export default class Notification {
  id!: number;
  sentBy!: string;
  information!: string;
  oldInformation!: string;
  seenBy: any;
  exam_id: number;
  createdAt?: Date;
  type?: NotificationType;

  constructor(information: any = "", oldInformation: any = "", sentBy: any = "", exam_id: number = 0) {
    this.information = information;
    this.oldInformation = oldInformation;
    this.sentBy = sentBy;
    this.exam_id = exam_id;
  }
}
