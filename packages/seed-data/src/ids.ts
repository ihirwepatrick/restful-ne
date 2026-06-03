/** Stable IDs for cross-service demo seeds (not enforced as CUID format). */
export const SEED = {
  users: {
    admin: 'seed-user-admin',
    inspector: 'seed-user-inspector',
    user: 'seed-user-facility',
  },
  extinguishers: {
    alpha: 'seed-ext-001',
    beta: 'seed-ext-002',
    gamma: 'seed-ext-003',
  },
  inspections: {
    scheduled: 'seed-insp-scheduled',
    completed: 'seed-insp-completed',
  },
  maintenance: {
    refill: 'seed-maint-001',
    repair: 'seed-maint-002',
  },
  compliance: {
    pending: 'seed-comp-pending',
    overdue: 'seed-comp-overdue',
    compliant: 'seed-comp-compliant',
  },
} as const;

export const SEED_PASSWORD = 'password123';
