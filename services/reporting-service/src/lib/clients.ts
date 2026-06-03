const EQUIPMENT_URL = process.env.EQUIPMENT_SERVICE_URL || 'http://localhost:4002';
const OPERATIONS_URL = process.env.OPERATIONS_SERVICE_URL || 'http://localhost:4003';
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || 'internal-dev-key-change-in-production';

const internalHeaders = { 'x-internal-key': INTERNAL_KEY };

export async function fetchExtinguishers(query = '') {
  const res = await fetch(`${EQUIPMENT_URL}/api/equipment/extinguishers?${query}`, {
    headers: { ...internalHeaders, 'x-user-id': 'system', 'x-user-role': 'ADMIN', 'x-user-email': 'system@tzw.local' },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchInspections() {
  const res = await fetch(`${OPERATIONS_URL}/api/operations/internal/inspections`, { headers: internalHeaders });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchMaintenance(from?: string, to?: string, page = 1, limit = 50) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const res = await fetch(`${OPERATIONS_URL}/api/operations/internal/maintenance?${params}`, { headers: internalHeaders });
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

export async function fetchUser(id: string) {
  const res = await fetch(`${AUTH_URL}/api/auth/internal/users/${id}`, { headers: internalHeaders });
  if (!res.ok) return null;
  return res.json();
}
