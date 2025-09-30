import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Exam from "../../classes/Exam";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";
import moment from "moment";
import { useAuth } from "../../../hooks/AuthProvider";
import config from "../../../config";

interface NotificationComponentProps {
  sentBy: string;
  notification: Notification[];
  exam: Exam;
  options: Record<string, any[]>; // e.g. { students: [], tutors: [], examiners: [], majors: [], institutes: [], modes: [], rooms: [] }
  id: number;
  exam_id: number;
}

const safeParse = (s?: string) => {
  try {
    if (!s || !s.trim()) return {};
    return JSON.parse(s);
  } catch {
    return {};
  }
};

export default function NotificationComponent(props: NotificationComponentProps) {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<Notification[]>(props.notification ?? []);
  const [infoOpen, setInfoOpen] = useState<boolean>(false);

  // keep local notifications in sync with parent
  useEffect(() => {
    setNotifications(props.notification ?? []);
  }, [props.notification]);

  const allSeen = useMemo(
    () => notifications.length > 0 && notifications.every((n) => (n.seenBy || "").split(" ").includes(auth.user)),
    [notifications, auth.user]
  );
  const [seen, setSeen] = useState<boolean>(allSeen);

  useEffect(() => {
    setSeen(allSeen);
  }, [allSeen]);

  // indentation steps for timeline
  const tabs = useMemo(() => {
    let t = 0;
    const arr: number[] = [];
    notifications.forEach((n) => {
      arr.push(t);
      if (n.type === NotificationType.confirmChange || n.type === NotificationType.discardChange) t += 2;
    });
    return arr;
  }, [notifications]);

  const handleClick = (notifId: number) => {
    if (auth.role === "Admin") navigate(`/admin/notification/${notifId}`);
    else navigate(`/student/notification/${notifId}`);
  };

  const staticTitles = ["title", "date", "lva_num", "duration", "notes"];
  const hasStaticTitle = (title: string): boolean => staticTitles.includes(title);

  const fmtVienna = (d: any) => (d ? moment(d).tz("Europe/Vienna").format("YYYY-MM-DD HH:mm") : "");

  const getElem = (index: any, type: string): string => {
    // direct examiner object
    if (type === "examiner") {
      if (index?.first_name && index?.last_name) return `${index.first_name} ${index.last_name}`;
      return t("No examiner assigned");
    }

    if (index?.id) index = index.id;

    // plain fields
    if (!type.includes("_id") && !type.includes("exam_mode") && hasStaticTitle(type)) {
      if (type === "date") return fmtVienna(index);
      return index != null ? String(index) : "";
    }

    // map *_id to collection key
    let k = type;
    if (type !== "exam_mode") {
      k = type.includes("_id") ? `${type.replace("_id", "")}s` : `${type}s`;
    } else {
      k = "modes";
    }

    const arr = props.options?.[k] ?? [];
    let str = "";

    for (const temp of arr) {
      if (Number(temp?.id) === Number(index)) {
        if (temp?.name) str = String(temp.name);
        else if (temp?.first_name && temp?.last_name) str = `${temp.first_name} ${temp.last_name}`;
        break;
      }
    }
    return str;
  };

  const titleCase = (raw: string) => {
    if (!raw) return "";
    const clean = raw.replace("_id", "").replaceAll("_", " ");
    return clean.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const toggleInfoPanel = async () => {
    if (!seen) {
      // mark each unseen notification as seen (space-separated list)
      const updates = notifications.map(async (elem) => {
        const seenList = (elem.seenBy || "").split(" ").filter(Boolean);
        if (!seenList.includes(auth.user)) {
          const newSeen = [...seenList, auth.user].join(" ");
          const payload = { ...elem, seenBy: newSeen };
          // persist
          await fetch(`${config.strapiUrl}/api/notifications/${elem.id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${auth.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ data: payload }),
          });
          return { ...elem, seenBy: newSeen };
        }
        return elem;
      });

      const newState = await Promise.all(updates);
      setNotifications(newState);
    }
    setSeen(true);
    setInfoOpen((o) => !o);
  };

  const getName = (): string => {
    if (!notifications[0]) return "";
    return notifications[0].sentBy === auth.user ? t("You") : notifications[0].sentBy;
  };

  const first = notifications[0];
  const firstType = first?.type as NotificationType | undefined;


  return (
    <li
      id={`notification${props.id ?? "tempID"}`}
      className="even:bg-slate-200 odd:bg-slate-100 cursor-pointer border border-white hover:border-black"
      onClick={toggleInfoPanel}
      role="button"
      aria-expanded={infoOpen}
      aria-label={`${t("Notification from")} ${getName()}, ${t("click to")} ${infoOpen ? t("collapse") : t("expand")} ${t("details")}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") toggleInfoPanel();
      }}
    >
      <div className="relative" tabIndex={0}>
        <p className="inline-block w-60 font-bold">{first ? moment(first.createdAt).format("DD.MM.YYYY HH:mm") : ""}</p>

        {first?.type === NotificationType.createExam ? (
          <div className="inline-block " id={`notification${String(props.id)}_div`}>
            {getName()} {t("proposed a new Exam")}
            {!(firstType === NotificationType.proposeChange || first.type === NotificationType.createExam) ||
            auth.role === "Tutor" ||
            auth.role === "Student" ? null : (
              <button
                className="absolute right-0 hover:opacity-80 hover:border-2 border-black z-10"
                onClick={(e) => {
                  e.stopPropagation();
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
                aria-label={t("Edit notification details")}
              >
                {t("Edit")}
              </button>
            )}
          </div>
        ) : (
          <div className="inline-block w-max">
            {props.exam?.title
              ? first?.type === NotificationType.tutorConfirm
                ? `${getName()} ${t("will monitor")} ${props.exam.title}`
                : first?.type === NotificationType.tutorDecline
                ? `${getName()} ${t("will no longer monitor")} ${props.exam.title}`
                : first?.type === NotificationType.deleteRequest
                ? `${getName()} ${t("proposes to delete")} ${props.exam.title}`
                : `${props.exam.title} ${t("was edited by")} ${getName()}`
              : `${t("Exam was declined by")} ${getName()}`}
            {!(first?.type === NotificationType.proposeChange || firstType === NotificationType.createExam || first?.type === NotificationType.deleteRequest) ||
            auth.role === "Tutor" ||
            auth.role === "Student" ? null : (
              <button
                className="absolute right-0 hover:opacity-80 hover:border-2 border-black z-10"
                onClick={(e) => {
                  e.stopPropagation();
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
                aria-label={t("Edit notification details")}
              >
                {t("Edit")}
              </button>
            )}
          </div>
        )}

        {infoOpen && (
          <div>
            {notifications.map((notification, index) => {
              const infoObj = safeParse(notification.information);
              const oldObj = safeParse(notification.oldInformation);

              const isProposal =
                notification.type === NotificationType.proposeChange ||
                notification.type === NotificationType.adminChange ||
                notification.type === NotificationType.createExamOld ||
                notification.type === NotificationType.createExam;

              const isTutorState =
                notification.type === NotificationType.tutorConfirm || notification.type === NotificationType.tutorDecline;

              const isDecision =
                notification.type === NotificationType.confirmChange ||
                notification.type === NotificationType.discardChange ||
                notification.type === NotificationType.deleteRequest;

              return (
                <div className="cursor-default" key={`divcontainer_${notification.id}`}>
                  <ul className="p-4" tabIndex={0}>
                    {isProposal ? (
                      <div className={`pl-${tabs[index] || 0}`}>
                        {t("At")} {moment(notification.createdAt).tz("Europe/Vienna").format("DD.MM.YYYY HH:mm")} {notification.sentBy}{" "}
                        {notification.type === NotificationType.adminChange
                          ? t("changed")
                          : notification.type === NotificationType.createExamOld
                          ? t("proposed an Exam")
                          : t("proposed a change")}
                        :
                        {Object.keys(infoObj).map((elem: string) => {
                          const val = (infoObj as any)[elem];
                          if (
                            (elem === "examiner_id" && Number(val) === 0) ||
                            (auth.role === "Student" && (elem === "student_id" || elem === "student_email"))
                          ) {
                            return null;
                          }
                          const newText = getElem(val, elem);
                          if (!newText) return null;

                          // create exam shows field:value, change shows old -> new
                          const body =
                            notification.type === NotificationType.createExam || notification.type === NotificationType.createExamOld
                              ? `${titleCase(elem)}: ${newText}`
                              : `${getElem((oldObj as any)[elem], elem)} -> ${newText}`;

                          return (
                            <li className="bg-white border border-grey p-1" key={`entry2_${notification.id}_${elem}`}>
                              {body}
                            </li>
                          );
                        })}
                      </div>
                    ) : isTutorState ? (
                      <div
                        tabIndex={0}
                        className={[
                          "border border-black p-2 font-bold",
                          notification.type === NotificationType.tutorConfirm ? "bg-teal-300" : "bg-red-400 border-dotted",
                        ].join(" ")}
                      >
                        {t("Tutor")} {notification.sentBy}{" "}
                        {notification.type === NotificationType.tutorConfirm ? t("registered to monitor the exam.") : t("canceled to monitor the exam.")}
                      </div>
                    ) : isDecision ? (
                      <div
                        tabIndex={0}
                        className={[
                          "border border-black p-2 font-bold",
                          notification.type === NotificationType.confirmChange ? "bg-lime-200" : "bg-red-400 border-dotted",
                        ].join(" ")}
                      >
                        {notification.sentBy}{" "}
                        {notification.type === NotificationType.confirmChange
                          ? t("approved the changes.")
                          : notification.type === NotificationType.deleteRequest
                          ? t("proposed to delete the exam.")
                          : t("declined the changes.")}
                        {notification.oldInformation &&
                          Object.keys(oldObj).map((elem: string) => {
                            const txt = getElem((oldObj as any)[elem], elem);
                            if (!txt) return null;
                            return (
                              <li
                                className={[
                                  notification.type === NotificationType.discardChange ? "line-through" : "",
                                  "bg-white border border-black p-1",
                                ].join(" ")}
                                key={`entry_${notification.id}_${elem}`}
                              >
                                {`${titleCase(elem)}: ${txt}`}
                              </li>
                            );
                          })}
                      </div>
                    ) : null}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </li>
  );
}
