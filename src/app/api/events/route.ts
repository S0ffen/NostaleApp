// src/app/api/events/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { writeFile } from "fs/promises";
import path from "path";

const BASE_URL =
  "https://forum.nostale.gameforge.com/forum/board/106-news-announcements";
const NUM_PAGES = 11;

export async function GET() {
  type RawEvent = {
    title: string;
    link: string;
    date: string;
  };

  const allEvents: RawEvent[] = [];

  for (let i = 1; i <= NUM_PAGES; i++) {
    const url = i === 1 ? BASE_URL : `${BASE_URL}/?pageNo=${i}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const html = await res.text();
    const $ = cheerio.load(html);

    $("li.tabularListRow").each((_, el) => {
      const title = $(el).find("a.messageGroupLink").text().trim();
      const href = $(el).find("a.messageGroupLink").attr("href");
      const datetime = $(el)
        .find("li.messageGroupTime time.datetime")
        .attr("datetime");
      const date = datetime
        ? new Date(datetime).toLocaleDateString("pl-PL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "brak daty";

      if (title.toLowerCase().includes("event")) {
        allEvents.push({
          title,
          link: href?.startsWith("http")
            ? href
            : `https://forum.nostale.gameforge.com${href ?? ""}`,
          date,
        });
      }
    });
  }
  const filePath = path.join(process.cwd(), "public", "events.json");
  await writeFile(filePath, JSON.stringify(allEvents, null, 2), "utf-8");

  return NextResponse.json(allEvents);
}
