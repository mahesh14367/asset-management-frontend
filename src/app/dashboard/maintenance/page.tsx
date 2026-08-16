'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Plus, Search, Eye, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { maintenanceApi, MaintenanceRecord, MaintenanceStatus, MaintenanceType } from '../../../api/maintenance';
import { usePermissions } from '../../../hooks/use-permissions';
import { PermissionGuard } from '../../../components/auth/permission-guard';

export default function MaintenancePage() {
  const router = useRouter();
  const { can } = usePermissions();
  
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      
      const response = await maintenanceApi.getAll(params);
      setRecords(response.records);
      setTotal(response.pagination?.total || response.records?.length || 0);
    } catch (err) {
      console.error('Failed to fetch maintenance records:', err);
      setError('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, statusFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleComplete = async (recordId: string) => {
    try {
      await maintenanceApi.complete(recordId, {
        resolvedNotes: 'Completed via dashboard'
      });
      fetchRecords();
    } catch (err) {
      console.error('Failed to complete maintenance:', err);
      setError('Failed to complete maintenance');
    }
  };

  const handleCancel = async (recordId: string) => {
    try {
      await maintenanceApi.cancel(recordId, {
        resolvedNotes: 'Cancelled via dashboard'
      });
      fetchRecords();
    } catch (err) {
      console.error('Failed to cancel maintenance:', err);
      setError('Failed to cancel maintenance');
    }
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: MaintenanceType) => {
    const colors = {
      maintenance: 'bg-blue-100 text-blue-800',
      repair: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground mt-2">
            Track asset maintenance and repairs ({total} total)
          </p>
        </div>
        <PermissionGuard permission="maintenance:create">
          <Button onClick={() => router.push('/dashboard/maintenance/new')}>
            <Plus className="mr-2 size-4" />
            Schedule Maintenance
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search maintenance records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatus | 'all')}
          className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as MaintenanceType | 'all')}
          className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Types</option>
          <option value="maintenance">Maintenance</option>
          <option value="repair">Repair</option>
        </select>
      </div>

      {/* Maintenance Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Maintenance Records</h2>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading maintenance records...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchRecords}>
                Retry
              </Button>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No maintenance records found</p>
              <PermissionGuard permission="maintenance:create">
                <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/maintenance/new')}>
                  <Plus className="mr-2 size-4" />
                  Schedule your first maintenance
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
                    Asset
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((record) => (
                  <tr key={record._id} className="hover:bg-accent/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {record.asset}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(record.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/maintenance/${record._id}`)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {record.status === 'open' && (
                          <>
                            <PermissionGuard permission="maintenance:update">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleComplete(record._id)}
                                title="Complete"
                              >
                                <CheckCircle className="size-4 text-green-600" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permission="maintenance:update">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancel(record._id)}
                                title="Cancel"
                              >
                                <XCircle className="size-4 text-destructive" />
                              </Button>
                            </PermissionGuard>
                          </>
                        )}
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
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} records
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
    </div>
  );
}
