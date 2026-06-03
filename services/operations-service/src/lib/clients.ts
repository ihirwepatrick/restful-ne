const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const EQUIPMENT_URL = process.env.EQUIPMENT_SERVICE_URL || 'http://localhost:4002';
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || 'internal-dev-key-change-in-production';

export async function getExtinguisher(id: string) {
  const res = await fetch(`${EQUIPMENT_URL}/api/equipment/internal/extinguishers/${id}`, {
    headers: { 'x-internal-key': INTERNAL_KEY },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getUser(id: string) {
  const res = await fetch(`${AUTH_URL}/api/auth/internal/users/${id}`, {
    headers: { 'x-internal-key': INTERNAL_KEY },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getAdmins() {
  const res = await fetch(`${AUTH_URL}/api/auth/internal/users/admins`, {
    headers: { 'x-internal-key': INTERNAL_KEY },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getInspectors() {
  const res = await fetch(`${AUTH_URL}/api/auth/users/inspectors`, {
    headers: { 'x-internal-key': INTERNAL_KEY },
  });
  return [];
}

export async function patchExtinguisherStatus(id: string, statusId: number) {
  await fetch(`${EQUIPMENT_URL}/api/equipment/extinguishers/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': INTERNAL_KEY,
      'x-user-id': 'system',
      'x-user-role': 'ADMIN',
    },
    body: JSON.stringify({ statusId }),
  });
}
