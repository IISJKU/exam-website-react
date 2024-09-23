import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
  DateLocalizer,
  Event,
} from "react-big-calendar";
import moment from "moment";

import { InfoBoxView } from "../InfoBox";
import Exam from "../../classes/Exam"; 

const localizer = momentLocalizer(moment);

interface CalendarProps {
  date?: Date;
  callback: Function;
}

export default function BigCalendar(props: CalendarProps) {
  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [date, setDate] = useState(props.date);
  const [view, setView] = useState(Views.WEEK);
  const [exams, setExams] = useState<Exam[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // State for loading

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(2015, 3, 13),
      scrollToTime: new Date(1970, 1, 1, 8),
    }),
    []
  );

  // Fetch data from Strapi API
  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:1337/api/exams");
      const data = await response.json();
      setExams(data["data"].map((exam: any) => exam.attributes)); // Map to attributes
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false); // Set loading to false when fetch is complete
    }
  };

  // Update events after fetching exams
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
  }, [exams]); // This will run every time `exams` is updated

  useEffect(() => {
    setDate(props.date);
  }, [props]);

  const handleSelectEvent = useCallback(
    (event: Event) => {
      const selectedExam = exams.find((exam) => event.title === exam.title);
      if (selectedExam) {
        props.callback(selectedExam);
      }
    },
    [exams, props]
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
        events={events} // Use the state that holds events
        date={date}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        style={{ height: 700 }}
        onNavigate={(date) => {
          setDate(new Date(date));
        }}
        popup
      />
    </div>
  );
}
