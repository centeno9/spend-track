import type { CreateTagPayload, Tag } from "@/shared/types/expense.types";

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch("/api/tags");

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to fetch" }));
    throw new Error(error.error || "Failed to fetch tags");
  }

  return res.json();
}

export async function createTag(payload: CreateTagPayload): Promise<Tag> {
  const res = await fetch("/api/tags", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Failed to create" }));
    throw new Error(error.message || "Failed to create tag");
  }

  return res.json();
}
