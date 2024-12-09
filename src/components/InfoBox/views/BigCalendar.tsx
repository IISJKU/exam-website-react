import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, momentLocalizer, Views, Event } from "react-big-calendar";
import moment from "moment";
import { showToast } from "../components/ToastMessage";
import Exam from "../../classes/Exam";
import { useAuth } from "../../../hooks/AuthProvider";
import fetchAll from "./FetchAll";

const localizer = momentLocalizer(moment);

export default function BigCalendar() {
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
      const data = (await fetchAll("http://localhost:1337/api/exams", user.token, "Http error!")) as Exam[];
      setExams(data);
    } catch (error) {
      showToast({ message: `Error fetching exams: ${error}.`, type: "error" });
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
    return <p aria-live="polite">Loading exams...</p>; // Display loading indicator while fetching
  }

  return (
    <div>
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
        aria-label="Exam Calendar view"
        eventPropGetter={(event, start, end, isSelected) => {
          return {
            style: {
              cursor: "pointer",
            },
            "aria-label": `${event.title} from ${moment(start).format("LLLL")} to ${moment(end).format("LLLL")}`,
          };
        }}
      />
    </div>
  );
}
