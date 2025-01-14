import { useState, useEffect } from "react";
import bellImage from "../img/notification.png";
import { useAuth } from "../hooks/AuthProvider";
import Exam from "./classes/Exam";
import { showToast } from "./InfoBox/components/ToastMessage";
import Notification, { NotificationType } from "./classes/Notification";
import useInterval from "../hooks/UseInterval";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import config from "../config";

export default function NotificationBell() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const user = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  const navigate = useNavigate(); // React Router hook for navigation

  const fetchNotifications = async () => {
    try {
      const response = await fetch(config.strapiUrl +"/api/notifications", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();

      const exResponse = await fetch(config.strapiUrl +"/api/exams", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const exData = await exResponse.json();

      let t: Notification[] = [];

      data.forEach((element: any) => {
        let e = new Notification(element.information, element.oldInformation, element.sentBy, element.exam_id);

        e.id = element.id;

        e.seenBy = element.seenBy;
        e.type = element.type;

        if ((e.seenBy == undefined || !e.seenBy.includes(user.user) || !e.sentBy == user.user) && e.sentBy != user.user) {
          t.push(e);
        }
      });

      calcNotifications(t);
      setNotifications(t);
    } catch (error) {
      showToast({ message: `${t("Error fetching notifications")}: ${error}.`, type: "error" });
    }
  };

  
  function calcNotifications(data: Notification[]) {
    let numNotifications = 0;

    if (data != null) {
      data.forEach((notification) => {
        numNotifications++;
      });
    }
    setUnreadNotifications(numNotifications);
  }

  useEffect(() => {
    if (user.token != undefined && user.token.length > 1 && user.role == "Admin") fetchNotifications();
  }, []);

  useInterval(() => {
    if (user.token != undefined && user.token.length > 1 && user.role == "Admin") fetchNotifications();
  }, 3000); //check once every minute

  function parseChangeMessage() {}
  //setInterval(fetchExams, 5000);

  const handleBlur = () => {
    setDropdownVisible(false);
  };

  const getName = (id: number): string => {
    const exam = exams.find((ex) => ex.id === id);
    return exam ? exam.title : "";
  };

  const handleClick = (notificationId: number) => {
    const path = user.role === "Admin" ? `admin/notifications/${notificationId}` : `students/notifications/${notificationId}`;
    navigate(path);
  };

  return (
    <div
      className="relative focus:border-double h-10 ml-5 hover:border hover:border-black transition"
      tabIndex={0}
      role="button"
      aria-label={t("Notification bell")}
      aria-haspopup="true"
      aria-expanded={dropdownVisible}
      onClick={() => setDropdownVisible((prev) => !prev)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setDropdownVisible((prev) => !prev);
        }
      }}
      onBlur={handleBlur}
    >
      <img className="h-10" src={bellImage} alt={t("Notification bell")}></img>
      <div
        className="h-5 w-5 inline-flex items-center justify-center border absolute bottom-0 right-0 bg-red-400 rounded-full object-cover"
        aria-live="polite"
        aria-atomic="true"
      >
        <p>{unreadNotifications}</p>
      </div>
        {dropdownVisible && notifications && (
          <ul
          className="absolute -translate-x-32 mb-2 bg-slate-100 inline-block focus:ring-2 border-2 border-black z-50 w-80"
          role="listbox"
          aria-label={t("Notifications list")}
        >
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <li
                key={index}
                className="cursor-pointer select-none relative py-2 hover:bg-indigo-500 hover:text-white"
                role="option"
                tabIndex={0}
                aria-label={`${t("Notification")} ${index + 1}: ${
                  notification.type === NotificationType.adminChange
                    ? `${notification.sentBy} ${t("changed")} ${getName(notification.exam_id)}`
                    : notification.type === NotificationType.proposeChange
                    ? `${notification.sentBy} ${t("proposed changes for")} ${getName(notification.exam_id)}`
                    : notification.type === NotificationType.confirmChange
                    ? `${notification.sentBy} ${t("approved changes in")} ${getName(notification.exam_id)}`
                    : notification.type === NotificationType.discardChange
                    ? `${notification.sentBy} ${t("rejected changes in")} ${getName(notification.exam_id)}`
                    : notification.type === NotificationType.createExam
                    ? `${notification.sentBy} ${t("added a new Exam")}`
                    : ""
                }`}
                onClick={() => handleClick(notification.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleClick(notification.id);
                  }
                }}
              >
                {notification.type === NotificationType.adminChange || notification.type == NotificationType.proposeChange
                  ? `${notification.sentBy} ${t("changed")} ${getName(notification.exam_id)}`
                  : notification.type === NotificationType.confirmChange
                  ? `${notification.sentBy} ${t("approved changes in")} ${getName(notification.exam_id)}`
                  : notification.type === NotificationType.discardChange
                  ? `${notification.sentBy} ${t("rejected changes in")} ${getName(notification.exam_id)}`
                  : notification.type === NotificationType.createExam
                  ? `${notification.sentBy} ${t("added a new Exam")}`
                  : ""}
                </li>
            ))
          ) : (
            <div className="absolute p-2 -translate-x-32 mb-2 bg-slate-100 inline-block focus:ring-2 border-2 border-black z-50 w-80" aria-live="polite">
              {t("No new notifications")} :)
            </div>
          )}
        </ul>
      )}
    </div>
  );
}