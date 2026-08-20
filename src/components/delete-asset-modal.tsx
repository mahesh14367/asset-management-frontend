'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';
import { assetsApi, Asset } from '../api/assets';

interface DeleteAssetModalProps {
  asset: Asset | null;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteAssetModal({ asset, open, onClose, onDeleted }: DeleteAssetModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!open || !asset) return null;

  const isAssigned = asset.status === 'assigned';
  const isLicenseWithSeats = asset.assetKind === 'software_license' && (
    (asset.seatsAllocated ?? 0) > 0 || (asset.activeSeats?.length ?? 0) > 0
  );
  const canDelete = !isAssigned && !isLicenseWithSeats;
  const allocatedSeats = asset.seatsAllocated ?? asset.activeSeats?.length ?? 0;

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await assetsApi.delete(asset.id);
      onClose();
      onDeleted();
    } catch (err) {
      console.error('Failed to delete asset:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => !deleting && onClose()} />
      <div className="relative bg-card rounded-lg border border-border shadow-lg p-6 max-w-md w-full mx-4">
        {isLicenseWithSeats ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="size-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">Cannot Delete License</h3>
            </div>
            <p className="text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{asset.name}</span> ({asset.assetTag}) has{' '}
              <span className="font-medium text-foreground">{allocatedSeats}</span>{' '}
              {allocatedSeats === 1 ? 'seat' : 'seats'} currently allocated. Please revoke all access before deleting this license.
            </p>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        ) : isAssigned ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="size-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">Cannot Delete Asset</h3>
            </div>
            <p className="text-muted-foreground mt-2">
              <span className="font-medium text-foreground">{asset.name}</span> ({asset.assetTag}) is currently assigned to{' '}
              <span className="font-medium text-foreground">
                {asset.currentAssignment?.employee?.fullName || 'an employee'}
              </span>
              {asset.currentAssignment?.employee?.email && (
                <span className="text-muted-foreground"> ({asset.currentAssignment.employee.email})</span>
              )}. Please return the asset before deleting it.
            </p>
            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold">Delete Asset</h3>
            <p className="text-muted-foreground mt-2">
              Are you sure you want to delete <span className="font-medium text-foreground">{asset.name}</span> ({asset.assetTag})? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={onClose} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
