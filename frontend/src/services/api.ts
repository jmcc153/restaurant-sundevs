const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/dev";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error en la petición API");
  }

  if (response.status === 204) return {} as T;

  return response.json();
}
