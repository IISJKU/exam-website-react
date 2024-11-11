import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Calendar, momentLocalizer, Views, Event } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/ToastMessage";
import Exam from "../../classes/Exam";
import { useAuth } from "../../../hooks/AuthProvider";

const localizer = momentLocalizer(moment);

export default function TutorBigCalender() {
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
      const response = await fetch(`http://localhost:1337/api/exams/tutor/${user.userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        showToast({ message: `HTTP error! Status: ${response.status}, Message: ${data.error.message || "Unknown error"}.`, type: "error", });
      }
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
    return <p>Loading exams...</p>; // Display loading indicator while fetching
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
      />
    </div>
  );
}