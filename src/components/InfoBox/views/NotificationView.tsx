import { useAuth } from "../../../hooks/AuthProvider";
import { useEffect, useState } from "react";
import { useLocation as useReactLocation } from "react-router-dom"; 
import Pagination from "../components/Pagination";
import SearchBar from "../components/SearchBar";
import { useTranslation } from "react-i18next";
import Notification, { NotificationType } from "../../classes/Notification";
import NotificationComponent from "../components/NotificationComponent";
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
  const reactLocation = useReactLocation(); 

  const studentId = user.userId;

  let notificationRoute = "http://localhost:1337/api/notifications";
  let examRoute = "http://localhost:1337/api/exams";
  let tutRoute = "http://localhost:1337/api/tutors";
  let studentRoute = "http://localhost:1337/api/students";

  if (user.role == "Student") {
    notificationRoute = `http://localhost:1337/api/notifications/me`;
    examRoute = `http://localhost:1337/api/exams/me`;
    tutRoute = `http://localhost:1337/api/tutors/me`;
    studentRoute = "http://localhost:1337/api/students/me";
  } else if (user.role == "Tutor") {
    notificationRoute = `http://localhost:1337/api/notifications/me`;
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

  const containsNotif = (notif: Notification, arr: Notification[]): boolean => {
    for (let i = 0; i < arr.length; i++) if (arr[i].exam_id == notif.exam_id) return true;

    return false;
  };

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
      //let c = await response.json();
      //let data = await response.json(); //should probably rewrite api response, instead of changing stuff here
      let data = (await fetchAll(notificationRoute, user.token)) as any;

      let examsLink = "http://localhost:1337/api/exams";
      if (user.role == "Student") examsLink = "http://localhost:1337/api/exams/me";

      const examData = (await fetchAll(examsLink, user.token)) as Exam[];

      let tempNew: Notification[] = [];
      let tempOld: Notification[] = [];
      let accReq: Notification[] = [];
      let all: Notification[] = [];

      let prop: Notification[] = [];

      data.forEach((element: any) => {
        let el = new Notification(element.information, element.oldInformation, element.sentBy, element.exam_id);
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

        if (thread[thread.length - 1].type == "proposeChange") {
          hasChange = true;
        }

        thread.forEach((notif) => {
          if (hasUnread && !hasThread([tempNew, tempOld, accReq], notif)) tempNew.push(notif);
          else if (!hasThread([tempNew, tempOld, accReq], notif) && !hasChange) tempOld.push(notif);
          else if (!hasThread([tempNew, tempOld, accReq], notif) && thread[thread.length - 1].sentBy != user.user) accReq.push(notif);
          else if (!hasThread([tempNew, tempOld, accReq], notif)) tempOld.push(notif);
        });
      });

      if (all.length != 0) setNotifications(all);
      if (tempNew.length != 0) setNewNotifications(tempNew);
      if (tempOld.length != 0) setSeenNotifications(tempOld);
      if (accReq.length != 0) setActionsRequired(accReq);

      if (prop.length != 0) setProposals(prop.reverse());
      if (examData != undefined) setExams(examData);
    } catch (error) {
      showToast({ message: `${t("Error fetching notifications")}: ${error}.`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (reactLocation.pathname === "/"+ user.role.toLowerCase() +"/notifications") {
      fetchNotifications(); // Fetch immediately when user lands on the page
      interval = setInterval(fetchNotifications, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval); // Clear interval when user leaves
    };
  }, [reactLocation.pathname]); // Trigger useEffect when route changes

  const fetchDropdownOptions = async () => {
    try {
      const [studentsRes, tutorsRes, examinersRes, majorsRes, institutesRes, modesRes, roomsRes] = await Promise.all([
        fetch(studentRoute, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }).then((res) => res.json()),
        fetch(tutRoute, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }).then((res) => res.json()),
        fetch("http://localhost:1337/api/examiners", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }).then((res) => res.json()),
        fetch("http://localhost:1337/api/majors", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }).then((res) => res.json()),
        fetch("http://localhost:1337/api/institutes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }).then((res) => res.json()),
        fetch("http://localhost:1337/api/exam-modes", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }).then((res) => res.json()),
        fetch("http://localhost:1337/api/rooms", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
          .then((res) => res.json())
          .then((rooms) => rooms.filter((room: Room) => room.isAvailable === true)),
      ]);

      setOptions({
        students: studentsRes,
        tutors: tutorsRes,
        examiners: examinersRes,
        majors: majorsRes,
        institutes: institutesRes,
        modes: modesRes,
        rooms: roomsRes,
      });
    } catch (error) {
      showToast({ message: t("Error fetching dropdown options"), type: "error" });
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchDropdownOptions();
  }, []);

  const getExam = (id: number): Exam => {
    if (id == 0) return new Exam();

    let x = new Exam();

    exams?.forEach((element) => {
      if (Number(element.id) == Number(id)) {
        x = element;
        return element;
      }
    });
    return x;
  };

  const [openId, setOpenId] = useState<undefined | number>(Number(id));

  if (loading) {
    return (
      <p aria-live="polite" aria-busy="true">{t("Loading notifications...")}</p>
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
