"use client";

import { useMemo, useState } from "react";
import Toast, { toast } from "react-hot-toast";

type UpgradeResult = "success" | "fail" | "destroy";
const upgradeChances: Record<
  number,
  {
    success: number;
    destroy: number;
    fail: number;
    gold: number;
    feathers: number;
    Fullmoons: number;
    Souls?: number;
    Scrolls?: number;
    Dragon_Gem?: number; // Dodane dla poziomów 16-20
  }
> = {
  1: {
    success: 80,
    destroy: 0,
    fail: 20,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
    Scrolls: 1,
  },
  2: {
    success: 75,
    destroy: 0,
    fail: 25,
    gold: 200000,
    feathers: 5,
    Fullmoons: 3,
    Souls: 4,
    Scrolls: 1,
  },
  3: {
    success: 70,
    destroy: 5,
    fail: 25,
    gold: 200000,
    feathers: 8,
    Fullmoons: 5,
    Souls: 6,
    Scrolls: 1,
  },
  4: {
    success: 60,
    destroy: 10,
    fail: 30,
    gold: 200000,
    feathers: 10,
    Fullmoons: 7,
    Souls: 8,
    Scrolls: 1,
  },
  5: {
    success: 50,
    destroy: 15,
    fail: 35,
    gold: 200000,
    feathers: 15,
    Fullmoons: 10,
    Souls: 10,
    Scrolls: 1,
  },
  6: {
    success: 40,
    destroy: 20,
    fail: 40,
    gold: 500000,
    feathers: 20,
    Fullmoons: 12,
    Souls: 1,
    Scrolls: 1,
  },
  7: {
    success: 35,
    destroy: 25,
    fail: 40,
    gold: 500000,
    feathers: 25,
    Fullmoons: 14,
    Souls: 2,
    Scrolls: 1,
  },
  8: {
    success: 30,
    destroy: 30,
    fail: 40,
    gold: 500000,
    feathers: 30,
    Fullmoons: 16,
    Souls: 3,
    Scrolls: 1,
  },
  9: {
    success: 25,
    destroy: 35,
    fail: 40,
    gold: 500000,
    feathers: 35,
    Fullmoons: 18,
    Souls: 4,
    Scrolls: 1,
  },
  10: {
    success: 20,
    destroy: 40,
    fail: 40,
    gold: 500000,
    feathers: 40,
    Fullmoons: 20,
    Souls: 5,
    Scrolls: 1,
  },
  11: {
    success: 10,
    destroy: 45,
    fail: 45,
    gold: 1000000,
    feathers: 45,
    Fullmoons: 22,
    Souls: 1,
    Scrolls: 1,
  },
  12: {
    success: 7,
    destroy: 50,
    fail: 43,
    gold: 1000000,
    feathers: 50,
    Fullmoons: 24,
    Souls: 2,
    Scrolls: 1,
  },
  13: {
    success: 5,
    destroy: 55,
    fail: 40,
    gold: 1000000,
    feathers: 55,
    Fullmoons: 26,
    Souls: 3,
    Scrolls: 1,
  },
  14: {
    success: 3,
    destroy: 60,
    fail: 37,
    gold: 1000000,
    feathers: 60,
    Fullmoons: 28,
    Souls: 4,
    Scrolls: 1,
  },
  15: {
    success: 1.5,
    destroy: 70,
    fail: 28.5,
    gold: 1000000,
    feathers: 70,
    Fullmoons: 30,
    Souls: 5,
    Scrolls: 1,
  },
  16: {
    success: 1.2,
    destroy: 70,
    fail: 28.8,
    gold: 1250000,
    feathers: 80,
    Fullmoons: 32,
    Dragon_Gem: 2,
    Scrolls: 1,
  },
  17: {
    success: 1,
    destroy: 70,
    fail: 29,
    gold: 1500000,
    feathers: 90,
    Fullmoons: 34,
    Dragon_Gem: 4,
    Scrolls: 1,
  },
  18: {
    success: 0.8,
    destroy: 75,
    fail: 24.2,
    gold: 1750000,
    feathers: 100,
    Fullmoons: 36,
    Dragon_Gem: 6,
    Scrolls: 1,
  },
  19: {
    success: 0.6,
    destroy: 80,
    fail: 19.4,
    gold: 2000000,
    feathers: 110,
    Fullmoons: 38,
    Dragon_Gem: 8,
    Scrolls: 1,
  },
  20: {
    success: 0.4,
    destroy: 80,
    fail: 19.6,
    gold: 2250000,
    feathers: 120,
    Fullmoons: 40,
    Dragon_Gem: 10,
    Scrolls: 1,
  },
};
function simulateUpgrade(level: number, eventBonus: number): UpgradeResult {
  const chances = upgradeChances[level + 1];
  if (!chances) return "fail"; // brak danych dla kolejnego poziomu
  console.log("SZANSA Z FUNKCJI", eventBonus);
  let success = chances.success * eventBonus;
  const destroy = chances.destroy;
  let fail = 100 - success - destroy;

  if (success > 100) success = 100;
  if (fail < 0) fail = 0;

  const roll = Number((Math.random() * 100).toFixed(1));
  console.log(
    `Roll: ${roll}, Success: ${success}, Fail: ${fail}, Destroy: ${destroy}`
  );

  if (roll < success) return "success";
  if (roll < success + fail) return "fail";
  return "destroy";
}
function getCurrentChances(level: number): {
  success: number;
  fail: number;
  destroy: number;
} {
  const chances = upgradeChances[level + 1];
  if (!chances) return { success: 0, fail: 0, destroy: 0 };

  let success = chances.success;
  if (success > 100) success = 100;

  const destroy = chances.destroy;
  const fail = Math.max(0, 100 - success - destroy);

  return { success, fail, destroy };
}

