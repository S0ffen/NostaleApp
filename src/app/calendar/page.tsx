"use client";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { parse, format, startOfWeek, getDay } from "date-fns";
import { pl } from "date-fns/locale";

const locales = { pl };

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
  customTitle?: string;
  date: string;
  subdesc: string;
  link: string;
};

function normalizeDate(raw: string): Date {
  if (!raw || raw.toLowerCase().includes("brak")) return new Date();

  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw)) {
    return parse(raw, "dd.MM.yyyy", new Date());
  }

  const match = raw.match(/^(\d{1,2})\s+([a-zżźćńółęąś]{3,})$/i);
  if (match) {
    const day = match[1].padStart(2, "0");
    const monthName = match[2].toLowerCase();
    const months: Record<string, string> = {
      sty: "01",
      lut: "02",
      mar: "03",
      kwi: "04",
      maj: "05",
      cze: "06",
      lip: "07",
      sie: "08",
      wrz: "09",
      paź: "10",
      lis: "11",
      gru: "12",
    };
    const month = months[monthName.slice(0, 3)];
    if (month) {
      const year = new Date().getFullYear();
      return parse(`${day}.${month}.${year}`, "dd.MM.yyyy", new Date());
    }
  }
  const [currentDate, setCurrentDate] = useState(new Date());

  const subMatch = raw.match(/^(\d{1,2})\s+([A-ZŻŹĆŁŚĘÓŃ]{3})$/i);
  if (subMatch) {
    const day = subMatch[1].padStart(2, "0");
    const monthTxt = subMatch[2].toLowerCase().slice(0, 3);
    const months: Record<string, string> = {
      sty: "01",
      lut: "02",
      mar: "03",
      kwi: "04",
      maj: "05",
      cze: "06",
      lip: "07",
      sie: "08",
      wrz: "09",
      paź: "10",
      lis: "11",
      gru: "12",
    };
    const month = months[monthTxt];
    if (month) {
      const year = new Date().getFullYear();
      return parse(`${day}.${month}.${year}`, "dd.MM.yyyy", new Date());
    }
  }

  return new Date();
}

function getEventColorClass(subdesc: string): string {
  const desc = subdesc.toLowerCase();
  if (desc.includes("zniżka")) return "green";
  if (desc.includes("wydarzenie w grze")) return "gold";
  if (desc.includes("wydarzenie z łupami")) return "gold";
  if (desc.includes("wydarzenie z korzyściami")) return "gold";
  if (desc.includes("aktualności")) return "blue";
  return "";
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [fetchedEvents, setFetchedEvents] = useState<FetchedEvent[]>([]);

  useEffect(() => {
    fetch("/steam-events.json")
      .then((res) => res.json())
      .then((data: FetchedEvent[]) => {
        setFetchedEvents(data);

        const parsed: Event[] = data.map((e) => {
          const titleToUse = e.customTitle || e.title;
          const d = normalizeDate(e.date);
          return {
            title: titleToUse,
            start: d,
            end: d,
            allDay: true,
            link: e.link,
          };
        });

        setEvents(parsed);
      });
  }, []);

  function handleTitleChange(index: number, value: string) {
    const updated = [...fetchedEvents];
    updated[index].customTitle = value;
    setFetchedEvents(updated);

    const parsed: Event[] = updated.map((e) => {
      const titleToUse = e.customTitle || e.title;
      const d = normalizeDate(e.date);
      return {
        title: titleToUse,
        start: d,
        end: d,
        allDay: true,
        link: e.link,
      };
    });

    setEvents(parsed);
  }

  function rowColor(subdesc: string): string {
    if (subdesc.toLowerCase().includes("zniżka")) return "bg-green-100";
    if (subdesc.toLowerCase().includes("wydarzenie w grze"))
      return "bg-yellow-100";
    if (subdesc.toLowerCase().includes("wydarzenie z łupami"))
      return "bg-yellow-100";
    if (subdesc.toLowerCase().includes("wydarzenie z korzyściami"))
      return "bg-yellow-100";
    if (subdesc.toLowerCase().includes("aktualności")) return "bg-blue-100";
    return "";
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* KALENDARZ NA GÓRZE */}
      <div className="w-full">
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
          eventPropGetter={(event) => {
            const fetched = fetchedEvents.find(
              (e) => (e.customTitle || e.title) === event.title
            );
            const color = fetched ? getEventColorClass(fetched.subdesc) : "";
            return {
              style: {
                backgroundColor:
                  color === "green"
                    ? "#c6f6d5"
                    : color === "gold"
                    ? "#fefcbf"
                    : color === "blue"
                    ? "#bee3f8"
                    : undefined,
                color: "#000",
              },
            };
          }}
        />
      </div>

      {/* LISTA EVENTÓW POD KALENDARZEM */}
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-4">
          Lista eventów NosTale (Steam)
        </h1>
        <table className="w-full text-sm border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Tytuł</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Edytuj</th>
            </tr>
          </thead>
          <tbody>
            {fetchedEvents.map((e, i) => (
              <tr key={i} className={`border-t ${rowColor(e.subdesc)}`}>
                <td className="p-2">{e.customTitle || e.title}</td>
                <td className="p-2">{e.date}</td>
                <td className="p-2">
                  <input
                    value={e.customTitle || ""}
                    onChange={(ev) => handleTitleChange(i, ev.target.value)}
                    className="border rounded p-1 w-full"
                    placeholder="Własny tytuł"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
