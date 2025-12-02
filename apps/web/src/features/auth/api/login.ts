import { apiClient } from "@/shared/lib/api-client";
import { LoginResponse } from "..";

export async function login(email: string, password: string) {
  return apiClient<LoginResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}
