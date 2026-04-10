const TOKEN_KEY = 'nova_token';

export const saveToken  = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = ()              => localStorage.removeItem(TOKEN_KEY);
export const getToken   = ()              => localStorage.getItem(TOKEN_KEY);

/**
 * Wrapper de fetch que adjunta automáticamente el JWT en cada petición.
 * Úsalo igual que fetch: apiFetch('/api/ruta', { method: 'POST', body: ... })
 */
export const apiFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
};
