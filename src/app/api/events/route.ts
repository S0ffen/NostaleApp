import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { writeFile, mkdir } from "fs/promises";
import { readFile } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

type SteamEvent = {
  title: string;
  date: string;
  description: string;
  subdesc: string;
  link: string;
  customTitle?: string;
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

        // 🔎 Szukaj daty wewnątrz kontenera subdesc (Focusable)
        const subdescContainer = a.querySelector("div.sUBHF-Qdb_RUPYOBkgO1a");

        if (subdescContainer) {
          const innerDivs = subdescContainer.querySelectorAll("div");
          for (const div of innerDivs) {
            const text = div.textContent?.trim() || "";

            // ✳️ Próba pełnej daty "17 kwi 2024"
            const fullDateMatch = text.match(
              /^(\d{1,2})\s+([a-zA-Złżźćńóę]{3,})\s+(\d{4})$/
            );
            if (fullDateMatch) {
              const day = fullDateMatch[1].padStart(2, "0");
              const monthKey = fullDateMatch[2].toLowerCase().slice(0, 3);
              const month = months[monthKey];
              const year = fullDateMatch[3];
              if (month) {
                dateInfo = `${day}.${month}.${year}`;
                break;
              }
            }

            // ✳️ Próba skróconej daty "17 kwi"
            const shortMatch = text.match(
              /^(\d{1,2})\s+([a-zA-Złżźćńóę]{3,})$/
            );
            if (shortMatch) {
              const day = shortMatch[1].padStart(2, "0");
              const monthKey = shortMatch[2].toLowerCase().slice(0, 3);
              const month = months[monthKey];
              if (month) {
                const year = inferYearFromMonth(parseInt(month));
                dateInfo = `${day}.${month}.${year}`;
                break;
              }
            }
          }
        }

        // 🔁 Jeśli nadal brak daty — spróbuj z tekstu description
        if (!dateInfo) {
          const descMatch = description.match(/(\d{1,2})\.(\d{1,2})\./);
          if (descMatch) {
            const day = descMatch[1].padStart(2, "0");
            const month = descMatch[2].padStart(2, "0");
            const year = inferYearFromMonth(parseInt(month));
            dateInfo = `${day}.${month}.${year}`;
          }
        }

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

    // 🔄 Wczytaj istniejące dane, jeśli plik istnieje
    const filePath = path.join(process.cwd(), "public", "steam-events.json");
    let existingData: SteamEvent[] = [];
    try {
      if (existsSync(filePath)) {
        const raw = await readFile(filePath, "utf-8");
        existingData = JSON.parse(raw);
      }
    } catch (e) {
      console.warn("⚠️ Nie udało się wczytać istniejącego JSONa:", e);
    }

    // 🔁 Zachowaj customTitle jeśli istnieje
    const merged = events.map((newEv) => {
      const match = existingData.find(
        (oldEv) =>
          oldEv.link === newEv.link ||
          (oldEv.title === newEv.title && oldEv.date === newEv.date)
      );
      return {
        ...newEv,
        customTitle: match?.customTitle ?? "",
      };
    });

    await writeFile(filePath, JSON.stringify(merged, null, 2), "utf-8");

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
