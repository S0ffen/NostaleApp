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
type FetchedEvent = {
  title: string;
  link: string;
  date: string;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("/events.json")
      .then((res) => res.json())
      .then((data) => {
        const parsed: Event[] = (data as FetchedEvent[]).map((e) => {
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

  function normalizeTitle(title: string): string {
    return title.replace(/\[\d{2}\/\d{2} - \d{2}\/\d{2}\]/g, "").trim();
  }
  const [groupSort, setGroupSort] = useState<"count" | "date" | "title">(
    "count"
  );
  const [groupAsc, setGroupAsc] = useState(false);

  const groupedEvents = useMemo(() => {
    const map = new Map<string, { count: number; lastDate: Date }>();

    events.forEach((e) => {
      const key = normalizeTitle(e.title);
      const existing = map.get(key);

      if (!existing || e.start > existing.lastDate) {
        map.set(key, {
          count: (existing?.count || 0) + 1,
          lastDate: e.start,
        });
      } else {
        map.set(key, {
          count: (existing?.count || 0) + 1,
          lastDate: existing.lastDate,
        });
      }
    });

    const result = Array.from(map.entries()).map(([title, data]) => ({
      title,
      count: data.count,
      lastDate: data.lastDate,
      daysAgo: Math.floor(
        (Date.now() - data.lastDate.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));

    return result.sort((a, b) => {
      const direction = groupAsc ? 1 : -1;
      if (groupSort === "count") return direction * (a.count - b.count);
      if (groupSort === "date")
        return direction * (a.lastDate.getTime() - b.lastDate.getTime());
      return direction * a.title.localeCompare(b.title);
    });
  }, [events, groupSort, groupAsc]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6">
      {/* LEWA KOLUMNA */}
      <div className="flex flex-col lg:flex-row gap-6 p-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-4">Lista eventów NosTale</h1>

          <h2 className="text-xl font-semibold mt-10 mb-4">
            Powtarzające się eventy
          </h2>
          <table className="w-full text-sm border border-gray-300 rounded">
            <thead>
              <tr className="bg-gray-100">
                <th
                  className="p-2 text-left cursor-pointer hover:text-blue-500"
                  onClick={() => setGroupSort("title")}
                >
                  Nazwa
                </th>
                <th
                  className="p-2 text-left cursor-pointer hover:text-blue-500"
                  onClick={() => {
                    if (groupSort === "count") {
                      setGroupAsc(!groupAsc);
                    } else {
                      setGroupSort("count");
                      setGroupAsc(false);
                    }
                  }}
                >
                  Ilość {groupSort === "count" ? (groupAsc ? "▲" : "▼") : ""}
                </th>

                <th
                  className="p-2 text-left cursor-pointer hover:text-blue-500"
                  onClick={() => setGroupSort("date")}
                >
                  Ostatnio {groupSort === "date" ? (groupAsc ? "▲" : "▼") : ""}
                </th>
                <th className="p-2 text-left">Ile dni temu</th>
              </tr>
            </thead>
            <tbody>
              {groupedEvents.map((e, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">{e.title}</td>
                  <td className="p-2">{e.count}</td>
                  <td className="p-2">
                    {e.lastDate.toLocaleDateString("pl-PL")}
                  </td>
                  <td className="p-2">{e.daysAgo} dni temu</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRAWA KOLUMNA */}
      <div className="flex-1 overflow-auto max-h-[calc(100vh-100px)]">
        <h2 className="text-xl font-semibold mb-4">Kalendarz pomocniczy</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={["month"]}
          culture="pl"
          onSelectEvent={(event) => {
            if (event.link) {
              window.open(event.link, "_blank");
            }
          }}
        />
      </div>
    </div>
  );
}
