import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

type SteamEvent = {
  title: string;
  date: string;
  description: string;
  subdesc: string;
  link: string;
};

export async function GET() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });

    page.on("console", (msg) => {
      for (let i = 0; i < msg.args().length; i++) {
        msg
          .args()
          [i].jsonValue()
          .then((val) => console.log("📄", val));
      }
    });

    await page.goto("https://store.steampowered.com/news/app/550470", {
      waitUntil: "networkidle2",
    });

    console.log("🔃 Scrollowanie strony przez 80 sekund...");
    const start = Date.now();
    while (Date.now() - start < 130000) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await new Promise((r) => setTimeout(r, 1000));
    }
    console.log("⏱️ Scrollowanie zakończone.");

    const events: SteamEvent[] = await page.evaluate(() => {
      const results: SteamEvent[] = [];
      const MAX_EVENTS = 500;
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

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

      function inferYearFromMonth(month: number): string {
        return month > currentMonth
          ? String(currentYear - 1)
          : String(currentYear);
      }

      const eventAnchors = Array.from(
        document.querySelectorAll('a[href^="/news/app/550470/view/"]')
      );

      for (const a of eventAnchors) {
        if (results.length >= MAX_EVENTS) break;

        const link = "https://store.steampowered.com" + a.getAttribute("href");
        const title =
          a.querySelector("div._1M8-Pa3b3WboayCgd5VBJT")?.textContent?.trim() ||
          "Brak tytułu";
        const description =
          a.querySelector("div._2g3JjlrRkzgUWXF57w3leW")?.textContent?.trim() ||
          "Brak opisu";
        const subdescRaw = a.querySelector(
          "div.sUBHF-Qdb_RUPYOBkgO1a div:not(:has(div))"
        );
        const subdesc = subdescRaw?.textContent?.trim() || "";

        let dateInfo = "";

        // 🎯 1. Próba z <div class="Focusable"> np. "30 kwi"
        const focusDate = a.querySelector("div.Focusable")?.textContent?.trim();
        const focusMatch = focusDate?.match(/^(\d{1,2})\s+([a-z]{3})$/i);
        if (focusMatch) {
          const day = focusMatch[1].padStart(2, "0");
          const monthKey = focusMatch[2].toLowerCase().slice(0, 3);
          const month = months[monthKey];
          const year = inferYearFromMonth(parseInt(month));
          if (month) dateInfo = `${day}.${month}.${year}`;
        }

        // 🎯 2. Próba z description (np. "od 01.05.")
        if (!dateInfo) {
          const descMatch = description.match(/(\d{1,2})\.(\d{1,2})\./);
          if (descMatch) {
            const day = descMatch[1].padStart(2, "0");
            const month = descMatch[2].padStart(2, "0");
            const year = inferYearFromMonth(parseInt(month));
            dateInfo = `${day}.${month}.${year}`;
          }
        }

        // 🎯 3. Próba z rawDate z subdesc (jeśli np. "4 CZE 2024")
        const rawDate =
          a
            .querySelector("div.sUBHF-Qdb_RUPYOBkgO1a > div")
            ?.textContent?.trim() || "";
        if (!dateInfo) {
          const subMatch = rawDate.match(
            /(\d{1,2})\s+([A-ZŁŚŹŻĆŃÓĘa-złśźżćńóę]{3})\s+(\d{4})/
          );
          if (subMatch) {
            const day = subMatch[1].padStart(2, "0");
            const monthKey = subMatch[2].toLowerCase().slice(0, 3);
            const month = months[monthKey];
            const year = subMatch[3];
            if (month) dateInfo = `${day}.${month}.${year}`;
          }
        }

        const status =
          a.querySelector("div.EVDkYKG_ikfyfH16lmQ-1")?.textContent?.trim() ||
          "";

        results.push({
          title,
          description,
          subdesc,
          date: dateInfo || "brak daty",
          link,
        });
      }

      return results;
    });

    await browser.close();

    const publicDir = path.join(process.cwd(), "public");
    if (!existsSync(publicDir)) await mkdir(publicDir);

    const filePath = path.join(publicDir, "steam-events.json");
    await writeFile(filePath, JSON.stringify(events, null, 2), "utf-8");

    console.log(`📥 Pobrano ${events.length} eventów z Steam:`);
    events.forEach((ev, i) => {
      console.log(`${i + 1}. ${ev.title} [${ev.date}]`);
    });

    console.log("✅ Zapisano steam-events.json z eventami:", events.length);
    return NextResponse.json(events);
  } catch (error) {
    console.error("❌ Błąd:", error);
    return NextResponse.error();
  }
}
