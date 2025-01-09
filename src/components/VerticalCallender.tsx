import { HTMLInputTypeAttribute, MouseEventHandler } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CalendarProps {}

export default function VerticalCallender(props: CalendarProps) {
  const { t } = useTranslation();
  return <div className="w-full h-full" role="grid" aria-label={t("Vertical Calendar")}></div>;
}
