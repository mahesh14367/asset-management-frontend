'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { assetsApi, Asset, AssetStatus, AssetCategory, AssetKind } from '../../../api/assets';
import { usePermissions } from '../../../hooks/use-permissions';
import { PermissionGuard } from '../../../components/auth/permission-guard';
import { DeleteAssetModal } from '../../../components/delete-asset-modal';

export default function AssetsPage() {
  const router = useRouter();
  const { can } = usePermissions();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      
      const response = await assetsApi.getAll(params);
      setAssets(response.assets);
      setTotal(response.pagination?.total || response.assets?.length || 0);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [page, statusFilter, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAssets();
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

  const getCategoryIcon = (category: AssetCategory) => {
    // Simple icon mapping - can be enhanced
    return '📦';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your assets ({total} total)
          </p>
        </div>
        <PermissionGuard permission="assets:create">
          <Button onClick={() => router.push('/dashboard/assets/new')}>
            <Plus className="mr-2 size-4" />
            Add Asset
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AssetStatus | 'all')}
          className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available</option>
          <option value="assigned">Assigned</option>
          <option value="under_maintenance">Under Maintenance</option>
          <option value="in_repair">In Repair</option>
          <option value="retired">Retired</option>
          <option value="disposed">Disposed</option>
          <option value="lost">Lost</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as AssetCategory | 'all')}
          className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Categories</option>
          <option value="laptop">Laptop</option>
          <option value="desktop">Desktop</option>
          <option value="server">Server</option>
          <option value="networking_device">Networking Device</option>
          <option value="mobile_device">Mobile Device</option>
          <option value="printer">Printer</option>
          <option value="accessory">Accessory</option>
          <option value="software_license">Software License</option>
        </select>
      </div>

      {/* Assets Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">All Assets</h2>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading assets...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchAssets}>
                Retry
              </Button>
            </div>
          </div>
        ) : assets.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No assets found</p>
              <PermissionGuard permission="assets:create">
                <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/assets/new')}>
                  <Plus className="mr-2 size-4" />
                  Add your first asset
                </Button>
              </PermissionGuard>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Asset Tag
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-accent/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {asset.assetTag}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {asset.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="flex items-center gap-2">
                        <span>{getCategoryIcon(asset.category)}</span>
                        <span className="capitalize">{asset.category.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(asset.status)}`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {asset.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/assets/${asset.id}`)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <PermissionGuard permission="assets:update">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/assets/${asset.id}/edit`)}
                          >
                            <Edit className="size-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="assets:delete">
                          <Button variant="ghost" size="icon" onClick={() => setAssetToDelete(asset)}>
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} assets
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={page * 10 >= total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <DeleteAssetModal
        asset={assetToDelete}
        open={!!assetToDelete}
        onClose={() => setAssetToDelete(null)}
        onDeleted={fetchAssets}
      />
    </div>
  );
}
