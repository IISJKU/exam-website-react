import { HTMLInputTypeAttribute, MouseEventHandler } from "react";
import { useState } from "react";

interface CalendarProps {}

export default function VerticalCallender(props: CalendarProps) {
  return <div className="w-full h-full" role="grid" aria-label="Vertical Calendar"></div>;
}
