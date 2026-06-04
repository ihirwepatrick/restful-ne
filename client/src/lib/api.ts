const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function getTokens() {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken, refreshToken } = getTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the server. Ensure Docker and backend services are running (port 4000).');
  }

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      const { accessToken: newToken } = await refreshRes.json();
      localStorage.setItem('accessToken', newToken);
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  const text = await res.text();
  let data: Record<string, unknown> = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!res.ok) {
        throw new Error(res.status >= 500 ? 'Server error. Check that all backend services are running.' : text.slice(0, 120) || 'Request failed');
      }
    }
  }

  if (!res.ok) {
    throw new Error((data.message as string) || `Request failed (${res.status})`);
  }
  return data as T;
}

function parseFilenameFromDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const match = header.match(/filename="([^"]+)"/i) || header.match(/filename=([^;\s]+)/i);
  return match?.[1]?.trim() || fallback;
}

async function fetchWithAuth(path: string, options: RequestInit = {}): Promise<Response> {
  const { accessToken, refreshToken } = getTokens();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the server. Ensure Docker and backend services are running (port 4000).');
  }

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      const { accessToken: newToken } = await refreshRes.json();
      localStorage.setItem('accessToken', newToken);
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${path}`, { ...options, headers });
    } else {
      clearTokens();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return res;
}

async function throwIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;
  const text = await res.text();
  let message = `Request failed (${res.status})`;
  try {
    const data = JSON.parse(text) as { message?: string };
    if (data.message) message = data.message;
  } catch {
    if (text) message = text.slice(0, 120);
  }
  if (res.status === 403) message = 'Admin access required';
  throw new Error(message);
}

/** Download a file attachment (e.g. CSV export). Triggers browser save dialog. */
export async function downloadFile(path: string, fallbackFilename = 'download.csv'): Promise<void> {
  const res = await fetchWithAuth(path, { method: 'GET' });
  await throwIfNotOk(res);

  const blob = await res.blob();
  const filename = parseFilenameFromDisposition(
    res.headers.get('Content-Disposition'),
    fallbackFilename,
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
