import { redirect } from 'next/navigation';

export default function ScheduleInspectionRedirect() {
  redirect('/inspections?modal=schedule');
}
