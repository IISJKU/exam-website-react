import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar as BigCalendar, momentLocalizer, Views, Event } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/ToastMessage";
import Exam from "../../classes/Exam";
import { useAuth } from "../../../hooks/AuthProvider";
import fetchAll from "./FetchAll";
import { t } from "i18next";

const localizer = momentLocalizer(moment);

interface RoomsCalenderProps {
  selectedRoomId: number | null;
}

export default function RoomsCalender({ selectedRoomId }: RoomsCalenderProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const user = useAuth();

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 8),
    }),
    []
  );

  // Fetch exams from the API, filtered by selected room
  const fetchExams = async () => {
    try {
      const data = (await fetchAll("http://localhost:1337/api/exams", user.token, "Http error!")) as Exam[];
      const filteredExams = selectedRoomId ? data.filter((exam) => exam.room_id === selectedRoomId) : [];
      setExams(filteredExams);
    } catch (error) {
      showToast({ message: `Error fetching exams: ${error}.`, type: "error"});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [selectedRoomId]);

  useEffect(() => {
    // Generate events once exams are fetched
    const newEvents = exams.map((exam: Exam) => {
      const start = new Date(exam.date);
      const end = moment(start).add(exam.duration, "m").toDate();
      return {
        title: exam.title,
        start,
        end,
        resource: exam,
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
    return <p aria-live="polite" aria-busy="true">{t("Loading exams...")}</p>;
  }

  return (
    <div role="region" aria-label="Rooms Calendar" tabIndex={-1} className="rooms-calendar">
      <BigCalendar
        defaultDate={defaultDate}
        defaultView={Views.WEEK}
        scrollToTime={scrollToTime}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        style={{ height: 700 }}
        aria-labelledby="calendar-title"
        components={{
          event: ({ event }: { event: Event }) => (
            <div
              role="button"
              tabIndex={0}
              aria-label={`Exam: ${event.title}, starts at ${moment(event.start).format(
                "h:mm A"
              )} and ends at ${moment(event.end).format("h:mm A")}`}
              onClick={() => handleSelectEvent(event)}
              onKeyDown={(e) => {
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
          week: "Week View",
          day: "Day View",
          month: "Month View",
          today: "Today",
          previous: "Previous",
          next: "Next",
        }}
      />
        <h2 id="calendar-title" className="sr-only">
        {t("Room management Calendar")}
      </h2>
    </div>
  );
}
