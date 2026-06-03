'use client';

import Button from '@/components/Button';

interface FormActionsProps {
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  loading?: boolean;
  submitDisabled?: boolean;
}

export default function FormActions({
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  loading = false,
  submitDisabled = false,
}: FormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-4">
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-elevated)] disabled:opacity-50"
        >
          {cancelLabel}
        </button>
      )}
      <Button type="submit" variant="orange" disabled={loading || submitDisabled}>
        {loading ? 'Saving…' : submitLabel}
      </Button>
    </div>
  );
}
