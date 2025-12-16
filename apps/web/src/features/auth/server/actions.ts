"use server";

import { login } from "@/features/auth";
import { ApiError } from "@/shared/lib/api-client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginActionState = {
  error?: string;
  searchParams: string;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return { ..._prevState, error: "Email and password are required." };
  }

  try {
    const { accessToken } = await login(email, password);

    console.log("accessToken", accessToken);

    const cookieManager = await cookies();

    cookieManager.set("authToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        return { ..._prevState, error: "Invalid email or password." };
      }
      return {
        ..._prevState,
        error: error.message || "Unable to log in right now.",
      };
    }

    console.error("Unexpected login error", error);
    return { ..._prevState, error: "Unable to log in. Please try again." };
  }

  const searchParams = new URLSearchParams(_prevState.searchParams);

  const returnTo = searchParams.get("returnTo");

  redirect(returnTo ?? "/dashboard");
}

export async function logoutAction() {
  redirect("/api/auth/logout");
}
