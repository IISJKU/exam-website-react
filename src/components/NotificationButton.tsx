import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // For navigation
import { useState, useEffect } from "react";
import useInterval from "../hooks/UseInterval";
import { useAuth } from "../hooks/AuthProvider";
import Notification from "./classes/Notification";
import { showToast } from "./InfoBox/components/ToastMessage";

interface NButtonProps {
  path: string;
}

export default function NotificationButton(props: NButtonProps) {
  const { t } = useTranslation();
  const navigate = useNavigate(); // React Router hook for navigation
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const user = useAuth();
  const [notifications, setNotifications] = useState<Notification[] | null>(null);

  let path = "http://localhost:1337/api/notifications";

  if (user.role != "Admin") path = "http://localhost:1337/api/notifications/me";

  const fetchNotifications = async () => {
    try {
      const response = await fetch(path, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();

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
  }, 3000); //check once every minute

  return (
    <button
      onClick={() => {
        navigate(props.path);
      }}
      className="w-full text-left border-2 bg-white active:bg-slate-600 border-black my-1 p-1 hover:bg-slate-400 hover:underline relative inline-block align-center"
    >
      {unreadNotifications != 0 ? (
        <div className="h-5 w-5 inline-block align-center justify-center absolute right-1 top-2 text-sm select-none">
          <p className="bg-red-400 rounded-full text-center m-0">{unreadNotifications}</p>
        </div>
      ) : (
        <></>
      )}

      {t("Notifications")}
    </button>
  );
}
