import { NextRequest, NextResponse } from "next/server";

const PYTHON_SERVICE = "http://localhost:8000";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "缺少搜尋關鍵字" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${PYTHON_SERVICE}/search?q=${encodeURIComponent(q)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.detail ?? "搜尋服務錯誤" },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "無法連線搜尋服務，請確認 Python 服務已啟動" },
      { status: 503 }
    );
  }
}
