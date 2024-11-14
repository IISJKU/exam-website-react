import { useAuth } from "../../../hooks/AuthProvider";
import { useEffect, useState } from "react";
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

export default function NotificationView() {
  const user = useAuth();
  const { t } = useTranslation();
  const { id } = useParams(); // Get exam ID from URL params

  const [exams, setExams] = useState<Exam[]>();

  const [proposals, setProposals] = useState<Notification[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [seenNotifications, setSeenNotifications] = useState<Notification[]>([]);
  const [newNotifications, setNewNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading

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
    studentRoute = "http://localhost:1337/api/students/me";
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

  const hasThread = (arr: Notification[][], notif: Notification): boolean => {
    let has = false;

    arr.forEach((messages) => {
      messages.forEach((message) => {
        if (message.exam_id == notif.exam_id && message.id != notif.exam_id && message.exam_id != 0) has = true;
      });
    });

    return has;
  };

  // Fetch data from Strapi API
  const fetchNotifications = async () => {
    try {
      const response = await fetch(notificationRoute, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      //let c = await response.json();
      //console.log(c);
      let data = await response.json(); //should probably rewrite api response, instead of changing stuff here
      //if (user.role == "Admin") data = data.data;

      if (!response.ok) {
        showToast({ message: `HTTP error! Status: ${response.status}, Message: ${data.error.message || "Unknown error"}.`, type: "error" });
      }

      const examData = (await fetchAll("http://localhost:1337/api/exams", user.token)) as Exam[];

      let tempNew: Notification[] = [];
      let tempOld: Notification[] = [];
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

      console.log(all);

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
        thread.forEach((notif) => {
          if ((notif.seenBy.length == 0 || !notif.seenBy.includes(user.user)) && notif.sentBy != user.user) {
            hasUnread = true;
          }
        });

        thread.forEach((notif) => {
          if (hasUnread && !hasThread([tempNew, tempOld], notif)) tempNew.push(notif);
          else if (!hasThread([tempNew, tempOld], notif)) tempOld.push(notif);
        });
      });

      if (tempNew.length != 0) setNewNotifications(tempNew.reverse());
      if (tempOld.length != 0) setSeenNotifications(tempOld.reverse());
      if (all.length != 0) setNotifications(all);

      if (prop.length != 0) setProposals(prop.reverse());
      if (examData != undefined) setExams(examData);
    } catch (error) {}
  };

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
        }).then((res) => res.json()),
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
      showToast({ message: "Error fetching dropdown options", type: "error" });
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

    /*
    seenNotifications.forEach((element) => {
      if (Number(element.id) == Number(id)) {
        notifs.push(element);
      }
    }); */

    return notifs;
  };

  const [openId, setOpenId] = useState<undefined | number>(Number(id));

  return (
    <div className="w-full h-full p-5 select-none">
      <div className="flex w-full content-center items-center ">
        <h2 className="text-4xl w-1/3 my-2 ">{t("Notifications")}</h2>
        {/*<SearchBar items={props.data} filter={setFilteredData} /> */}
      </div>
      <div className="h-5"></div>

      {proposals.length != 0 ? (
        <div>
          <div className="text-2xl font-bold">Proposed Exams</div>
          <ul className="w-full text-left border-2">
            {proposals.map((elem) => (
              <NotificationComponent
                exam={getExam(elem.exam_id)}
                options={options}
                notification={[elem]}
                id={elem.id}
                exam_id={elem.exam_id}
                sentBy={elem.sentBy}
                openId={openId}
              />
            ))}
          </ul>
        </div>
      ) : (
        <></>
      )}
      {newNotifications.length != 0 ? (
        <div>
          <div className="text-2xl font-bold">New Notifications</div>
          <ul className="w-full text-left border-2">
            {newNotifications.map((elem) => (
              <NotificationComponent
                exam={getExam(elem.exam_id)}
                options={options}
                notification={elem.exam_id == 0 ? [elem] : getNotifications(elem.id)}
                id={elem.id}
                exam_id={elem.exam_id}
                sentBy={elem.sentBy}
                openId={openId}
              />
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
              <NotificationComponent
                exam={getExam(elem.exam_id)}
                options={options}
                notification={elem.exam_id == 0 ? [elem] : getNotifications(elem.id)}
                id={elem.id}
                exam_id={elem.exam_id}
                sentBy={elem.sentBy}
                openId={openId}
              />
            ))}
          </ul>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}
