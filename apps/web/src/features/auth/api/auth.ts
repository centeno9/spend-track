import { apiClient } from "@/shared/lib/api-client";
import { LoginResponse, SignUpBody, SignUpResponse } from "@/features/auth";

export async function login(email: string, password: string) {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export async function signUp(body: SignUpBody) {
  return apiClient<SignUpResponse>("/auth/sign-up", {
    method: "POST",
    body,
  });
}
