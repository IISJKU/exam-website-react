interface ExamDateProps {
  date: string;
}

export default function ExamDate(props: ExamDateProps) {
  let date = new Date(props.date);
  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const months = [
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

  const formattedDate = `${weekdays[date.getDay()]}, ${date.getDate()} ${
    months[date.getMonth()]
  } ${date.getFullYear()}`;

  return (
    <td aria-label="Exam Date" role="cell">
      <time dateTime={date.toISOString()}>{formattedDate}</time>
    </td>
  );
}
