// src/components/ui/status-badge.tsx
//
// The signature element of the design system: a chip styled after a
// physical asset tag — a solid color edge (like the sticker border on a
// laptop asset label) + a monospace label. Used anywhere an asset's
// lifecycle state appears: table rows, detail pages, kanban cards.

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // shadcn's default clsx+tailwind-merge helper

const statusBadge = cva(
  'inline-flex items-center gap-1.5 rounded-sm border-l-[3px] px-2 py-0.5 text-xs font-medium font-data',
  {
    variants: {
      status: {
        active: 'border-status-active bg-status-active-bg text-status-active',
        available: 'border-status-available bg-status-available-bg text-status-available',
        maintenance: 'border-status-maintenance bg-status-maintenance-bg text-status-maintenance',
        reserved: 'border-status-reserved bg-status-reserved-bg text-status-reserved',
        retired: 'border-status-retired bg-status-retired-bg text-status-retired',
      },
    },
  }
);

const STATUS_LABEL: Record<NonNullable<VariantProps<typeof statusBadge>['status']>, string> = {
  active: 'IN USE',
  available: 'IN STOCK',
  maintenance: 'MAINTENANCE',
  reserved: 'RESERVED',
  retired: 'RETIRED',
};

interface StatusBadgeProps extends VariantProps<typeof statusBadge> {
  status: NonNullable<VariantProps<typeof statusBadge>['status']>;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadge({ status }), className)}>
      {STATUS_LABEL[status]}
    </span>
  );
}

/* Usage:
   <StatusBadge status="active" />
   <StatusBadge status="maintenance" />

   In a TanStack Table column def:
   { accessorKey: 'status', cell: (info) => <StatusBadge status={info.getValue()} /> }
*/
