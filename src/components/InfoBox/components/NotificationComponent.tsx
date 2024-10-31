import { useState, useEffect, useTransition } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams and useNavigate
import Exam from "../../classes/Exam";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";
import EntryBase from "../../classes/EntryBase";
import moment from "moment";
import { useAuth } from "../../../hooks/AuthProvider";
import { stat } from "fs";

interface NotificationComponentProps {
  sentBy: string;
  notification: Notification[];
  exam: Exam;
  options: Object;
  id: number;
  exam_id: number;
}

export default function NotificationComponent(props: NotificationComponentProps) {
  const navigate = useNavigate(); // Initialize navigate
  const auth = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>(props.notification);

  const { t } = useTranslation();

  const hasSeen = (): boolean => {
    let t = true;

    notifications.forEach((element) => {
      if (element.seenBy.length == 0 || !element.seenBy.includes(auth.user)) t = false;
    });

    return t;
  };

  const [seen, setSeen] = useState<boolean>(hasSeen());

  let tabs: number[] = [];

  const [infoOpen, setInfoOpen] = useState<boolean>(false);

  const handleClick = (notifId: number) => {
    navigate(`/admin/notifications/${notifId}`); // Navigate to ExamEditor with the exam ID
  };

  const staticTitles = ["title", "date", "lva_num", "duration", "status"];

  const hasStaticTitle = (title: string): boolean => {
    let isStatic = false;

    staticTitles.forEach((elem) => {
      if (elem == title) isStatic = true;
    });

    return isStatic;
  };

  const getElem = (index: any, type: string): string => {
    if (index.id != undefined) {
      index = index.id;
    }

    if (!type.includes("_id") && !type.includes("exam_mode") && hasStaticTitle(type)) {
      if (type == "date") return moment(index).tz("Europe/Vienna").format("YYYY-MM-DD HH:MM");
      return index + "";
    }

    let k = type;

    if (type != "exam_mode") {
      if (type.includes("_id")) k = type.replace("_id", "") + "s";
      else k = type + "s";
    } else k = "modes";

    let arr = props.options[k as keyof typeof props.options];

    let str: string | number = "";

    if (arr != undefined) {
      Object.entries(arr).forEach((entr) => {
        let temp = entr[1];
        if (Number(temp["id" as keyof typeof temp]) == Number(index)) {
          if (temp["name" as keyof typeof temp] != undefined) {
            str = temp["name" as keyof typeof temp].toString();
          } else if (temp["first_name" as keyof typeof temp] != undefined) {
            str = temp["first_name" as keyof typeof temp].toString() + " " + temp["last_name" as keyof typeof temp].toString();
          } else str = "whatt";
        }
      });
    }

    return str;
  };

  const toggleInfoPannel = () => {
    if (!seen) {
      notifications.forEach((elem) => {
        if (!elem.seenBy.includes(auth.user)) {
          if (elem.seenBy.length == 0) elem.seenBy = auth.user;
          else elem.seenBy = elem.seenBy + " " + auth.user;

          const response = fetch(`http://localhost:1337/api/notifications/${elem.id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: elem }),
          });
        }
      });
    }
    setInfoOpen(!infoOpen);
  };

  const calcTabs = () => {
    let t = 0;
    tabs = [];
    notifications.forEach((notif) => {
      tabs.push(t);
      if (notif.type == NotificationType.confirmChange || notif.type == NotificationType.discardChange) t = t + 2;
    });
  };

  const getTitle = (index: any, type: string): string => {
    let str = type[0].toUpperCase() + type.substring(1, type.length);
    str = str.replace("_id", "");

    str = str.replaceAll("_", " ");
    str = str.substring(0, str.indexOf(" ") + 1) + str[str.indexOf(" ") + 1].toUpperCase() + str.substring(str.indexOf(" ") + 2, str.length);

    return str;
  };

  let color = "";
  if (notifications[0].type == NotificationType.createExam || notifications[0].type == NotificationType.proposeChange)
    color = " even:bg-red-400 odd:bg-red-400 border border-striped";

  if (notifications[0].type == NotificationType.createExam) color = " even:bg-cyan-400 odd:bg-cyan-400";

  calcTabs();

  return (
    <li
      key={props.id}
      className={"even:bg-slate-200 odd:bg-slate-100 cursor-pointer border border-white hover:border-black" + color.toString()}
      onClick={() => toggleInfoPannel()}
    >
      {props.notification[0].type == NotificationType.createExam ? (
        <div className=" relative">
          {notifications[0].sentBy} proposed a new Exam
          {notifications[0].type == NotificationType.confirmChange || notifications[0].type == NotificationType.discardChange ? (
            <></>
          ) : (
            <a className="inline-block absolute right-0 hover:opacity-80 hover:border-2 border-black z-10" onClick={() => handleClick(props.id)}>
              Edit
            </a>
          )}
        </div>
      ) : (
        <div className=" relative">
          {props.exam.title} was edited by {notifications[0].sentBy}
          {notifications[0].type == NotificationType.confirmChange || notifications[0].type == NotificationType.discardChange ? (
            <></>
          ) : (
            <a className="inline-block absolute right-0 hover:opacity-80 hover:border-2 border-black z-10" onClick={() => handleClick(props.id)}>
              Edit
            </a>
          )}
        </div>
      )}

      {infoOpen ? (
        <div className="">
          {notifications.map((notification: Notification, index) => (
            <div className="cursor-default">
              <ul className="p-4">
                {notification.type == NotificationType.proposeChange ||
                notification.type == NotificationType.adminChange ||
                notification.type == NotificationType.createExam ? (
                  <div className={("pl-" + tabs[index]).toString()}>
                    At {moment(notification.createdAt).tz("Europe/Vienna").format("DD.MM.YYYY HH:mm") ?? ""} {notification.sentBy}{" "}
                    {notification.type == NotificationType.adminChange ? "changed" : "proposed a change"}:
                    {Object.keys(JSON.parse(notification.information)).map((elem: string) => (
                      <li className="bg-white border border-black p-1">
                        {notification.type == NotificationType.createExam
                          ? getTitle(JSON.parse(notification.information)[elem], elem) + ": " + getElem(JSON.parse(notification.information)[elem], elem)
                          : getElem(JSON.parse(notification.oldInformation)[elem], elem) + " -> " + getElem(JSON.parse(notification.information)[elem], elem)}
                      </li>
                    ))}
                  </div>
                ) : (
                  <div
                    className={(
                      "border border-black p-2 " +
                      (notification.type == NotificationType.confirmChange ? "bg-lime-200 " : "bg-red-400 border-dotted ") +
                      "font-bold"
                    ).toString()}
                  >
                    {notification.sentBy} {notification.type == NotificationType.confirmChange ? "approved" : "declined"} the changes.
                    {Object.keys(JSON.parse(notification.oldInformation)).map((elem: string) => (
                      <li
                        className={(notification.type == NotificationType.discardChange ? "line-through " : "").toString() + "bg-white border border-black p-1"}
                      >
                        {getElem(JSON.parse(notification.oldInformation)[elem], elem)}
                      </li>
                    ))}{" "}
                  </div>
                )}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
    </li>
  );
}
