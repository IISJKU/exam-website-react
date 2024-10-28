import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthProvider";
import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { useTranslation } from "react-i18next";
import Notification from "../../classes/Notification";

export default function NotificationView() {
  const navigate = useNavigate(); // Initialize navigate

  const user = useAuth();
  const { t } = useTranslation();

  const [seenNotifications, setSeenNotifications] = useState<Notification[]>([]);
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  // Fetch data from Strapi API
  const fetchNotifications = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/notifications", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = (await response.json()).data;

      let tempNew: Notification[] = [];
      let tempOld: Notification[] = [];

      data.forEach((element: any) => {
        let el = new Notification(element.attributes.information, element.attributes.sentBy, element.attributes.examName);
        el.id = element.id;
        if (element.attributes.seenBy == undefined || element.attributes.seenBy.includes(user.user)) tempNew.push(el);
        else tempOld.push(el);
      });

      if (tempNew.length != 0) setNewNotifications(tempNew);
      if (tempOld.length != 0) setSeenNotifications(tempOld);
    } catch (error) {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClick = (notifId: number) => {
    navigate(`/admin/notifications/${notifId}`); // Navigate to ExamEditor with the exam ID
  };

  return (
    <div className="w-full h-full p-5 select-none">
      <div className="flex w-full content-center items-center ">
        <h2 className="text-4xl w-1/3 my-2 ">{t("Notifications")}</h2>
        {/*<SearchBar items={props.data} filter={setFilteredData} /> */}
      </div>
      <div className="h-5"></div>
      {newNotifications.length != 0 ? (
        <div>
          <div className="text-2xl font-bold">New Notifications</div>
          <ul className="w-full text-left border-2">
            {newNotifications.map((elem) => (
              <li key={elem.id} className="hover:bg-slate-300 even:bg-slate-200 odd:bg-slate-100 cursor-pointer " onClick={() => handleClick(elem.id)}>
                {elem.examName} was edited by {elem.sentBy}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <></>
      )}
      {seenNotifications.length != 0 ? (
        <div>
          <div className="text-2xl font-bold">Old Notifications</div>
          <ul className="w-full text-left border-2">
            {seenNotifications.map((elem) => (
              <li key={elem.id} className="hover:bg-slate-300 even:bg-slate-200 odd:bg-slate-100 cursor-pointer " onClick={() => handleClick(elem.id)}>
                {elem.examName} was edited by {elem.sentBy}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
