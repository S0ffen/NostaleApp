"use client";

import { use, useState } from "react";

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
    Souls: number;
    Scrolls?: number;
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
    gold: 400000,
    feathers: 6,
    Fullmoons: 1,
    Souls: 0,
    Scrolls: 1,
  },
  3: {
    success: 70,
    destroy: 5,
    fail: 25,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
    Scrolls: 1,
  },
  4: {
    success: 60,
    destroy: 10,
    fail: 30,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
    Scrolls: 1,
  },
  5: {
    success: 50,
    destroy: 15,
    fail: 35,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
    Scrolls: 1,
  },
  6: {
    success: 40,
    destroy: 20,
    fail: 40,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  7: {
    success: 35,
    destroy: 25,
    fail: 40,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  8: {
    success: 30,
    destroy: 30,
    fail: 40,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  9: {
    success: 25,
    destroy: 35,
    fail: 40,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  10: {
    success: 20,
    destroy: 40,
    fail: 40,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  11: {
    success: 10,
    destroy: 45,
    fail: 45,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  12: {
    success: 7,
    destroy: 50,
    fail: 43,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  13: {
    success: 5,
    destroy: 55,
    fail: 40,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  14: {
    success: 3,
    destroy: 60,
    fail: 37,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  15: {
    success: 1.5,
    destroy: 70,
    fail: 28.5,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  16: {
    success: 1.2,
    destroy: 70,
    fail: 28.8,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  17: {
    success: 1,
    destroy: 70,
    fail: 29,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  18: {
    success: 0.8,
    destroy: 75,
    fail: 24.2,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  19: {
    success: 0.6,
    destroy: 80,
    fail: 19.4,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
  20: {
    success: 0.4,
    destroy: 80,
    fail: 19.6,
    gold: 200000,
    feathers: 3,
    Fullmoons: 1,
    Souls: 0,
  },
};
function simulateUpgrade(
  level: number,
  eventBonus: number,
  allowDestroy: boolean
): UpgradeResult {
  const chances = upgradeChances[level + 1];
  if (!chances) return "fail"; // brak danych dla kolejnego poziomu

  let success = chances.success + eventBonus;
  let destroy = chances.destroy;
  let fail = 100 - success - destroy;

  if (success > 100) success = 100;
  if (fail < 0) fail = 0;

  const roll = Number((Math.random() * 100).toFixed(1));

  console.log("Rzut: ", roll);
  console.log("Sukces: ", success);
  console.log("Zniszczenie: ", destroy);
  console.log("Porażka: ", fail);
  if (roll < success) return "success";
  if (roll < success + fail) return "fail";
  return "destroy";
}
function getCurrentChances(
  level: number,
  eventBonus: number,
  allowDestroy: boolean
): { success: number; fail: number; destroy: number } {
  const chances = upgradeChances[level + 1];
  if (!chances) return { success: 0, fail: 0, destroy: 0 };

  let success = chances.success + eventBonus;
  if (success > 100) success = 100;

  const destroy = chances.destroy;
  const fail = Math.max(0, 100 - success - destroy);

  return { success, fail, destroy };
}

export default function SimulatorPage() {
  const [level, setLevel] = useState(0);
  const [eventBonus, setEventBonus] = useState(0);
  const [allowDestroy, setAllowDestroy] = useState(false);
  const [tries, setTries] = useState(1);
  const [stats, setStats] = useState<
    Record<number, { success: number; fail: number; destroy: number }>
  >({});
  const [totalTries, setTotalTries] = useState(0);
  const requirements = upgradeChances[level + 1];
  const [cost, setCost] = useState(0);
  const [materialsUsed, setMaterialsUsed] = useState({
    feathers: 0,
    Fullmoons: 0,
    Souls: 0,
    Scrolls: 0,
  });
  const [prices, setPrices] = useState({
    Feathers: 0,
    Fullmoons: 0,
    Souls: 0,
    Scrolls: 0,
  });

  let totalFails = 0;

  const handleSimulate = () => {
    let current = level;
    let used = {
      feathers: 0,
      Fullmoons: 0,
      Souls: 0,
      Scrolls: 0,
    };

    const updatedStats = { ...stats };

    for (let i = 0; i < tries; i++) {
      const result = simulateUpgrade(current, eventBonus, allowDestroy);

      used.feathers += requirements.feathers;
      used.Fullmoons += requirements.Fullmoons;
      used.Souls += requirements.Souls;
      used.Scrolls += requirements.Scrolls || 0; // jeśli Scrolls nie zawsze istnieje

      if (!updatedStats[current + 1]) {
        updatedStats[current + 1] = { success: 0, fail: 0, destroy: 0 };
      }

      if (result === "success") {
        updatedStats[current + 1].success++;
        current++;
      } else if (result === "fail") {
        updatedStats[current + 1].fail++;
      } else {
        updatedStats[current + 1].destroy++;
        current = allowDestroy ? 0 : current;
      }

      totalFails = Object.values(updatedStats).reduce(
        (sum, current) =>
          sum + current.fail + current.destroy + current.success,
        0
      );
      console.log("requirements: ", requirements);
      console.log("Koszt: ", cost);
      console.log("Wszystkie próby: ", totalFails);
      if (current >= 20) {
        alert("Maksymalny poziom osiągnięty!");
        break; // maksymalny poziom to +20
      }
    }
    setLevel(current);
    setStats(updatedStats);
    setMaterialsUsed((prev) => ({
      feathers: prev.feathers + used.feathers,
      Fullmoons: prev.Fullmoons + used.Fullmoons,
      Souls: prev.Souls + used.Souls,
      Scrolls: prev.Scrolls + used.Scrolls,
    }));
    const materialCost =
      used.feathers * prices.Feathers +
      used.Fullmoons * prices.Fullmoons +
      used.Souls * prices.Souls +
      used.Scrolls * prices.Scrolls;

    setCost((prev) => prev + requirements.gold + materialCost);
  };

  const handleReset = () => {
    setLevel(0);
    setEventBonus(0);
    setAllowDestroy(false);
    setTries(1);
    setStats({});
    setCost(0);
    setMaterialsUsed({
      feathers: 0,
      Fullmoons: 0,
      Souls: 0,
      Scrolls: 0,
    });
    setPrices({
      Feathers: 0,
      Fullmoons: 0,
      Souls: 0,
      Scrolls: 0,
    });
  };
  const { success, fail, destroy } = getCurrentChances(
    level,
    eventBonus,
    allowDestroy
  );

  return (
    <div className="flex flex-row items-center justify-center min-h-screen bg-gray-900 text-white p-4">
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
              <div className="flex justify-around items-center bg-gray-800 p-2 rounded">
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
                  <img
                    src="/NostaleIcons/green-soul.png"
                    alt="Ikona Duszy"
                    className="w-10 h-10 rounded"
                  />
                  <p className="text-sm mt-1">
                    Souls
                    <br />
                    <span className="text-yellow-300">
                      {requirements.Souls} szt.
                    </span>
                  </p>
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
          <input
            type="number"
            min={1}
            max={1000}
            value={tries}
            onChange={(e) => setTries(Number(e.target.value))}
          ></input>
        </div>
      </div>
      {/* Statystyki */}
      <div>
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
        </div>
        <div>
          <span></span>
        </div>
      </div>
      <div>
        <span>{totalTries}</span>
        <span className="text-blue-400">
          Koszt {cost.toLocaleString("en-EN")}
        </span>
      </div>
      <div className="flex flex-col gap-2 text-white text-sm">
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
        <span>{prices.Feathers}</span>
        <span>{prices.Fullmoons}</span>
        <span>{prices.Souls}</span>
        <span>{prices.Scrolls}</span>
        <span>{materialsUsed.Fullmoons}</span>
        <span>{materialsUsed.Scrolls}</span>
        <span>{materialsUsed.Souls}</span>
        <span>{materialsUsed.feathers}</span>
      </div>
    </div>
  );
}
