import Notification from "../../classes/Notification";
import Exam from "../../classes/Exam";
import NotificationComponent from "./NotificationComponent";
import { useState } from "react";
import moment from "moment";

interface NotificationCategoryProps {
  notifications: Notification[];
  exams: Exam[] | undefined;
  text: string;
  options: {};
}

export default function NotificationCategory(props: NotificationCategoryProps) {
  //sortNotifs(newNotifications)
  const [day, setDay] = useState<string>();

  const getNotifications = (id: number): Notification[] => {
    let notifs: Notification[] = [];
    let n = new Notification();

    props.notifications.forEach((element) => {
      if (Number(element.id) == Number(id)) {
        n = element;
      }
    });

    for (let i = 0; i < props.notifications.length; i++)
      if (Number(props.notifications[props.notifications.length - 1 - i].exam_id) == Number(n.exam_id))
        notifs.push(props.notifications[props.notifications.length - 1 - i]);

    return notifs;
  };

  const getExam = (id: number): Exam => {
    if (id == 0) return new Exam();

    let x = new Exam();

    props.exams?.forEach((element) => {
      if (Number(element.id) == Number(id)) {
        x = element;
        return element;
      }
    });
    return x;
  };

  if (props.notifications.length != 0)
    return (
      <div>
        <div className="text-4xl p-3 pl-0">{props.text}</div>
        <ul className="w-full text-left border-2">
          {props.notifications.map((elem, index) => (
            <>
              {index == 0 || moment(elem.createdAt).format("MMMM") != moment(props.notifications[index - 1]?.createdAt).format("MMMM") ? (
                <div className={"p-1 text-xl "}>{moment(elem.createdAt).format("MMMM") + " " + moment(elem.createdAt).format("YYYY")}</div>
              ) : (
                <></>
              )}
              {index == 0 || moment(elem.createdAt).format("YYYY-MM-DD") != moment(props.notifications[index - 1]?.createdAt).format("YYYY-MM-DD") ? (
                <div className={"p-0.5 text-xl font-bold"}>{moment(elem.createdAt).format("DD.MM.YY")}</div>
              ) : (
                <></>
              )}
              <NotificationComponent
                exam={getExam(elem.exam_id)}
                options={props.options}
                notification={elem.exam_id == 0 ? [elem] : getNotifications(elem.id)}
                id={elem.id}
                exam_id={elem.exam_id}
                sentBy={elem.sentBy}
              />{" "}
            </>
          ))}
        </ul>
      </div>
    );
  else return <></>;
}
