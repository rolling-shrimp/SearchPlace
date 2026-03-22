"use client";
import { Place, WalkRecord } from "@/types";

const PLACES_KEY = "walkpick_places";
const RECORDS_KEY = "walkpick_records";

const DEMO_PLACES: Place[] = [
  {
    id: "1",
    name: "大安森林公園",
    address: "台北市大安區新生南路二段",
    lat: 25.0296,
    lng: 121.5359,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=25.0296,121.5359",
    category: "公園",
    isOutdoor: true,
    visitedToday: false,
    rating: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "永康街商圈",
    address: "台北市大安區永康街",
    lat: 25.0329,
    lng: 121.5296,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=25.0329,121.5296",
    category: "商圈",
    isOutdoor: false,
    visitedToday: false,
    rating: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "關渡自然公園",
    address: "台北市北投區關渡路55號",
    lat: 25.1278,
    lng: 121.4592,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=25.1278,121.4592",
    category: "公園",
    isOutdoor: true,
    visitedToday: false,
    rating: 4,
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "中山咖啡街",
    address: "台北市中山區中山北路二段",
    lat: 25.0524,
    lng: 121.5236,
    mapUrl: "https://www.google.com/maps/search/?api=1&query=25.0524,121.5236",
    category: "咖啡廳",
    isOutdoor: false,
    visitedToday: false,
    rating: 3,
    createdAt: new Date().toISOString(),
  },
];

export function getPlaces(): Place[] {
  if (typeof window === "undefined") return DEMO_PLACES;
  const raw = localStorage.getItem(PLACES_KEY);
  if (!raw) {
    localStorage.setItem(PLACES_KEY, JSON.stringify(DEMO_PLACES));
    return DEMO_PLACES;
  }
  return JSON.parse(raw);
}

export function savePlaces(places: Place[]) {
  localStorage.setItem(PLACES_KEY, JSON.stringify(places));
}

export function addPlace(place: Omit<Place, "id" | "createdAt" | "mapUrl"> & { mapUrl?: string }): Place {
  const places = getPlaces();
  const lat = place.lat;
  const lng = place.lng;
  const newPlace: Place = {
    ...place,
    mapUrl: place.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  savePlaces([...places, newPlace]);
  return newPlace;
}

export function updatePlace(id: string, updates: Partial<Place>) {
  const places = getPlaces();
  savePlaces(places.map((p) => (p.id === id ? { ...p, ...updates } : p)));
}

export function deletePlace(id: string) {
  savePlaces(getPlaces().filter((p) => p.id !== id));
}

export function getRecords(): WalkRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(RECORDS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function addRecord(record: Omit<WalkRecord, "id">): WalkRecord {
  const records = getRecords();
  const newRecord = { ...record, id: Date.now().toString() };
  localStorage.setItem(RECORDS_KEY, JSON.stringify([newRecord, ...records]));
  return newRecord;
}

/** 加權隨機抽籤：rating 越高被抽到機率越大 */
export function pickRandom(places: Place[]): Place | null {
  const available = places.filter((p) => !p.visitedToday);
  if (available.length === 0) return null;
  const totalWeight = available.reduce((sum, p) => sum + p.rating, 0);
  let rand = Math.random() * totalWeight;
  for (const p of available) {
    rand -= p.rating;
    if (rand <= 0) return p;
  }
  return available[available.length - 1];
}
