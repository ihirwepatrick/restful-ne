import { redirect } from 'next/navigation';

export default async function EditExtinguisherRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/extinguishers?modal=edit&id=${id}`);
}
