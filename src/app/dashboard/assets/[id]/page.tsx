'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Edit, Trash2, Package, Calendar, DollarSign, MapPin, AlertCircle } from 'lucide-react';
import { assetsApi, Asset, AssetStatus, AssetCondition } from '../../../../api/assets';
import { usePermissions } from '../../../../hooks/use-permissions';
import { PermissionGuard } from '../../../../components/auth/permission-guard';
import { DeleteAssetModal } from '../../../../components/delete-asset-modal';

export default function AssetDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { can } = usePermissions();
  const assetId = params.id as string;

  console.log('Params:', params);
  console.log('Asset ID from params:', assetId);

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchAsset();
  }, [assetId]);

  const fetchAsset = async () => {
    try {
      setLoading(true);
      if (!assetId) {
        throw new Error('Asset ID is missing');
      }
      console.log('Fetching asset with ID:', assetId);
      const data = await assetsApi.getById(assetId);
      setAsset(data);
    } catch (err: any) {
      console.error('Failed to fetch asset:', err);
      if (err?.response) {
        console.error('Error response data:', err.response.data);
      }
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load asset details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await assetsApi.updateStatus(assetId, { status: 'disposed', reason: 'Deleted by user' });
      router.push('/dashboard/assets');
    } catch (err) {
      console.error('Failed to delete asset:', err);
      setError('Failed to delete asset');
    }
  };

  const getStatusColor = (status: AssetStatus) => {
    const colors = {
      available: 'bg-green-100 text-green-800',
      assigned: 'bg-blue-100 text-blue-800',
      under_maintenance: 'bg-yellow-100 text-yellow-800',
      in_repair: 'bg-orange-100 text-orange-800',
      retired: 'bg-gray-100 text-gray-800',
      disposed: 'bg-red-100 text-red-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition?: AssetCondition) => {
    if (!condition) return 'bg-gray-100 text-gray-800';
    const colors = {
      new: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      damaged: 'bg-red-100 text-red-800',
    };
    return colors[condition];
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Asset Details</h1>
          <Button variant="ghost" onClick={() => router.push('/dashboard/assets')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Asset Details</h1>
          <Button variant="ghost" onClick={() => router.push('/dashboard/assets')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">{error || 'Asset not found'}</p>
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
          <h1 className="text-3xl font-bold tracking-tight">{asset.name}</h1>
          <p className="text-muted-foreground mt-2">
            {asset.assetTag} • {asset.category.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/dashboard/assets')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <PermissionGuard permission="assets:update">
            <Button onClick={() => router.push(`/dashboard/assets/${asset.id}/edit`)}>
              <Edit className="mr-2 size-4" />
              Edit
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="assets:delete">
            <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(asset.status)}`}>
          {asset.status.replace('_', ' ')}
        </span>
        {asset.condition && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getConditionColor(asset.condition)}`}>
            {asset.condition}
          </span>
        )}
      </div>

      {/* Asset Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Asset Tag</p>
                <p className="font-medium">{asset.assetTag}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium">{asset.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Purchase Date</p>
                <p className="font-medium">{new Date(asset.purchaseDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <DollarSign className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Purchase Price</p>
                <p className="font-medium">${asset.purchasePrice.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Warranty Expiry</p>
                <p className="font-medium">{new Date(asset.warrantyExpiryDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-medium">{asset.vendor}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hardware/Software Specific */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {asset.assetKind === 'hardware' ? 'Hardware Details' : 'License Details'}
          </h3>
          <div className="space-y-4">
            {asset.assetKind === 'hardware' ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{asset.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Model</p>
                  <p className="font-medium">{asset.modelName}</p>
                </div>
                {asset.serialNumber && (
                  <div>
                    <p className="text-sm text-muted-foreground">Serial Number</p>
                    <p className="font-medium">{asset.serialNumber}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{asset.brand}</p>
                </div>
                {asset.licenseKey && (
                  <div>
                    <p className="text-sm text-muted-foreground">License Key</p>
                    <p className="font-medium font-mono">{asset.licenseKey}</p>
                  </div>
                )}
                {asset.totalSeats && (
                  <div>
                    <p className="text-sm text-muted-foreground">Total Seats</p>
                    <p className="font-medium">{asset.totalSeats}</p>
                  </div>
                )}
                {asset.seatsAllocated !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">Seats Allocated</p>
                    <p className="font-medium">{asset.seatsAllocated}</p>
                  </div>
                )}
                {asset.expiryDate && (
                  <div>
                    <p className="text-sm text-muted-foreground">License Expiry</p>
                    <p className="font-medium">{new Date(asset.expiryDate).toLocaleDateString()}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {asset.notes && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          <p className="text-sm">{asset.notes}</p>
        </div>
      )}

      {/* Attachments */}
      {asset.attachments && asset.attachments.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Attachments</h3>
          <div className="space-y-2">
            {asset.attachments.map((attachment: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm">{attachment.name || attachment.key}</span>
                <Button variant="ghost" size="sm">
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteAssetModal
        asset={asset}
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDeleted={() => router.push('/dashboard/assets')}
      />
    </div>
  );
}
