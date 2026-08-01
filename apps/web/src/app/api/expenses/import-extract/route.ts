import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const PDF_EXTRACTOR_URL =
  process.env.PDF_EXTRACTOR_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  const cookieManager = await cookies();
  const token = cookieManager.get("authToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Forward the multipart form (file + bank) untouched so fetch sets the
  // multipart boundary itself. The extractor service is unauthenticated, so the
  // token only gates this proxy.
  const formData = await request.formData();

  const res = await fetch(`${PDF_EXTRACTOR_URL}/extract`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
