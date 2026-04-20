const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchWithAuth = async (endpoint, method = "GET", body = null) => {
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");

  return data;
};
