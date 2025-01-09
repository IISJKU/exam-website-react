import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, momentLocalizer, Views, Event } from "react-big-calendar";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import Exam, { ExamStatus } from "../../classes/Exam";
import { useAuth } from "../../../hooks/AuthProvider";
import fetchAll from "./FetchAll";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

const localizer = momentLocalizer(moment);

export default function BigCalendar() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [exams, setExams] = useState<Exam[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const user = useAuth();
  const { t } = useTranslation();

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(2015, 3, 13),
      scrollToTime: new Date(1970, 1, 1, 8),
    }),
    []
  );

  const location = useLocation();
  useEffect(() => {
    if (location.pathname.includes("calendar")) {
      let path = location.pathname;
      let dateString = path.substring(path.indexOf("/", path.indexOf("calendar")) + 1, path.length);

      setDate(new Date(dateString));
    }
  }, [location]);

  // Fetch data from Strapi API
  const fetchExams = async () => {
    try {
      const data = (await fetchAll("http://localhost:1337/api/exams", user.token, "Http error!")) as Exam[];
      // Filter out exams with the status not "archived"
      const filteredExams = data.filter((exam) => exam.status !== ExamStatus.archived);
      setExams(filteredExams);
    } catch (error) {
      showToast({ message: `${t("Error fetching exams")}: ${error}.`, type: "error" });
    } finally {
      setLoading(false); // Set loading to false when fetch is complete
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    // Generate events once exams are fetched
    const newEvents = exams.map((exam: any) => {
      const start = new Date(exam.date);
      const end = moment(start).add(exam.duration, "m").toDate();
      return {
        title: exam.title,
        start,
        end,
        id: exam.id,
      };
    });
    setEvents(newEvents);
  }, [exams]);

  const handleSelectEvent = useCallback(
    (event: Event) => {
      const selectedExam = exams.find((exam) => event.title === exam.title);
      if (selectedExam) {
        navigate(`/admin/exams/${selectedExam.id}`);
      }
    },
    [exams, navigate]
  );

  if (loading) {
    return <p aria-live="polite" aria-busy="true">{t("Loading exams...")}</p>; // Display loading indicator while fetching
  }

  return (
    <div role="region" aria-label={t("Admin Exam Calendar")} tabIndex={-1} className="admin-calendar">
      <Calendar
        defaultDate={defaultDate}
        defaultView={view}
        scrollToTime={scrollToTime}
        localizer={localizer}
        events={events}
        date={date}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        style={{ height: 700 }}
        onNavigate={(newDate) => setDate(newDate)}
        popup
        aria-labelledby="calendar-title"
        aria-label={t("Exam Calendar view")}
        components={{
          event: ({ event }: { event: Event }) => (
            <div
              role="button"
              tabIndex={0}
              aria-label={`${t("Exam")}: ${event.title}, ${t("starts at")} ${moment(event.start).format(
                "h:mm A"
              )} ${t("and ends at")} ${moment(event.end).format("h:mm A")}`}
              onClick={() => handleSelectEvent(event)}
              onKeyDown ={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSelectEvent(event);
                }
              }}
              style={{ cursor: "pointer" }}
            >
              {event.title}
            </div>
          ),
        }}
        messages={{
          week: t("Week View"),
          day: t("Day View"),
          month: t("Month View"),
          today: t("Today"),
          previous: t("Previous"),
          next: t("Next"),
        }}
      />
      <h2 id="calendar-title" className="sr-only">
        {t("Admin Exam Calendar")}
      </h2>
    </div>
  );
}
