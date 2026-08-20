'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { maintenanceApi, CreateMaintenanceData, MaintenanceType } from '../../../../api/maintenance';
import { assetsApi, Asset } from '../../../../api/assets';

export default function NewMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);

  const [formData, setFormData] = useState<CreateMaintenanceData>({
    asset: '',
    type: 'maintenance',
    description: '',
    vendor: '',
    cost: 0,
    scheduledDate: '',
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoadingAssets(true);
      const response = await assetsApi.getAll({ limit: 100 });
      setAssets(response.assets);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await maintenanceApi.create(formData);
      router.push('/dashboard/maintenance');
    } catch (err: any) {
      console.error('Failed to create maintenance record:', err);
      setError(err?.response?.data?.message || 'Failed to create maintenance record');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CreateMaintenanceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingAssets) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Schedule Maintenance</h1>
          <Button variant="ghost" onClick={() => router.push('/dashboard/maintenance')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Maintenance</h1>
          <p className="text-muted-foreground mt-2">
            Schedule maintenance or repair for an asset
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/dashboard/maintenance')}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Maintenance
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Asset *</label>
            <select
              value={formData.asset}
              onChange={(e) => updateField('asset', e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Select an asset</option>
              {assets.map((asset) => (
                <option key={asset._id} value={asset._id}>
                  {asset.assetTag} - {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => updateField('type', e.target.value as MaintenanceType)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
              placeholder="Describe the maintenance or repair needed..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Vendor *</label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => updateField('vendor', e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
              placeholder="Service provider or vendor name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Cost *</label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => updateField('cost', parseFloat(e.target.value) || 0)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Scheduled Date *</label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => updateField('scheduledDate', e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/maintenance')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 size-4" />
            {loading ? 'Scheduling...' : 'Schedule Maintenance'}
          </Button>
        </div>
      </form>
    </div>
  );
}
