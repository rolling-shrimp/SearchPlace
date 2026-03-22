"use client";
import { useState, useRef } from "react";
import { Category, Place, SearchResult } from "@/types";

const CATEGORIES: Category[] = ["公園", "商圈", "咖啡廳", "河濱", "山區", "其他"];

interface Props {
  onSave: (data: Omit<Place, "id" | "createdAt">) => void;
  onCancel: () => void;
  initial?: Partial<Place>;
}

export default function PlaceForm({ onSave, onCancel, initial }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [mapUrl, setMapUrl] = useState(initial?.mapUrl ?? "");
  const [lat, setLat] = useState(initial?.lat ?? 0);
  const [lng, setLng] = useState(initial?.lng ?? 0);
  const [category, setCategory] = useState<Category>(initial?.category ?? "公園");
  const [isOutdoor, setIsOutdoor] = useState(initial?.isOutdoor ?? true);
  const [rating, setRating] = useState(initial?.rating ?? 3);

  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function doSearch(query: string) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) {
        setSearchError(data.error ?? "搜尋失敗");
        setSearchResults([]);
      } else {
        setSearchResults(data);
        if (data.length === 0) setSearchError("找不到相關地點");
      }
    } catch {
      setSearchError("無法連線，請確認 Python 搜尋服務已啟動（port 8000）");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleSearchInput(value: string) {
    setSearchQuery(value);
    setSearchResults([]);
    setSearchError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(value), 600);
    }
  }

  function handleSelectResult(result: SearchResult) {
    setName(result.name);
    setAddress(result.address);
    setMapUrl(result.map_url);
    setLat(result.lat);
    setLng(result.lng);
    setSearchQuery("");
    setSearchResults([]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      address: address.trim(),
      lat: lat || 25.05 + Math.random() * 0.1,
      lng: lng || 121.5 + Math.random() * 0.1,
      mapUrl: mapUrl.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`,
      category,
      isOutdoor,
      visitedToday: false,
      rating,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold text-stone-800">
          {initial ? "編輯地點" : "新增地點"}
        </h2>

        {/* 自動搜尋區 */}
        <div className="relative">
          <label className="block text-sm font-medium text-stone-600 mb-1">
            搜尋地點
            <span className="ml-1 text-xs text-stone-400">（輸入後自動搜尋）</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              placeholder="輸入地點名稱自動搜尋地址..."
              className="flex-1 border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
            <button
              type="button"
              onClick={() => doSearch(searchQuery)}
              disabled={searching || searchQuery.trim().length < 1}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-stone-200 text-white rounded-lg text-sm transition-colors"
            >
              {searching ? "⏳" : "🔍"}
            </button>
          </div>

          {/* 搜尋結果下拉 */}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-stone-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-stone-100 last:border-0"
                >
                  <p className="text-sm font-medium text-stone-800">{r.name}</p>
                  <p className="text-xs text-stone-500 truncate">{r.address}</p>
                </button>
              ))}
            </div>
          )}

          {searchError && (
            <p className="text-xs text-red-400 mt-1">{searchError}</p>
          )}
        </div>

        <div className="border-t border-stone-100 pt-3 space-y-3">
          <p className="text-xs text-stone-400">或手動填寫：</p>

          {/* 地點名稱 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              地點名稱 *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：大安森林公園"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              required
            />
          </div>

          {/* 地址 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              地址
              {address && <span className="ml-1 text-xs text-green-500">✓ 已自動填入</span>}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例：台北市大安區新生南路二段"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* 地圖連結 */}
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">
              地圖連結
              {mapUrl && <span className="ml-1 text-xs text-green-500">✓ 已自動填入</span>}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              />
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-sm transition-colors"
                  title="預覽地圖"
                >
                  🗺️
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">分類</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">喜愛程度</label>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-xl transition-transform hover:scale-110 ${
                    n <= rating ? "text-yellow-400" : "text-stone-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="outdoor"
            checked={isOutdoor}
            onChange={(e) => setIsOutdoor(e.target.checked)}
            className="w-4 h-4 accent-green-500"
          />
          <label htmlFor="outdoor" className="text-sm text-stone-600">
            戶外地點（雨天天氣篩選會排除）
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-xl py-2.5 font-semibold transition-colors"
          >
            儲存
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl py-2.5 font-semibold transition-colors"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
