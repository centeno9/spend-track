import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieManager = await cookies();
  const token = cookieManager.get("authToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 204 || res.status === 200) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json().catch(() => ({ error: "Failed to delete" }));
  return NextResponse.json(data, { status: res.status });
}
