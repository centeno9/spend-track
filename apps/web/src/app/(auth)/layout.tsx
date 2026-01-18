import { User, UserStoreProvider } from "@/features/user";
import { getUserProfile } from "@/features/user/api/get-profile";
import { AppSidebar } from "@/shared/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/components/ui/sidebar";
import { ApiError } from "@/shared/lib/api-client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value;
  if (!authToken) redirect("/login");

  try {
    const user = await getUserProfile(authToken);
    return (
      <UserStoreProvider user={user}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </UserStoreProvider>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/api/auth/logout");
    }
  }
}
