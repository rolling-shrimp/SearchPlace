"use client";
import { useState } from "react";
import { Place, Category } from "@/types";
import { pickRandom } from "@/lib/store";

const CATEGORIES: Category[] = ["公園", "商圈", "咖啡廳", "河濱", "山區", "其他"];

interface Props {
  places: Place[];
  onPicked: (place: Place) => void;
}

export default function DiceButton({ places, onPicked }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCats, setSelectedCats] = useState<Category[]>([]);
  const [outdoorOnly, setOutdoorOnly] = useState(false);

  function toggleCat(cat: Category) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function roll() {
    let pool = places;
    if (selectedCats.length > 0) {
      pool = pool.filter((p) => selectedCats.includes(p.category));
    }
    if (outdoorOnly) {
      pool = pool.filter((p) => p.isOutdoor);
    }

    if (pool.length === 0) {
      alert("沒有符合條件的地點，請調整篩選或新增地點！");
      return;
    }

    setSpinning(true);
    setShowFilter(false);
    setTimeout(() => {
      setSpinning(false);
      const picked = pickRandom(pool);
      if (picked) onPicked(picked);
    }, 700);
  }

  return (
    <div className="relative">
      {/* 篩選面板 */}
      {showFilter && (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 w-72 z-10">
          <p className="text-sm font-semibold text-gray-700 mb-2">分類篩選</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCat(cat)}
                className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                  selectedCats.includes(cat)
                    ? "bg-gray-800 text-white border-gray-800"
                    : "border-gray-200 text-gray-600 hover:border-gray-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <input
              type="checkbox"
              checked={outdoorOnly}
              onChange={(e) => setOutdoorOnly(e.target.checked)}
              className="accent-gray-800"
            />
            只抽戶外地點
          </label>
          <button
            onClick={roll}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white rounded-xl py-2 font-semibold transition-colors"
          >
            開始抽籤！
          </button>
        </div>
      )}

      <div className="flex gap-3 items-center">
        <button
          onClick={() => setShowFilter((v) => !v)}
          className="text-gray-400 hover:text-gray-700 transition-colors text-sm"
          title="篩選條件"
        >
          ⚙️ 篩選
        </button>
        <button
          onClick={roll}
          disabled={spinning}
          className={`flex items-center gap-2 bg-white hover:bg-gray-50 active:scale-95 text-gray-700 rounded-2xl px-6 py-3 text-lg font-bold shadow-lg shadow-gray-200 transition-all ${
            spinning ? "opacity-70" : ""
          }`}
        >
          <span className={spinning ? "dice-animate inline-block" : ""}>🎲</span>
          {spinning ? "抽籤中..." : "今天去哪？"}
        </button>
      </div>
    </div>
  );
}
