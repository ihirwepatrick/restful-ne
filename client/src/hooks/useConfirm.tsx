'use client';

import { useCallback, useState } from 'react';
import ConfirmModal, { type ConfirmOptions } from '@/components/ui/ConfirmModal';

type PendingConfirm = ConfirmOptions & {
  resolve: (confirmed: boolean) => void;
  onConfirm?: () => void | Promise<void>;
};

export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions & { onConfirm?: () => void | Promise<void> }) => {
      return new Promise<boolean>((resolve) => {
        setPending({ ...options, resolve, onConfirm: options.onConfirm });
      });
    },
    [],
  );

  const close = useCallback((confirmed: boolean) => {
    pending?.resolve(confirmed);
    setPending(null);
  }, [pending]);

  const ConfirmDialog = pending ? (
    <ConfirmModal
      open
      title={pending.title}
      message={pending.message}
      confirmLabel={pending.confirmLabel}
      cancelLabel={pending.cancelLabel}
      variant={pending.variant}
      onClose={() => close(false)}
      onConfirm={async () => {
        if (pending.onConfirm) await pending.onConfirm();
        close(true);
      }}
    />
  ) : null;

  return { confirm, ConfirmDialog };
}
