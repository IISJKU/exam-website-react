import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, Views, DateLocalizer } from "react-big-calendar";
import moment from "moment";
import { Event } from "react-big-calendar";

import { InfoBoxView } from "../InfoBox";

import examData from "../../../TestData/Exams.json";
import Exam from "../../classes/Exam";

const localizer = momentLocalizer(moment);

interface CalendarProps {
  date?: Date;
  callback: Function;
}

export default function BigCalendar(props: CalendarProps) {
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];
  const times = [];
  const [events, setEvents] = useState(getExams());

  let days: Date[] = [];

  const [date, setDate] = useState(props.date);

  const [view, setView] = useState(Views.WEEK);

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(2015, 3, 13),
      scrollToTime: new Date(1970, 1, 1, 8),
    }),
    []
  );

  useEffect(() => {
    setDate(props.date);
  }, [props]);

  const handleSelectEvent = useCallback((event: Event) => {
    for (var i = 0; i < examData.length; i++) {
      if (event.title == examData[i].name) {
        props.callback(InfoBoxView.ExamEditor, event.start, examData[i]);
      }
    }
  }, []);
  let examsThisWeek: Exam[] = [];

  // props.callback(InfoBoxView.ExamEditor, event.start, examData[events.indexOf(event)]}

  let examPositions: number[][] = [];

  function getExams() {
    let tEvents: Event[] = [];
    examData.forEach((exam, index) => {
      let start = new Date(exam.date);
      let end = moment(start).add(exam.duration, "m").toDate();

      let date = new Date(exam.date);
      tEvents.push({
        title: exam.name,
        start: start,
        end: end,
      });
    });

    return tEvents;
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
        onNavigate={(date) => {
          setDate(new Date(date));
        }}
        popup
      />
    </div>
  );
}
