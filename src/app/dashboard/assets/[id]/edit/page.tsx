'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '../../../../../components/ui/button';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { assetsApi, Asset, UpdateAssetData, AssetCategory, AssetCondition, AssetKind } from '../../../../../api/assets';
import { DeleteAssetModal } from '../../../../../components/delete-asset-modal';

function toInputDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return dateStr.split('T')[0];
}

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  // Form state - will be initialized from asset data
  const [formData, setFormData] = useState<UpdateAssetData>({});

  useEffect(() => {
    fetchAsset();
  }, [assetId]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      const data = await assetsApi.getById(assetId);
      setAsset(data);
      
      // Initialize form data with current asset values
      setFormData({
        name: data.name,
        brand: data.brand,
        modelName: data.modelName,
        vendor: data.vendor,
        purchaseDate: toInputDate(data.purchaseDate),
        purchasePrice: data.purchasePrice,
        warrantyExpiryDate: toInputDate(data.warrantyExpiryDate),
        location: data.location,
        notes: data.notes,
        condition: data.condition,
        specifications: data.specifications,
      });
    } catch (err: any) {
      console.error('Failed to fetch asset:', err);
      setError(err?.response?.data?.message || 'Failed to load asset details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await assetsApi.update(assetId, formData);
      router.push(`/dashboard/assets/${assetId}`);
    } catch (err: any) {
      console.error('Failed to update asset:', err);
      setError(err?.response?.data?.message || 'Failed to update asset');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof UpdateAssetData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !asset) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/assets')}>
            Back to Assets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Asset</h1>
          <p className="text-muted-foreground mt-2">
            Update asset information for {asset?.assetTag}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push(`/dashboard/assets/${assetId}`)}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Asset
          </Button>
          <Button variant="destructive" onClick={() => asset && setAssetToDelete(asset)}>
            <Trash2 className="mr-2 size-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <EditForm
          data={formData}
          asset={asset}
          onChange={updateFormData}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/assets/${assetId}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="mr-2 size-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>

      <DeleteAssetModal
        asset={asset}
        open={!!assetToDelete}
        onClose={() => setAssetToDelete(null)}
        onDeleted={() => router.push('/dashboard/assets')}
      />
    </div>
  );
}

function EditForm({
  data,
  asset,
  onChange,
}: {
  data: UpdateAssetData;
  asset: Asset | null;
  onChange: (field: keyof UpdateAssetData, value: any) => void;
}) {
  if (!asset) return null;

  const isHardware = asset.assetKind === 'hardware';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Asset Name *</label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Brand *</label>
          <input
            type="text"
            value={data.brand || ''}
            onChange={(e) => onChange('brand', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        {isHardware && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Model Name *</label>
            <input
              type="text"
              value={data.modelName || ''}
              onChange={(e) => onChange('modelName', e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>
        )}

        {isHardware && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Condition *</label>
            <select
              value={data.condition || 'new'}
              onChange={(e) => onChange('condition', e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Vendor *</label>
          <input
            type="text"
            value={data.vendor || ''}
            onChange={(e) => onChange('vendor', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Purchase Date *</label>
          <input
            type="date"
            value={data.purchaseDate || ''}
            onChange={(e) => onChange('purchaseDate', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Purchase Price *</label>
          <input
            type="number"
            value={data.purchasePrice || 0}
            onChange={(e) => onChange('purchasePrice', parseFloat(e.target.value) || 0)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Warranty Expiry Date *</label>
          <input
            type="date"
            value={data.warrantyExpiryDate || ''}
            onChange={(e) => onChange('warrantyExpiryDate', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location *</label>
          <input
            type="text"
            value={data.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Some fields like serial number, license key, and category cannot be edited here. 
          Contact administrator if these need to be changed.
        </p>
      </div>
    </div>
  );
}
