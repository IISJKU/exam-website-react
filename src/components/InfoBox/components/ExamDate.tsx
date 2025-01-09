import { useTranslation } from "react-i18next";

interface ExamDateProps {
  date: string;
}

export default function ExamDate(props: ExamDateProps) {
  const { t } = useTranslation();
  const date = new Date(props.date);

  const weekdays = [
    t("Monday"),
    t("Tuesday"),
    t("Wednesday"),
    t("Thursday"),
    t("Friday"),
    t("Saturday"),
    t("Sunday"),
  ];

  const months = [
    t("January"),
    t("February"),
    t("March"),
    t("April"),
    t("May"),
    t("June"),
    t("July"),
    t("August"),
    t("September"),
    t("October"),
    t("November"),
    t("December"),
  ];

  const formattedDate = `${weekdays[date.getDay()]}, ${date.getDate()} ${
    months[date.getMonth()]
  } ${date.getFullYear()}`;

  return (
    <td aria-label={t("Exam Date")} role="cell">
      <time dateTime={date.toISOString()}>{formattedDate}</time>
    </td>
  );
}
