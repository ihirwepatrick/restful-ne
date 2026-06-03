import { redirect } from 'next/navigation';

export default function NewExtinguisherRedirect() {
  redirect('/extinguishers?modal=new');
}
