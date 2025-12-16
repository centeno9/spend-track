import { apiClient } from "@/shared/lib/api-client";
import { User } from "@/features/user";

export function getUserProfile(accessToken: string): Promise<User> {
  return apiClient<User>("/users/profile", {
    method: "GET",
    headers: {
      Authorization: `bearer ${accessToken}`,
    },
  });
}
