"use client";

import * as React from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { DayPicker } from "react-day-picker";

// import { cn } from "./utils";
// import { buttonVariants } from "./button";

// Calendar component disabled - requires react-day-picker package
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: Record<string, unknown>) {
  return (
    <div className="p-3">
      <p>Calendar component requires react-day-picker package</p>
    </div>
  );
}

export { Calendar };
