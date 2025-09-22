import { useAuth } from "../../../hooks/AuthProvider";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";
import Exam from "../../classes/Exam";
import Student from "../../classes/Student";
import Tutor from "../../classes/Tutor";
import Examiner from "../../classes/Examiner";
import Major from "../../classes/Major";
import ExamMode from "../../classes/ExamMode";
import Institute from "../../classes/Institute";
import Room from "../../classes/Room";
import { showToast } from "../components/ToastMessage";
import { useParams } from "react-router-dom";
import fetchAll from "./FetchAll";
import NotificationCategory from "../components/NotificationCategory";
import config from "../../../config";

export default function NotificationView() {
  const user = useAuth();
  const { t } = useTranslation();
  const { id } = useParams(); // Get exam ID from URL params

  const [exams, setExams] = useState<Exam[]>();
  const [proposals, setProposals] = useState<Notification[]>([]);
  const [actionsRequired, setActionsRequired] = useState<Notification[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [seenNotifications, setSeenNotifications] = useState<Notification[]>([]);
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const { refreshKey } = useOutletContext<{ refreshKey: number }>();

  let notificationRoute = config.strapiUrl + "/api/notifications";
  let examRoute = config.strapiUrl + "/api/exams";
  let tutRoute = config.strapiUrl + "/api/tutors";
  let studentRoute = config.strapiUrl + "/api/students";

  if (user.role == "Student") {
    notificationRoute = `${config.strapiUrl}/api/notifications/me`;
    examRoute = `${config.strapiUrl}/api/exams/me`;
    tutRoute = `${config.strapiUrl}/api/tutors/me`;
    studentRoute = config.strapiUrl + "/api/students/me";
  } else if (user.role == "Tutor") {
    notificationRoute = `${config.strapiUrl}/api/notifications/me`;
  }

  const [options, setOptions] = useState({
    students: [] as Student[],
    tutors: [] as Tutor[],
    examiners: [] as Examiner[],
    majors: [] as Major[],
    institutes: [] as Institute[],
    modes: [] as ExamMode[],
    rooms: [] as Room[],
  });

  const getNotifications = (id: number): Notification[] => {
    let notifs: Notification[] = [];
    let n = new Notification();

    notifications.forEach((element) => {
      if (Number(element.id) == Number(id)) {
        n = element;
      }
    });

    for (let i = 0; i < notifications.length; i++)
      if (Number(notifications[notifications.length - 1 - i].exam_id) == Number(n.exam_id)) notifs.push(notifications[notifications.length - 1 - i]);

    return notifs;
  };

  const hasThread = (arr: Notification[][], notif: Notification): boolean => {
    let has = false;

    arr.forEach((messages) => {
      messages.forEach((message) => {
        if (message.exam_id == notif.exam_id && message.id != notif.exam_id && message.exam_id != 0) has = true;
      });
    });

    return has;
  };

  const sortNotifs = (arr: Notification[]): Notification[] => {
    let tempArr: Notification[] = [];

    arr.forEach((elem) => {
      let t = getNotifications(elem.id);

      tempArr.push(t[0]);
    });

    tempArr.sort((a: Notification, b: Notification) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0); // Default to epoch (earliest date) if undefined
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0); // Default to epoch (earliest date) if undefined
      return dateB.getTime() - dateA.getTime(); // Sorting in descending order (latest date first)
    });

    return tempArr;
  };

  // Fetch data from Strapi API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = (await fetchAll(notificationRoute, user.token)) as any;

      let examsLink = config.strapiUrl + "/api/exams";
      if (user.role == "Student") examsLink = config.strapiUrl + "/api/exams/me";
      const examData = (await fetchAll(examsLink, user.token)) as Exam[];

      let tempNew: Notification[] = [];
      let tempOld: Notification[] = [];
      let accReq: Notification[] = [];
      let all: Notification[] = [];
      let prop: Notification[] = [];

      data.forEach((element: any) => {
        const el = new Notification(element.information, element.oldInformation, element.sentBy, element.exam_id);
        el.id = element.id;
        el.type = element.type;
        el.createdAt = element.createdAt;
        el.seenBy = element.seenBy || "";

        if (el.type != NotificationType.createExam) all.push(el);
        else prop.push(el);
      });

      let threads: Notification[][] = [];

      //Sort into read and unread msgs, depending on if there is one message in the stack that is unread.
      all.forEach((elem) => {
        let foundThread = false;
        for (let i = 0; i < threads.length; i++) {
          if (threads[i][0] != undefined && !foundThread) {
            if (threads[i][0].exam_id == elem.exam_id && elem.exam_id != 0) {
              threads[i].push(elem);
              foundThread = true;
            }
          }
        }

        if (!foundThread) {
          threads.push([elem]);
        }
      });

      threads.forEach((thread) => {
        let hasUnread = false;
        let hasChange = false;

        thread.forEach((notif) => {
          if ((notif.seenBy.length == 0 || !notif.seenBy.includes(user.user)) && notif.sentBy != user.user) {
            hasUnread = true;
          }
        });

        if (thread[thread.length - 1].type == "proposeChange" || "deleteRequest") {
          hasChange = true;
        }

        thread.forEach((notif) => {
          if (hasUnread && !hasThread([tempNew, tempOld, accReq], notif)) tempNew.push(notif);
          else if (!hasThread([tempNew, tempOld, accReq], notif) && !hasChange) tempOld.push(notif);
          else if (!hasThread([tempNew, tempOld, accReq], notif) && thread[thread.length - 1].sentBy != user.user) accReq.push(notif);
          else if (!hasThread([tempNew, tempOld, accReq], notif)) tempOld.push(notif);
        });
      });

      setNotifications(all);
      setNewNotifications(tempNew);
      setSeenNotifications(tempOld);
      setActionsRequired(accReq);
      setProposals(prop.reverse());
      if (examData != undefined) setExams(examData);
    } catch (error) {
      showToast({ message: `${t("Error fetching notifications")}: ${error}.`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (reactLocation.pathname === "/"+ user.role.toLowerCase() +"/notifications") {
      fetchNotifications(); // Fetch immediately when user lands on the page
      interval = setInterval(fetchNotifications, 60000); // 60000 Fetch every 1 minute
    }

    return () => {
      if (interval) clearInterval(interval); // Clear interval when user leaves
    };
  }, [reactLocation.pathname]); // Trigger useEffect when route changes */

  useEffect(() => {
    fetchNotifications(); // Fetch when refreshKey changes
  }, [refreshKey]);

  const fetchDropdownOptions = async () => {
    try {
      const [students, tutors, examiners, majors, institutes, modes, rooms] =
        await Promise.all([
          fetchAll(studentRoute, user.token, t("HTTP error!")),
          fetchAll(tutRoute, user.token, t("HTTP error!")),
          fetchAll(`${config.strapiUrl}/api/examiners`, user.token, t("HTTP error!")),
          fetchAll(`${config.strapiUrl}/api/majors`, user.token, t("HTTP error!")),
          fetchAll(`${config.strapiUrl}/api/institutes`, user.token, t("HTTP error!")),
          fetchAll(`${config.strapiUrl}/api/exam-modes`, user.token, t("HTTP error!")),
          fetchAll(`${config.strapiUrl}/api/rooms`, user.token, t("HTTP error!")),
        ]);

      const availableRooms = rooms.filter((r: Room) => r.isAvailable === true);

      setOptions({
        students,
        tutors,
        examiners,
        majors,
        institutes,
        modes,
        rooms: availableRooms,
      });
    } catch (error) {
      showToast({ message: t("Error fetching dropdown options"), type: "error" });
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchDropdownOptions();
  }, []);

  if (loading) {
    return (
      <p aria-live="polite" aria-busy="true">
        {t("Loading notifications...")}
      </p>
    );
  }

  return (
    <div className="w-full h-full p-5 select-none" role="main" aria-labelledby="notifications-heading">
      <div className="flex w-full content-center items-center ">
        <h2 id="notifications-heading" className="text-4xl w-1/3 my-2 " tabIndex={0}>
          {t("Notifications")}
        </h2>
        {/*<SearchBar items={props.data} filter={setFilteredData} /> */}
      </div>
      <div className="h-5"></div>
      <NotificationCategory notifications={proposals} allNotifs={notifications} text={t("Proposed Exams")} exams={exams} options={options} />
      <NotificationCategory
        notifications={sortNotifs(actionsRequired)}
        allNotifs={notifications}
        text={t("Required Actions")}
        exams={exams}
        options={options}
      />
      <NotificationCategory
        notifications={sortNotifs(newNotifications)}
        allNotifs={notifications}
        text={t("New Notifications")}
        exams={exams}
        options={options}
      />
      <NotificationCategory
        notifications={sortNotifs(seenNotifications)}
        allNotifs={notifications}
        text={t("Old Notifications")}
        exams={exams}
        options={options}
      />
    </div>
  );
}
