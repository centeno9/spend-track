const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.myspendtrack.com";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<TResponse>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<TResponse> {
  const { method = "GET", body, headers = {} } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorMessage = `Request failed with ${res.status} ${res.statusText}`;
    let data: unknown;

    try {
      data = await res.json();
      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as { message?: unknown }).message === "string"
      ) {
        errorMessage = (data as { message: string }).message;
      }
    } catch {
      // ignore JSON parsing errors and fall back to the default message
    }

    throw new ApiError(errorMessage, res.status, data);
  }

  const json = (await res.json()) as TResponse;
  return json;
}
