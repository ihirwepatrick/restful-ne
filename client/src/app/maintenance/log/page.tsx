import { redirect } from 'next/navigation';

export default function LogMaintenanceRedirect() {
  redirect('/maintenance?modal=log');
}