export default function SimulatorPage() {
  const [level, setLevel] = useState(0);
  const [eventBonus, setEventBonus] = useState(1); // domyślnie bez bonusu
  const [tries, setTries] = useState(1);
  const [stats, setStats] = useState<
    Record<number, { success: number; fail: number; destroy: number }>
  >({});
  const requirements = upgradeChances[level + 1];
  const [cost, setCost] = useState(0);
  const [materialsUsed, setMaterialsUsed] = useState({
    feathers: 0,
    Fullmoons: 0,
    Souls: 0,
    Scrolls: 0,
    Dragon_Gem: 0,
  });
  const [prices, setPrices] = useState({
    Feathers: 0,
    Fullmoons: 0,
    Souls: 0,
    Scrolls: 0,
    Dragon_Gem: 0,
  });
  const resourceTypes = [
    {
      key: "Souls",
      label: "Souls",
      icon: "/NostaleIcons/green-soul.png",
    },
    {
      key: "Dragon_Gem",
      label: "Dragon Gem",
      icon: "/NostaleIcons/dragon-gem.png",
    },
    // dodaj kolejne, jeśli chcesz
  ];

  const totalAttempts = useMemo(() => {
    return Object.values(stats).reduce((sum, entry) => {
      return sum + entry.success + entry.fail + entry.destroy;
    }, 0);
  }, [stats]); // <-- tylko jeśli `stats` się zmienia, wtedy przelicza

  const handleSimulate = () => {
    const used = {
      feathers: 0,
      Fullmoons: 0,
      Souls: 0,
      Scrolls: 0,
      Dragon_Gem: 0,
    };
    let totalGold = 0;

    const updatedStats = { ...stats };
    let currentLevel = level;
    for (let i = 0; i < tries; i++) {
      const result = simulateUpgrade(currentLevel, eventBonus);
      console.log("result", result);
      const currentReq = upgradeChances[currentLevel + 1];
      if (currentLevel >= 20) {
        toast.error("Osiągnięto maksymalny poziom ulepszenia (20).");
      }
      if (!currentReq) break; // wyjście z pętli jeśli brak danych
      console.log("currentReq", currentReq);

      // Jeśli jeszcze nie było żadnej próby dla tego poziomu — inicjalizuj
      if (!updatedStats[currentLevel]) {
        updatedStats[currentLevel] = { success: 0, fail: 0, destroy: 0 };
      }
      // Dodaj wynik
      updatedStats[currentLevel][result] += 1;
      //jeżeli sukces to zwiększ poziom
      if (result === "success") {
        currentLevel++;
      }

      totalGold +=
        currentReq.gold +
        prices.Feathers * currentReq.feathers +
        prices.Fullmoons * currentReq.Fullmoons +
        prices.Souls * (currentReq.Souls || 0) +
        prices.Scrolls * (currentReq.Scrolls || 0) +
        prices.Dragon_Gem * (currentReq.Dragon_Gem || 0);
      console.log("Gold", currentReq.gold);
      console.log("Koszt Feathers", prices.Feathers * currentReq.feathers);
      console.log("Koszt Fullmoons", prices.Fullmoons * currentReq.Fullmoons);
      console.log("Koszt Souls", prices.Souls * (currentReq.Souls || 0));
      console.log("Koszt Scrolls", prices.Scrolls * (currentReq.Scrolls || 0));
      console.log(
        "Koszt Dragon_Gem",
        prices.Dragon_Gem * (currentReq.Dragon_Gem || 0)
      );
      console.log("totalGold", totalGold);
      used.feathers += currentReq.feathers;
      used.Fullmoons += currentReq.Fullmoons;
      used.Souls += currentReq.Souls || 0;
      used.Scrolls += currentReq.Scrolls || 0;
    }
    //bo jak to damy do for to będzie korzystać tylko z ostatniego levelu czyli jak damy 100 prób
    // to będzie korzystać tylko z tego ostatniego czyli jak wbije za 2 na +2 to i tak będzie korzystać z sznas z na +1
    setLevel(currentLevel); // dopiero na końcu ustaw nowy level
    setStats(updatedStats);
    setCost((prev) => prev + totalGold);
    setMaterialsUsed((prev) => ({
      feathers: prev.feathers + used.feathers,
      Fullmoons: prev.Fullmoons + used.Fullmoons,
      Souls: prev.Souls + used.Souls,
      Scrolls: prev.Scrolls + used.Scrolls,
      Dragon_Gem: prev.Dragon_Gem + used.Dragon_Gem,
    }));
  };

  const handleReset = () => {
    setLevel(0);
    setEventBonus(0);
    setTries(1);
    setStats({});
    setCost(0);
    setMaterialsUsed({
      feathers: 0,
      Fullmoons: 0,
      Souls: 0,
      Scrolls: 0,
      Dragon_Gem: 0,
    });
    setPrices({
      Feathers: 0,
      Fullmoons: 0,
      Souls: 0,
      Scrolls: 0,
      Dragon_Gem: 0,
    });
  };
  const { success, fail, destroy } = getCurrentChances(level);

  return (
    <div className="flex flex-row items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="flex flex-col bg-gray-900 border border-gray-600 rounded-lg p-6 w-full max-w-md space-y-2 mr-4">
        <label>
          Cena pióra (Feather):{" "}
          <input
            type="number"
            value={prices.Feathers}
            onChange={(e) =>
              setPrices((prev) => ({
                ...prev,
                Feathers: Number(e.target.value),
              }))
            }
            className="bg-gray-700 rounded px-2 py-1 text-white w-32"
          />
        </label>
        <label>
          Cena Fullmoon:{" "}
          <input
            type="number"
            value={prices.Fullmoons}
            onChange={(e) =>
              setPrices((prev) => ({
                ...prev,
                Fullmoons: Number(e.target.value),
              }))
            }
            className="bg-gray-700 rounded px-2 py-1 text-white w-32"
          />
        </label>
        <label>
          Cena Soul:{" "}
          <input
            type="number"
            value={prices.Souls}
            onChange={(e) =>
              setPrices((prev) => ({ ...prev, Souls: Number(e.target.value) }))
            }
            className="bg-gray-700 rounded px-2 py-1 text-white w-32"
          />
        </label>
        <label>
          Cena Klejnota smoków:{" "}
          <input
            type="number"
            value={prices.Dragon_Gem}
            onChange={(e) =>
              setPrices((prev) => ({
                ...prev,
                Dragon_Gem: Number(e.target.value),
              }))
            }
            className="bg-gray-700 rounded px-2 py-1 text-white w-32"
          />
        </label>
        <label>
          Cena Zwoju:{" "}
          <input
            type="number"
            value={prices.Scrolls}
            onChange={(e) =>
              setPrices((prev) => ({
                ...prev,
                Scrolls: Number(e.target.value),
              }))
            }
            className="bg-gray-700 rounded px-2 py-1 text-white w-32"
          />
        </label>
        <div className="flex flex-col gap-2 text-white text-sm">
          <span>Użyte fullmon: {materialsUsed.Fullmoons}</span>
          <span>Użyte scrolle: {materialsUsed.Scrolls}</span>
          <span>Użyte dusze: {materialsUsed.Souls}</span>
          <span>Użyte pióra: {materialsUsed.feathers}</span>
          <span>Użyte klejnoty smoka: {materialsUsed.Dragon_Gem}</span>
        </div>
      </div>
      <div className="bg-black border border-gray-600 rounded-lg p-6 w-full max-w-md text-center space-y-4">
        <h2 className="text-xl bg-gray-800 py-2 rounded-t text-white font-semibold">
          Ulepszenie Karty
        </h2>

        <div className="bg-gray-900 border border-gray-700 p-4 space-y-3 rounded">
          <div className="w-full flex justify-between items-center">
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded text-white font-semibold"
            >
              Resetuj
            </button>
            <div>
              <label className="text-white">Poziom:</label>
              <input
                type="text"
                inputMode="numeric" // pokaże mobilną klawiaturę numeryczną
                value={level}
                onChange={(e) => {
                  const raw = e.target.value;

                  // usuń wszystko co nie jest cyfrą
                  const cleaned = raw.replace(/\D/g, "");

                  // usuń wiodące zera
                  const noLeadingZeros = cleaned.replace(/^0+/, "");

                  // domyślnie 0 jeśli puste
                  const final = noLeadingZeros === "" ? "0" : noLeadingZeros;

                  setLevel(Number(final));
                }}
                className="w-12 text-center bg-gray-800 rounded text-white"
              />
            </div>
          </div>

          <button>
            <img src="/SpIcons/wk.png" className="w-12 h-12" alt="Ikona"></img>
          </button>
          <p className="text-yellow-400 font-bold">
            Karta Specjalisty Dzikiego Strażnika {level}
          </p>
          <p className="text-blue-400">
            Sukces: <span className="text-white">{success.toFixed(1)}%</span>
            <br />
            Zniszczenie:{" "}
            <span className="text-white">{destroy.toFixed(1)}%</span>
            <br />
            Porażka: <span className="text-white">{fail.toFixed(1)}%</span>
          </p>
          <div className="flex justify-around items-center bg-gray-800 p-2 rounded">
            {requirements && (
              <div className="flex justify-around items-center bg-gray-800 p-2 rounded w-full">
                <div className="flex flex-col items-center">
                  <img
                    src="/NostaleIcons/gold.png"
                    alt="Ikona Duszy"
                    className="w-10 h-10 rounded"
                  />
                  <p className="text-sm mt-1">
                    Gold
                    <br />
                    <span className="text-yellow-300">
                      {requirements.gold.toLocaleString()}$
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src="/NostaleIcons/feather.png"
                    alt="Ikona Duszy"
                    className="w-10 h-10 rounded"
                  />
                  <p className="text-sm mt-1">
                    Feathers
                    <br />
                    <span className="text-yellow-300">
                      {requirements.feathers} szt.
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src="/NostaleIcons/fullmoon.png"
                    alt="Ikona Duszy"
                    className="w-10 h-10 rounded"
                  />
                  <p className="text-sm mt-1">
                    Fullmoons
                    <br />
                    <span className="text-yellow-300">
                      {requirements.Fullmoons} szt.
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  {resourceTypes.map((res) => {
                    const amount =
                      requirements[res.key as keyof typeof requirements];

                    if (!amount) return null; // pomiń jeśli brak tego materiału

                    return (
                      <div key={res.key} className="flex flex-col items-center">
                        <img
                          src={res.icon}
                          alt={`Ikona ${res.label}`}
                          className="w-10 h-10 rounded"
                        />
                        <p className="text-sm mt-1">
                          {res.label}
                          <br />
                          <span className="text-yellow-300">{amount} szt.</span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSimulate}
            disabled={level >= 20}
            className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded text-white font-semibold"
          >
            Rozpocznij
          </button>
          <br />
          <span>Ilość prób: </span>
          <input
            type="number"
            min={1}
            max={1000}
            value={tries}
            onChange={(e) => setTries(Number(e.target.value))}
          ></input>
        </div>

        <span className="text-blue-400">
          Koszt {cost.toLocaleString("en-EN")}
        </span>
        <div className="bg-gray-800 p-2 rounded mt-4">
          <span className="text-yellow-400 block">Opcje:</span>
          <div>
            <label className="text-white">
              {"Event: "}
              <input
                type="checkbox"
                className="ml-2"
                checked={eventBonus > 1}
                onChange={(e) => setEventBonus(e.target.checked ? 1.5 : 1)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Statystyki */}
      <div className="bg-black border border-gray-600 rounded-lg p-6 w-full max-w-md text-center space-y-4 ml-4">
        <h2 className="text-xl bg-gray-800 py-2 rounded-t text-white font-semibold mt-6">
          Statystyki
        </h2>
        <div className="bg-gray-900 border border-gray-700 p-4 space-y-3 rounded w-full">
          {Object.entries(stats).map(([level, result]) => (
            <div key={level} className="flex justify-between">
              <span className="text-yellow-400 font-bold">+ {level} </span>
              <span className="text-blue-400">
                Sukces: {result.success} | Porażka: {result.fail} | Zniszczenie:{" "}
                {result.destroy}
              </span>
            </div>
          ))}
          <p className="text-blue-400 font-semibold mt-2">
            Całkowita ilość prób: {totalAttempts}
          </p>
        </div>
      </div>
    </div>
  );
}
