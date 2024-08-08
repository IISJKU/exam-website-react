interface ExamDateProps {
  date: string;
}

export default function ExamDate(props: ExamDateProps) {
  let date = new Date(props.date);
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];

  return (
    <td>
      {date.getDate()} {month[date.getMonth()]} {date.getFullYear()}
    </td>
  );
}
