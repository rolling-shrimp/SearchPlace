"use client";
import { Place } from "@/types";

interface Props {
  place: Place;
  onConfirm: () => void;
  onReroll: () => void;
  onClose: () => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  公園: "🌳", 商圈: "🛍️", 咖啡廳: "☕", 河濱: "🌊", 山區: "⛰️", 其他: "📍",
};

export default function ResultModal({ place, onConfirm, onReroll, onClose }: Props) {
  const mapsUrl = place.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}`;
  const navUrl = place.lat && place.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.name + " " + place.address)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* 地圖預覽 */}
        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
          <div className="text-center">
            <div className="text-6xl mb-2">{CATEGORY_EMOJI[place.category]}</div>
            <div className="text-4xl font-black text-gray-700 drop-shadow">
              {place.name.slice(0, 2)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          <div className="text-center mb-4">
            <p className="text-xs text-gray-500 mb-1">今天的骰子結果是</p>
            <h2 className="text-2xl font-black text-gray-900">{place.name}</h2>
            {place.address && (
              <p className="text-sm text-gray-500 mt-1">{place.address}</p>
            )}
            <div className="flex justify-center gap-2 mt-2">
              <span className="text-yellow-400">
                {"★".repeat(place.rating)}
                <span className="text-gray-300">{"★".repeat(5 - place.rating)}</span>
              </span>
              {place.isOutdoor && <span className="text-sky-400 text-sm">☀️ 戶外</span>}
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              🗺️ 查看地圖
            </a>
            <a
              href={navUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-2.5 text-sm font-medium transition-colors"
            >
              🧭 開始導航
            </a>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onReroll}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl py-2.5 font-semibold transition-colors text-sm"
            >
              🎲 換一個
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white rounded-xl py-2.5 font-semibold transition-colors text-sm"
            >
              ✓ 就決定了！
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
