"use client";
import { useEffect, useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { parse, differenceInCalendarDays } from "date-fns";
import { redirect } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(raw))
    return parse(raw, "dd.MM.yyyy", new Date());

  const match = raw.match(/^(\d{1,2})\s+([a-zżźćńółęąś]{3,})$/i);
  if (match) {
    const day = match[1].padStart(2, "0");
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
    const month = months[match[2].toLowerCase().slice(0, 3)];
    if (month)
      return parse(
        `${day}.${month}.${new Date().getFullYear()}`,
        "dd.MM.yyyy",
        new Date()
      );
  }

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
    if (month)
      return parse(
        `${day}.${month}.${new Date().getFullYear()}`,
        "dd.MM.yyyy",
        new Date()
      );
  }

  return new Date();
}

function getEventColorClass(subdesc: string): string {
  const desc = subdesc.toLowerCase();
  if (desc.includes("zniżka")) return "green";
  if (
    desc.includes("wydarzenie w grze") ||
    desc.includes("wydarzenie z łupami") ||
    desc.includes("wydarzenie z korzyściami")
  )
    return "gold";
  if (desc.includes("aktualności")) return "blue";
  return "";
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [fetchedEvents, setFetchedEvents] = useState<FetchedEvent[]>([]);
  const [editInputs, setEditInputs] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setIsAdmin(user.email === "admin@example.com");
      }
    });

    fetch("/steam-events.json")
      .then((res) => res.json())
      .then((data: FetchedEvent[]) => {
        setFetchedEvents(data);
        setEditInputs(data.map(() => ""));
        setEvents(
          data.map((e) => ({
            title: (e.customTitle?.trim() || e.title || "Bez tytułu") as string,
            start: normalizeDate(e.date),
            end: normalizeDate(e.date),
            allDay: true,
            link: e.link,
          }))
        );
      });
  }, []);

  function handleInputChange(index: number, value: string) {
    const updated = [...editInputs];
    updated[index] = value;
    setEditInputs(updated);
  }

  function rowColor(subdesc: string): string {
    const desc = subdesc.toLowerCase();
    if (desc.includes("zniżka")) return "bg-green-200";
    if (
      desc.includes("wydarzenie w grze") ||
      desc.includes("wydarzenie z łupami") ||
      desc.includes("wydarzenie z korzyściami") ||
      desc.includes("premia do pd")
    )
      return "bg-yellow-200";
    if (desc.includes("aktualności") || desc.includes("ważna aktualizacja"))
      return "bg-blue-300";
    return "";
  }

  function handleSave() {
    if (!isAdmin) return;

    if (confirm("Na pewno zapisać zmiany do pliku JSON?")) {
      const updated = fetchedEvents.map((e, i) => ({
        ...e,
        customTitle:
          editInputs[i].trim() === "" ? e.customTitle || "" : editInputs[i],
      }));

      fetch("/api/save-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      })
        .then((res) => {
          if (res.ok) {
            alert("Zapisano zmiany.");
            setFetchedEvents(updated);
            setEditInputs(updated.map(() => ""));
            setEvents(
              updated.map((e) => ({
                title: e.customTitle?.trim() !== "" ? e.customTitle : e.title,
                start: normalizeDate(e.date),
                end: normalizeDate(e.date),
                allDay: true,
                link: e.link,
              }))
            );
          } else {
            alert("Błąd zapisu.");
          }
        })
        .catch(() => alert("Błąd sieci przy zapisie."));
    }
  }

  const filteredEvents = fetchedEvents.filter((e) => {
    const title = e.customTitle?.trim() || e.title;
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  function handleUpdate() {
    if (!isAdmin) return;

    if (confirm("Pobrać najnowsze dane z /api/events?")) {
      fetch("/api/events")
        .then((res) => {
          if (!res.ok) throw new Error("Błąd pobierania");
          return res.json();
        })
        .then((data: FetchedEvent[]) => {
          setFetchedEvents(data);
          setEditInputs(data.map(() => ""));
          setEvents(
            data.map((e) => ({
              title: e.customTitle?.trim()
                ? e.customTitle.trim()
                : e.title || "",
              start: normalizeDate(e.date),
              end: normalizeDate(e.date),
              allDay: true,
              link: e.link,
            }))
          );
          alert("Dane zostały zaktualizowane.");
        })
        .catch(() => alert("Błąd przy aktualizacji danych."));
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {isAdmin && (
        <button
          onClick={handleUpdate}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Aktualizuj dane
        </button>
      )}

      <div className="w-full mb-2 text-right text-sm text-gray-600">
        {userEmail ? `Zalogowano jako: ${userEmail}` : "Nie zalogowano"}
      </div>

      {isAdmin && (
        <button
          onClick={handleSave}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Zapisz zmiany
        </button>
      )}

      <div className="w-full">
        <h1 className="text-2xl font-bold mb-4">
          Lista eventów NosTale (Steam)
        </h1>

        <input
          type="text"
          placeholder="Szukaj eventu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
        />

        <table className="w-full text-sm border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Tytuł</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Link</th>
              <th className="p-2 text-left">Ile dni temu</th>
              <th className="p-2 text-left">Edytuj</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map((e, i) => {
              const parsedDate = normalizeDate(e.date);
              const daysAgo = e.date.toLowerCase().includes("brak")
                ? "-"
                : `${differenceInCalendarDays(
                    new Date(),
                    parsedDate
                  )} dni temu`;
              return (
                <tr key={i} className={`border-t ${rowColor(e.subdesc)}`}>
                  <td className="p-2">
                    {e.customTitle?.trim() !== "" ? e.customTitle : e.title}
                  </td>
                  <td className="p-2">{e.date}</td>
                  <td className="p-2">
                    <a
                      href={e.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Otwórz
                    </a>
                  </td>
                  <td className="p-2">{daysAgo}</td>
                  <td className="p-2">
                    {isAdmin ? (
                      <input
                        value={editInputs[i] || ""}
                        onChange={(ev) => handleInputChange(i, ev.target.value)}
                        className="border rounded p-1 w-full"
                        placeholder="Własny tytuł"
                      />
                    ) : (
                      <span className="text-gray-500 italic">Tylko admin</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
