'use client';

import AppLayout from '@/components/AppLayout';
import PageLoader from '@/components/ui/PageLoader';

export default function RouteLoadingFallback() {
  return (
    <AppLayout>
      <PageLoader />
    </AppLayout>
  );
}
