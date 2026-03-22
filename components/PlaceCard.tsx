"use client";
import { Place } from "@/types";

const CATEGORY_COLORS: Record<string, string> = {
  公園: "bg-green-100 text-green-700",
  商圈: "bg-orange-100 text-orange-700",
  咖啡廳: "bg-amber-100 text-amber-700",
  河濱: "bg-blue-100 text-blue-700",
  山區: "bg-emerald-100 text-emerald-700",
  其他: "bg-stone-100 text-stone-600",
};

const CATEGORY_EMOJI: Record<string, string> = {
  公園: "🌳",
  商圈: "🛍️",
  咖啡廳: "☕",
  河濱: "🌊",
  山區: "⛰️",
  其他: "📍",
};

interface Props {
  place: Place;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisited: () => void;
}

export default function PlaceCard({ place, onEdit, onDelete, onToggleVisited }: Props) {
  const mapsUrl = place.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + " " + place.address)}`;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md ${
        place.visitedToday ? "opacity-60 border-gray-300" : "border-transparent"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">{CATEGORY_EMOJI[place.category]}</span>
              <h3 className="font-semibold text-gray-900 truncate">{place.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  CATEGORY_COLORS[place.category]
                }`}
              >
                {place.category}
              </span>
              {place.visitedToday && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                  今日已去
                </span>
              )}
            </div>
            {place.address && (
              <p className="text-sm text-stone-500 mt-1 truncate">{place.address}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-yellow-400 text-sm">
                {"★".repeat(place.rating)}
                <span className="text-gray-300">{"★".repeat(5 - place.rating)}</span>
              </span>
              {place.isOutdoor && (
                <span className="text-xs text-sky-500">☀️ 戶外</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg py-1.5 transition-colors"
          >
            🗺️ 地圖
          </a>
          <button
            onClick={onToggleVisited}
            className={`flex-1 text-sm rounded-lg py-1.5 transition-colors ${
              place.visitedToday
                ? "bg-gray-100 hover:bg-gray-200 text-gray-500"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            }`}
          >
            {place.visitedToday ? "✓ 已去" : "✓ 今日去過"}
          </button>
          <button
            onClick={onEdit}
            className="px-3 text-sm bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-lg py-1.5 transition-colors"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="px-3 text-sm bg-red-50 hover:bg-red-100 text-red-400 rounded-lg py-1.5 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}
