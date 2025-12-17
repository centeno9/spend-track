import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);

  const res = NextResponse.redirect(loginUrl);
  res.cookies.set({
    name: "authToken",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  return res;
}
