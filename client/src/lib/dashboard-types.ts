import type { DashboardPeriod } from '@tzw/shared';

export type { DashboardPeriod };

export interface DashboardDelta {
  value: number;
  percent: number;
}

export interface DashboardData {
  generatedAt: string;
  period: DashboardPeriod;
  stock: {
    totalInStock: number;
    activeCount: number;
    expiredCount: number;
    needsInspectionCount: number;
    underMaintenanceCount: number;
    byType: Record<string, number>;
  };
  inspections: {
    scheduled: number;
    inProgress: number;
    completed: number;
    overdue: number;
    pass: number;
    fail: number;
    pending: number;
    completedInPeriod: number;
  };
  trends: {
    stock: {
      snapshotDate: string;
      totalInStock: number;
      activeCount: number;
      expiredCount: number;
    }[];
    inspectionsByDay: { date: string; scheduled: number; completed: number }[];
  };
  deltas: {
    stockTotal: DashboardDelta;
    completedInspections: DashboardDelta;
    overdue: DashboardDelta;
    expiredCount: DashboardDelta;
  };
  overdueInspections: InspectionListItem[];
  upcomingInspections: InspectionListItem[];
  recentMaintenance: MaintenanceListItem[];
}

export interface InspectionListItem {
  id: string;
  extinguisherId: string;
  serialNumber: string;
  location: string;
  scheduledAt: string;
  status: string;
  result: string;
}

export interface MaintenanceListItem {
  id?: string;
  actionTaken: string;
  performedAt: string;
  conditionsNoted?: string;
  description?: string;
  performedByName?: string;
  extinguisherSerial?: string;
}

export const DASHBOARD_PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
  { value: 'yearly', label: '1Y' },
];
