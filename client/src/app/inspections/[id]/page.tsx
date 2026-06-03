import { redirect } from 'next/navigation';

export default async function InspectionDetailRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/inspections?modal=view&id=${id}`);
}
