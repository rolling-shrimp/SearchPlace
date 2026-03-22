"use client";
import { useEffect, useState } from "react";
import { Place } from "@/types";
import {
  getPlaces,
  addPlace,
  updatePlace,
  deletePlace,
} from "@/lib/store";
import PlaceCard from "@/components/PlaceCard";
import PlaceForm from "@/components/PlaceForm";
import DiceButton from "@/components/DiceButton";
import ResultModal from "@/components/ResultModal";

type Tab = "list" | "records";

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [pickedPlace, setPickedPlace] = useState<Place | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("list");

  useEffect(() => {
    setPlaces(getPlaces());
  }, []);

  function refresh() {
    setPlaces(getPlaces());
  }

  function handleSaveNew(data: Omit<Place, "id" | "createdAt">) {
    addPlace(data);
    refresh();
    setShowForm(false);
  }

  function handleSaveEdit(data: Omit<Place, "id" | "createdAt">) {
    if (!editingPlace) return;
    updatePlace(editingPlace.id, data);
    refresh();
    setEditingPlace(null);
  }

  function handleDelete(id: string) {
    if (!confirm("確定要刪除這個地點嗎？")) return;
    deletePlace(id);
    refresh();
  }

  function handleToggleVisited(id: string) {
    const place = places.find((p) => p.id === id);
    if (!place) return;
    updatePlace(id, { visitedToday: !place.visitedToday });
    refresh();
  }

  function handlePicked(place: Place) {
    setPickedPlace(place);
  }

  function handleConfirmPick() {
    if (!pickedPlace) return;
    updatePlace(pickedPlace.id, { visitedToday: true });
    refresh();
    setPickedPlace(null);
  }

  function handleReroll() {
    setPickedPlace(null);
    setTimeout(() => {
      const filtered = places.filter((p) => !p.visitedToday);
      if (filtered.length === 0) {
        alert("所有地點今天都去過了！");
        return;
      }
      const pick = filtered[Math.floor(Math.random() * filtered.length)];
      setPickedPlace(pick);
    }, 100);
  }

  const filtered = places.filter(
    (p) =>
      p.name.includes(search) ||
      p.address.includes(search) ||
      p.category.includes(search)
  );

  const visitedCount = places.filter((p) => p.visitedToday).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚶</span>
            <div>
              <h1 className="text-lg font-black text-gray-900 leading-tight">WalkPick</h1>
              <p className="text-xs text-gray-500 leading-tight">今天去哪散步？</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {visitedCount > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                今日已去 {visitedCount} 處
              </span>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="bg-gray-800 hover:bg-gray-900 text-white rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors"
            >
              + 新增
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* 骰子區 */}
        <div className="bg-gradient-to-br from-gray-700 to-gray-500 rounded-3xl p-6 text-white">
          <p className="text-white/80 text-sm mb-1">選擇困難救星</p>
          <p className="text-xl font-bold mb-4">讓骰子幫你決定！</p>
          <div className="flex justify-center">
            <DiceButton places={places} onPicked={handlePicked} />
          </div>
          <p className="text-white/60 text-xs text-center mt-3">
            共 {places.length} 個地點 · 評分越高被抽到機率越大
          </p>
        </div>

        {/* Tab */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1">
          <button
            onClick={() => setTab("list")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            地點清單 ({places.length})
          </button>
          <button
            onClick={() => setTab("records")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              tab === "records"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500"
            }`}
          >
            散步紀錄
          </button>
        </div>

        {tab === "list" && (
          <>
            {/* 搜尋 */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜尋地點名稱、分類..."
              className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />

            {/* 地點列表 */}
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-3">🗺️</div>
                <p className="font-medium">還沒有地點</p>
                <p className="text-sm mt-1">點擊右上角「+ 新增」加入你喜歡的地方</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onEdit={() => setEditingPlace(place)}
                    onDelete={() => handleDelete(place.id)}
                    onToggleVisited={() => handleToggleVisited(place.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "records" && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">📔</div>
            <p className="font-medium">散步紀錄功能</p>
            <p className="text-sm mt-1">即將推出 — 上線後第一個迭代加入</p>
          </div>
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <PlaceForm
          onSave={handleSaveNew}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPlace && (
        <PlaceForm
          initial={editingPlace}
          onSave={handleSaveEdit}
          onCancel={() => setEditingPlace(null)}
        />
      )}

      {pickedPlace && (
        <ResultModal
          place={pickedPlace}
          onConfirm={handleConfirmPick}
          onReroll={handleReroll}
          onClose={() => setPickedPlace(null)}
        />
      )}
    </div>
  );
}
