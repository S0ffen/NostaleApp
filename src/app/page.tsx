"use client";
import { useEffect, useState } from "react";

type Event = {
  title: string;
  link: string;
  date: string;
};

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Eventy NosTale</h1>
      {loading && <p>Wczytywanie...</p>}
      {!loading && events.length === 0 && <p>Brak eventów</p>}
      <ul className="space-y-3">
        {events.map((event, i) => (
          <li key={i} className="border p-4 rounded shadow">
            <a
              href={event.link}
              target="_blank"
              className="text-blue-500 hover:underline"
            >
              {event.title}
            </a>
            <div className="text-gray-600 text-sm">{event.date}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
