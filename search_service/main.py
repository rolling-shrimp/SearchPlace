"""
WalkPick 地點搜尋服務
使用 Nominatim (OpenStreetMap) 搜尋地點，免費不需 API key
啟動方式：uv run uvicorn main:app --port 8000 --reload
"""

import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="WalkPick Search Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "WalkPick/0.1 (personal walk picker app)"}


class PlaceResult(BaseModel):
    name: str
    address: str
    lat: float
    lng: float
    map_url: str


@app.get("/search", response_model=list[PlaceResult])
async def search_places(q: str = Query(..., min_length=1, description="地點名稱關鍵字")):
    """
    搜尋地點並回傳地址、座標、Google Maps 連結
    """
    params = {
        "q": q,
        "format": "json",
        "limit": 5,
        "addressdetails": 1,
        "accept-language": "zh-TW,zh",
        # 優先台灣結果，但不強制限制（讓使用者可搜國外地點）
        "countrycodes": "tw",
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(NOMINATIM_URL, params=params, headers=HEADERS)
            resp.raise_for_status()
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="搜尋逾時，請再試一次")
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"搜尋服務錯誤：{str(e)}")

    results = resp.json()
    if not results:
        return []

    places = []
    for item in results:
        lat = float(item["lat"])
        lng = float(item["lon"])
        display_name: str = item.get("display_name", "")

        # 取地點顯示名稱（第一段逗號前）作為 name
        name_parts = display_name.split(",")
        short_name = name_parts[0].strip() if name_parts else q

        # 地址（去掉第一個部分，保留其餘）
        address = ", ".join(p.strip() for p in name_parts[1:4]) if len(name_parts) > 1 else display_name

        # Google Maps 連結
        map_url = f"https://www.google.com/maps/search/?api=1&query={lat},{lng}"

        places.append(PlaceResult(
            name=short_name,
            address=address,
            lat=lat,
            lng=lng,
            map_url=map_url,
        ))

    return places


@app.get("/health")
def health():
    return {"status": "ok"}
