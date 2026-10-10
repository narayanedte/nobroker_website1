export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/user';

// Generic POST helper. Cookies carry the JWT, so every request needs
// credentials: 'include' or the browser won't send/accept the auth cookie.
export async function apiRequest(path, body) {
  let res;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    // fetch() throws (not a rejected response) when the server can't be
    // reached at all - wrong port, server not running, CORS preflight
    // blocked, etc. This is what ERR_CONNECTION_REFUSED looks like here.
    throw new Error(
      `Could not reach the server at ${API_BASE}${path}. Is the backend running?`
    );
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

// Convenience wrappers for the auth endpoints
export const registerUser = (payload) => apiRequest('/register', payload);
export const loginUser = (payload) => apiRequest('/login', payload);
export const logoutUser = () => apiRequest('/logout', {});