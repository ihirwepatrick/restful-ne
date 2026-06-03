import { redirect } from 'next/navigation';

export default async function ExtinguisherDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/extinguishers?modal=view&id=${id}`);
}
