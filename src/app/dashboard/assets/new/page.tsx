'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { assetsApi, CreateHardwareAssetData, CreateLicenseAssetData, AssetCategory, AssetCondition, AssetKind } from '../../../../api/assets';

export default function NewAssetPage() {
  const router = useRouter();
  const [assetKind, setAssetKind] = useState<'hardware' | 'software_license'>('hardware');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardware form state
  const [hardwareData, setHardwareData] = useState<CreateHardwareAssetData>({
    category: 'laptop' as any,
    name: '',
    brand: '',
    modelName: '',
    vendor: '',
    purchaseDate: '',
    purchasePrice: 0,
    warrantyExpiryDate: '',
    location: '',
    notes: '',
    serialNumber: '',
    condition: 'new',
    specifications: {},
  });

  // License form state
  const [licenseData, setLicenseData] = useState<CreateLicenseAssetData>({
    category: 'software_license',
    name: '',
    brand: '',
    vendor: '',
    purchaseDate: '',
    purchasePrice: 0,
    warrantyExpiryDate: '',
    location: '',
    notes: '',
    licenseKey: '',
    totalSeats: 1,
    expiryDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (assetKind === 'hardware') {
        await assetsApi.create(hardwareData);
      } else {
        await assetsApi.create(licenseData);
      }
      router.push('/dashboard/assets');
    } catch (err: any) {
      console.error('Failed to create asset:', err);
      setError(err?.response?.data?.message || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const updateHardwareData = (field: keyof CreateHardwareAssetData, value: any) => {
    setHardwareData(prev => ({ ...prev, [field]: value }));
  };

  const updateLicenseData = (field: keyof CreateLicenseAssetData, value: any) => {
    setLicenseData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Asset</h1>
          <p className="text-muted-foreground mt-2">
            Add a new asset to your inventory
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/dashboard/assets')}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Assets
        </Button>
      </div>

      {/* Asset Kind Selection */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant={assetKind === 'hardware' ? 'default' : 'outline'}
          onClick={() => setAssetKind('hardware')}
          className="flex-1"
        >
          Hardware Asset
        </Button>
        <Button
          type="button"
          variant={assetKind === 'software_license' ? 'default' : 'outline'}
          onClick={() => setAssetKind('software_license')}
          className="flex-1"
        >
          Software License
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {assetKind === 'hardware' ? (
          <HardwareForm
            data={hardwareData}
            onChange={updateHardwareData}
          />
        ) : (
          <LicenseForm
            data={licenseData}
            onChange={updateLicenseData}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/assets')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 size-4" />
            {loading ? 'Creating...' : 'Create Asset'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function HardwareForm({
  data,
  onChange,
}: {
  data: CreateHardwareAssetData;
  onChange: (field: keyof CreateHardwareAssetData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category *</label>
          <select
            value={data.category}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          >
            <option value="laptop">Laptop</option>
            <option value="desktop">Desktop</option>
            <option value="server">Server</option>
            <option value="networking_device">Networking Device</option>
            <option value="mobile_device">Mobile Device</option>
            <option value="printer">Printer</option>
            <option value="accessory">Accessory</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Asset Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Brand *</label>
          <input
            type="text"
            value={data.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Model Name *</label>
          <input
            type="text"
            value={data.modelName}
            onChange={(e) => onChange('modelName', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Serial Number *</label>
          <input
            type="text"
            value={data.serialNumber}
            onChange={(e) => onChange('serialNumber', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Condition *</label>
          <select
            value={data.condition}
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Vendor *</label>
          <input
            type="text"
            value={data.vendor}
            onChange={(e) => onChange('vendor', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Purchase Date *</label>
          <input
            type="date"
            value={data.purchaseDate}
            onChange={(e) => onChange('purchaseDate', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Purchase Price *</label>
          <input
            type="number"
            value={data.purchasePrice}
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
            value={data.warrantyExpiryDate}
            onChange={(e) => onChange('warrantyExpiryDate', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Location *</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange('location', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

function LicenseForm({
  data,
  onChange,
}: {
  data: CreateLicenseAssetData;
  onChange: (field: keyof CreateLicenseAssetData, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Software Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Brand/Vendor *</label>
          <input
            type="text"
            value={data.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">License Key *</label>
          <input
            type="text"
            value={data.licenseKey}
            onChange={(e) => onChange('licenseKey', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Total Seats *</label>
          <input
            type="number"
            value={data.totalSeats}
            onChange={(e) => onChange('totalSeats', parseInt(e.target.value) || 1)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
            min="1"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Vendor *</label>
          <input
            type="text"
            value={data.vendor}
            onChange={(e) => onChange('vendor', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Purchase Date *</label>
          <input
            type="date"
            value={data.purchaseDate}
            onChange={(e) => onChange('purchaseDate', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Purchase Price *</label>
          <input
            type="number"
            value={data.purchasePrice}
            onChange={(e) => onChange('purchasePrice', parseFloat(e.target.value) || 0)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">License Expiry Date *</label>
          <input
            type="date"
            value={data.expiryDate}
            onChange={(e) => onChange('expiryDate', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Warranty Expiry Date *</label>
          <input
            type="date"
            value={data.warrantyExpiryDate}
            onChange={(e) => onChange('warrantyExpiryDate', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Location *</label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => onChange('location', e.target.value)}
            className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          value={data.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}
