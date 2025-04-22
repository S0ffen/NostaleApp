"use client";
import { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { parse, format, startOfWeek, getDay } from "date-fns";
import { pl } from "date-fns/locale";

const locales = {
  pl: pl,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

type Event = {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  link: string;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("/events.json")
      .then((res) => res.json())
      .then((data) => {
        const parsed: Event[] = data.map((e: any) => {
          const rangeRegex = /\[(\d{2})\/(\d{2})\s*-\s*(\d{2})\/(\d{2})\]/; // [17/04 - 22/04]
          const match = e.title.match(rangeRegex);

          if (match) {
            const [, startDay, startMonth, endDay, endMonth] = match;
            const year = parse(e.date, "dd.MM.yyyy", new Date()).getFullYear();

            const startDate = new Date(`${year}-${startMonth}-${startDay}`);
            const endDate = new Date(`${year}-${endMonth}-${endDay}`);
            return {
              title: e.title,
              start: startDate,
              end: endDate,
              allDay: true,
              link: e.link, // ✅ dodaj link
            };
          } else {
            const d = parse(e.date, "dd.MM.yyyy", new Date());
            return {
              title: e.title,
              start: d,
              end: d,
              allDay: true,
              link: e.link, // ✅ dodaj link
            };
          }
        });
        setEvents(parsed);
      });
  }, []);

  const [sortAsc, setSortAsc] = useState(true);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) =>
      sortAsc
        ? a.start.getTime() - b.start.getTime()
        : b.start.getTime() - a.start.getTime()
    );
  }, [events, sortAsc]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kalendarz eventów NosTale</h1>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={["month", "week", "day", "agenda"]}
        culture="pl"
        onSelectEvent={(event) => {
          if (event.link) {
            window.open(event.link, "_blank");
          }
        }}
      />
      <h2 className="text-xl font-semibold mt-10 mb-4">Lista eventów</h2>
      <table className="w-full text-sm border border-gray-300 rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Tytuł</th>
            <th
              className="p-2 text-left cursor-pointer hover:text-blue-500"
              onClick={() => setSortAsc(!sortAsc)}
            >
              Data {sortAsc ? "▲" : "▼"}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedEvents.map((e, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">
                <a
                  href={e.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {e.title}
                </a>
              </td>
              <td className="p-2">{e.start.toLocaleDateString("pl-PL")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
