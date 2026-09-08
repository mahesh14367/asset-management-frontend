'use client';

import { Button } from '../ui/button';

interface ReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  condition: string;
  onConditionChange: (value: string) => void;
  remarks: string;
  onRemarksChange: (value: string) => void;
}

export function ReturnModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  condition,
  onConditionChange,
  remarks,
  onRemarksChange,
}: ReturnModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Return Asset</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Condition at Return *</label>
            <select
              value={condition}
              onChange={(e) => onConditionChange(e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm mt-1"
              required
            >
              <option value="">Select condition</option>
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Return Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => onRemarksChange(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm mt-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading || !condition}>
            {loading ? 'Processing...' : 'Return Asset'}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface LostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  remarks: string;
  onRemarksChange: (value: string) => void;
}

export function LostModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  remarks,
  onRemarksChange,
}: LostModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Report Asset as Lost</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => onRemarksChange(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm mt-1"
              placeholder="Provide details about the loss..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onSubmit} disabled={loading}>
            {loading ? 'Processing...' : 'Report Lost'}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface RevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  remarks: string;
  onRemarksChange: (value: string) => void;
}

export function RevokeModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  remarks,
  onRemarksChange,
}: RevokeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Revoke License Assignment</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => onRemarksChange(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm mt-1"
              placeholder="Provide reason for revocation..."
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? 'Processing...' : 'Revoke License'}
          </Button>
        </div>
      </div>
    </div>
  );
}
