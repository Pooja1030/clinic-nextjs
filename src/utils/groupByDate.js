"use client";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

export function groupByDateLabel(dateStr) {
  const date = dayjs(dateStr);
  if (date.isToday()) return "Today";
  if (date.isYesterday()) return "Yesterday";
  return dayjs(dateStr).format("MMM D, YYYY");
}

export function groupByDate(items, dateField = "createdAt") {
  return items.reduce((acc, item) => {
    const label = groupByDateLabel(item[dateField]);
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});
}
