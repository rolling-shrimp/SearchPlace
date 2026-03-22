export type Category = "公園" | "商圈" | "咖啡廳" | "河濱" | "山區" | "其他";

export interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  mapUrl: string;
  category: Category;
  isOutdoor: boolean;
  visitedToday: boolean;
  rating: number; // 1-5，影響抽籤權重
  createdAt: string;
}

export interface SearchResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  map_url: string;
}

export interface WalkRecord {
  id: string;
  placeId: string;
  placeName: string;
  walkedAt: string;
  moodScore: number; // 1-5
  rating: number;
  notes: string;
}
