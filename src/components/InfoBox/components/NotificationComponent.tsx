import { useState, useEffect, useTransition, ReactElement, ReactHTMLElement } from "react";
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
    if (auth.role == "Admin") navigate(`/admin/notification/${notifId}`); // Navigate to ExamEditor with the exam ID
    else navigate(`/student/notification/${notifId}`);
  };

  const staticTitles = ["title", "date", "lva_num", "duration", "notes"];

  const hasStaticTitle = (title: string): boolean => {
    let isStatic = false;

    staticTitles.forEach((elem) => {
      if (elem == title) isStatic = true;
    });

    return isStatic;
  };

  const getElem = (index: any, type: string): string => {
    if (index != undefined && index.id != undefined) {
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
    color = " even:bg-red-100 odd:bg-red-200 border border-striped cursor-pointer ";

  if (notifications[0].type == NotificationType.createExam)
    color = "bg-red-300 even:bg-red-200 <odd:bg-red-3></odd:bg-red-3>00 cursor-pointer border border-white hover:border-black";

  calcTabs();

  useEffect(() => {
    const div = document.getElementById("notification" + props.id?.toString() + "_div");
    div?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const getName = (): string => {
    if (notifications[0].sentBy == auth.user) return "You";
    return notifications[0].sentBy;
  };

  return (
    <li
      id={"notification" + (props.id?.toString() || "tempID")}
      key={props.id}
      className={color == "" ? "even:bg-slate-200 odd:bg-slate-100 cursor-pointer border border-white hover:border-black " : color.toString()}
      onClick={() => toggleInfoPannel()}
      role="button"
      aria-expanded={infoOpen}
      aria-label={`Notification from ${getName()}, click to ${infoOpen ? "collapse" : "expand"} details`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleInfoPannel();
        }
      }}
    >
      <div className="relative" tabIndex={0}>
        <p className="inline-block w-60 font-bold">{moment(notifications[0].createdAt).format("DD.MM.YYYY HH:mm") + ""}</p>
        {props.notification[0].type == NotificationType.createExam ? (
          <div className="inline-block " id={"notification" + props.id.toString() + "_div"}>
            {getName()} proposed a new Exam
            {(notifications[0].type != NotificationType.proposeChange && notifications[0].type != NotificationType.createExam) ||
            auth.role == "Tutor" ||
            auth.role == "Student" ? null : (
              <a
                className="absolute right-0 hover:opacity-80 hover:border-2 border-black z-10"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent toggle
                  handleClick(props.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    handleClick(props.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Edit notification details"
              >
                {t("Edit")}
              </a>
            )}
          </div>
        ) : (
          <div className="inline-block w-max">
            {props.exam.title != undefined
              ? notifications[0].type == NotificationType.tutorConfirm
                ? `${getName()} will monitor ${props.exam.title}`
                : notifications[0].type == NotificationType.tutorDecline
                ? `${getName()} will no longer monitor ${props.exam.title}`
                : `${props.exam.title} was edited by ${getName()}`
              : `Exam was declined by ${getName()}`}
            {(notifications[0].type != NotificationType.proposeChange && notifications[0].type != NotificationType.createExam) ||
            auth.role == "Tutor" ||
            auth.role == "Student" ? null : (
              <a
                className="absolute right-0 hover:opacity-80 hover:border-2 border-black z-10"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent toggle
                  handleClick(props.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    handleClick(props.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="Edit notification details"
              >
                Edit
              </a>
            )}
          </div>
        )}
        {infoOpen && (
          <div className="">
            {notifications.map((notification: Notification, index) => (
              <div className="cursor-default" key={`divcontainer_${notification.id}`}>
                <ul className="p-4" tabIndex={0}>
                  {notification.type == NotificationType.proposeChange ||
                  notification.type == NotificationType.adminChange ||
                  notification.type == NotificationType.createExamOld ||
                  notification.type == NotificationType.createExam ? (
                    <div className={`pl-${tabs[index]}`}>
                      At {moment(notification.createdAt).tz("Europe/Vienna").format("DD.MM.YYYY HH:mm")} {notification.sentBy}{" "}
                      {notification.type == NotificationType.adminChange
                        ? "changed"
                        : notification.type == NotificationType.createExamOld
                        ? "proposed an Exam"
                        : "proposed a change"}
                      :
                      {Object.keys(JSON.parse(notification.information)).map((elem: string) => (
                        <li className="bg-white border border-grey p-1" key={`entry2_${notification.id}`}>
                          {notification.type == NotificationType.createExam || notification.type == NotificationType.createExamOld
                            ? getTitle(JSON.parse(notification.information)[elem], elem) + ": " + getElem(JSON.parse(notification.information)[elem], elem)
                            : getElem(JSON.parse(notification.oldInformation)[elem], elem) + " -> " + getElem(JSON.parse(notification.information)[elem], elem)}
                        </li>
                      ))}
                    </div>
                  ) : notification.type == NotificationType.tutorConfirm || notification.type == NotificationType.tutorDecline ? (
                    <div
                      tabIndex={0}
                      className={(
                        "border border-black p-2 " +
                        (notification.type == NotificationType.tutorConfirm ? "bg-teal-300 " : "bg-red-400 border-dotted ") +
                        "font-bold"
                      ).toString()}
                    >
                      Tutor {notification.sentBy}{" "}
                      {notification.type === NotificationType.tutorConfirm ? "registered to monitor the exam." : "canceled to monitor the exam."}
                    </div>
                  ) : (
                    <div
                      tabIndex={0}
                      className={(
                        "border border-black p-2 " +
                        (notification.type == NotificationType.confirmChange ? "bg-lime-200 " : "bg-red-400 border-dotted ") +
                        "font-bold"
                      ).toString()}
                    >
                      {notification.sentBy} {notification.type === NotificationType.confirmChange ? "approved the changes." : "declined the changes."}
                      {notification.oldInformation != "" &&
                        Object.keys(JSON.parse(notification.oldInformation)).map((elem: string) => (
                          <li
                            className={
                              (notification.type == NotificationType.discardChange ? "line-through " : "").toString() + "bg-white border border-black p-1"
                            }
                            key={"entry_" + notification.id}
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
        )}
      </div>
    </li>
  );
}
