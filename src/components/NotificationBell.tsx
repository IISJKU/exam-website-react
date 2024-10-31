import { useState, useEffect } from "react";
import bellImage from "../img/notification.png";
import { useAuth } from "../hooks/AuthProvider";
import Exam from "./classes/Exam";
import { showToast } from "./InfoBox/components/ToastMessage";
import Notification, { NotificationType } from "./classes/Notification";
import useInterval from "../hooks/UseInterval";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const user = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/notifications", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = (await response.json()).data;

      let t: Notification[] = [];

      const exResponse = await fetch("http://localhost:1337/api/exams", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const exData = await exResponse.json();

      data.forEach((element: any) => {
        let e = new Notification(element.attributes.information, element.attributes.oldInformation, element.attributes.sentBy, element.attributes.exam_id);

        e.seenBy = element.attributes.seenBy;
        e.type = element.attributes.type;

        if (e.seenBy == undefined || !e.seenBy.includes(user.user) || !e.sentBy == user.user) {
          t.push(e);
        }
      });

      calcNotifications(t);
      setNotifications(t);

      setExams(exData);
    } catch (error) {
      showToast({ message: `Error fetching notifications: ${error}.`, type: "error" });
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
    if (user.token != undefined && user.token.length > 1) fetchNotifications();
  }, []);

  useInterval(() => {
    if (user.token != undefined && user.token.length > 1) fetchNotifications();
  }, 1000); //check once every minute

  function parseChangeMessage() {}
  //setInterval(fetchExams, 5000);

  const handleBlur = () => {
    setDropdownVisible(false);
  };

  const getName = (id: number): string => {
    let str = "";
    if (exams.length != 0) {
      exams.forEach((ex) => {
        if (Number(ex.id) == Number(id)) {
          str = ex.title;
        }
      });
    } else {
    }

    return str;
  };

  return (
    <div
      className="relative focus:border-double h-10 ml-5 hover:border hover:border-black transition"
      onMouseDown={() => {
        setDropdownVisible(!dropdownVisible);
      }}
    >
      <img className="h-10" src={bellImage} alt="The Notification Bell"></img>
      <div className="h-5 w-5 inline-flex items-center justify-center border absolute bottom-0 right-0 bg-red-400 rounded-full object-cover">
        <p>{unreadNotifications}</p>
      </div>
      {dropdownVisible && notifications ? (
        notifications.length != 0 ? (
          <ul className="absolute -translate-x-32 mb-2 bg-slate-100 inline-block focus:ring-2 border-2 border-black z-50 w-80">
            {notifications?.map((notification, index) => (
              <li key={index} className={`cursor-pointer select-none relative py-2 hover:bg-indigo-500 hover:text-white`}>
                {notification.type == NotificationType.adminChange || notification.type == NotificationType.proposeChange
                  ? notification.sentBy + " changed " + getName(notification.exam_id)
                  : ""}
                {notification.type == NotificationType.confirmChange ? notification.sentBy + " approved " + getName(notification.exam_id) : ""}
                {notification.type == NotificationType.discardChange ? notification.sentBy + " rejected changes in " + getName(notification.exam_id) : ""}
              </li>
            ))}
          </ul>
        ) : (
          <div className="absolute p-2 -translate-x-32 mb-2 bg-slate-100 inline-block focus:ring-2 border-2 border-black z-50 w-80">
            No new notifications :)
          </div>
        )
      ) : (
        <></>
      )}
    </div>
  );
}
