import PageLoader from '@/components/ui/PageLoader';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--main-bg)]">
      <PageLoader label="Loading page…" />
    </div>
  );
}
