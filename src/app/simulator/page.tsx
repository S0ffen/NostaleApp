"use client";

import { useState } from "react";

type UpgradeResult = "success" | "fail" | "destroy";

function simulateUpgrade(
  level: number,
  eventBonus: number,
  allowDestroy: boolean
): UpgradeResult {
  const baseSuccess = Math.max(5, 75 - level * 5);
  const success = baseSuccess + eventBonus;
  const destroy = allowDestroy ? 100 - success - 10 : 0;
  const fail = 100 - success - destroy;

  const roll = Math.random() * 100;
  if (roll <= success) return "success";
  if (roll <= success + fail) return "fail";
  return "destroy";
}

export default function SimulatorPage() {
  const [level, setLevel] = useState(0);
  const [eventBonus, setEventBonus] = useState(0);
  const [allowDestroy, setAllowDestroy] = useState(false);
  const [tries, setTries] = useState(1);
  const [stats, setStats] = useState<
    Record<number, { success: number; fail: number; destroy: number }>
  >({});

  const handleSimulate = () => {
    let current = level;
    const updatedStats = { ...stats };

    for (let i = 0; i < tries; i++) {
      const result = simulateUpgrade(current, eventBonus, allowDestroy);

      if (!updatedStats[current]) {
        updatedStats[current] = { success: 0, fail: 0, destroy: 0 };
      }

      if (result === "success") {
        updatedStats[current].success++;
        current++;
      } else if (result === "fail") {
        updatedStats[current].fail++;
      } else {
        updatedStats[current].destroy++;
        current = allowDestroy ? 0 : current;
      }
    }

    setLevel(current);
    setStats(updatedStats);
  };

  const levels = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 text-white space-y-6">
      <h1 className="text-3xl font-bold">🔧 Symulator Ulepszeń SP</h1>

      <div className="grid md:grid-cols-2 gap-6 bg-gray-800 p-4 rounded border border-gray-700">
        <div className="space-y-4">
          <label className="block">
            Aktualny poziom:{" "}
            <input
              type="number"
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value))}
              className="bg-gray-700 rounded p-1 w-16 ml-2"
              min={0}
              max={11}
            />
          </label>

          <label className="block">
            Bonus z eventu (%):{" "}
            <input
              type="number"
              value={eventBonus}
              onChange={(e) => setEventBonus(parseInt(e.target.value))}
              className="bg-gray-700 rounded p-1 w-16 ml-2"
              min={0}
              max={50}
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowDestroy}
              onChange={(e) => setAllowDestroy(e.target.checked)}
            />
            Umożliw zniszczenie
          </label>

          <label className="block">
            Liczba prób:{" "}
            <input
              type="number"
              value={tries}
              onChange={(e) => setTries(parseInt(e.target.value))}
              className="bg-gray-700 rounded p-1 w-16 ml-2"
              min={1}
              max={100}
            />
          </label>

          <button
            onClick={handleSimulate}
            className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded mt-2"
          >
            🎲 Rozpocznij
          </button>
        </div>

        <div className="bg-gray-700 rounded p-4 overflow-auto">
          <h2 className="text-xl font-semibold mb-2">📈 Statystyki</h2>
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="text-gray-300 border-b border-gray-500">
                <th className="p-1">+Poziom</th>
                <th className="p-1">✅ Sukces</th>
                <th className="p-1">❌ Porażka</th>
                <th className="p-1">💥 Zniszczenie</th>
              </tr>
            </thead>
            <tbody>
              {levels.map((lvl) => (
                <tr key={lvl} className="text-center border-t border-gray-600">
                  <td className="p-1">+{lvl}</td>
                  <td className="p-1">{stats[lvl]?.success ?? 0}</td>
                  <td className="p-1">{stats[lvl]?.fail ?? 0}</td>
                  <td className="p-1">{stats[lvl]?.destroy ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
