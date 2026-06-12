const API_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== "undefined" && window.location.hostname !== "localhost" 
    ? "" 
    : "http://localhost:6969");

function getUserIdHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("mindbridge_user");
    if (raw) {
      const user = JSON.parse(raw) as { id: string };
      if (user.id) {
        return { "x-user-id": user.id };
      }
    }
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
  }
  return {};
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...getUserIdHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
