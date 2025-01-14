import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, momentLocalizer, Views, Event } from "react-big-calendar";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import Exam from "../../classes/Exam";
import { useAuth } from "../../../hooks/AuthProvider";
import { useTranslation } from "react-i18next";
import config from "../../../config";

const localizer = momentLocalizer(moment);

export default function TutorBigCalender() {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const [exams, setExams] = useState<Exam[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const user = useAuth();

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
      const response = await fetch(`${config.strapiUrl}/api/exams/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        showToast({ message: `${t("HTTP error!")} ${t("Status")}: ${response.status}, ${t("Message")}: ${data.error.message || t("Unknown error")}}.`, type: "error"});
      }
      setExams(data);
    } catch (error) {
      showToast({ message: `${t("Error fetching exams")}: ${error}.`, type: "error" });
    } finally {
      setLoading(false);
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
      };
    });
    setEvents(newEvents);
  }, [exams]);

  const handleSelectEvent = useCallback(
    (event: Event) => {
      const selectedExam = exams.find((exam) => event.title === exam.title);
      if (selectedExam) {
        // Use navigate to go to the exam details route (you can adjust the route as needed)
        navigate(`/tutor/remove-tutor/${selectedExam.id}`);
      }
    },
    [exams, navigate]
  );

  if (loading) {
    return <p aria-live="polite" aria-busy="true">{t("Loading exams...")}</p>; // Display loading indicator while fetching
  }

  return (
    <div role="region" aria-label={t("Tutor Exam Calendar")} className="tutor-big-calendar">
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
              aria-label={`${t("Exam")}: ${event.title}, ${t("starts at")} ${moment(event.start).format("h:mm A")} ${t("and ends at")} ${moment(event.end).format("h:mm A")}`}
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
        {t("Tutor Exam Calendar")}
      </h2>
    </div>
  );
}
