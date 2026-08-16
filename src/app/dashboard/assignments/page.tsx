'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Plus, Search, Eye, RotateCcw, AlertTriangle, Ban } from 'lucide-react';
import { assetAssignmentsApi, AssetAssignment, AssignmentStatus, AssignmentAssetKind } from '../../../api/asset-assignments';
import { usePermissions } from '../../../hooks/use-permissions';
import { PermissionGuard } from '../../../components/auth/permission-guard';

export default function AssignmentsPage() {
  const router = useRouter();
  const { can } = usePermissions();
  
  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'all'>('all');
  const [kindFilter, setKindFilter] = useState<AssignmentAssetKind | 'all'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (kindFilter !== 'all') params.assetKind = kindFilter;
      
      const response = await assetAssignmentsApi.getAll(params);
      setAssignments(response.assignments);
      setTotal(response.pagination?.total || response.assignments?.length || 0);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [page, statusFilter, kindFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAssignments();
  };

  const handleReturn = async (assignmentId: string) => {
    try {
      await assetAssignmentsApi.return(assignmentId, {
        conditionAtReturn: 'good',
        returnRemarks: 'Returned via dashboard'
      });
      fetchAssignments();
    } catch (err) {
      console.error('Failed to return assignment:', err);
      setError('Failed to return asset');
    }
  };

  const handleReportLost = async (assignmentId: string) => {
    try {
      await assetAssignmentsApi.reportLost(assignmentId, {
        remarks: 'Reported lost via dashboard'
      });
      fetchAssignments();
    } catch (err) {
      console.error('Failed to report lost:', err);
      setError('Failed to report asset as lost');
    }
  };

  const handleRevoke = async (assignmentId: string) => {
    try {
      await assetAssignmentsApi.revoke(assignmentId, {
        revokeRemarks: 'Revoked via dashboard'
      });
      fetchAssignments();
    } catch (err) {
      console.error('Failed to revoke assignment:', err);
      setError('Failed to revoke assignment');
    }
  };

  const getStatusColor = (status: AssignmentStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      returned: 'bg-blue-100 text-blue-800',
      lost: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Assignments</h1>
          <p className="text-muted-foreground mt-2">
            Manage asset assignments ({total} total)
          </p>
        </div>
        <PermissionGuard permission="assignments:create">
          <Button onClick={() => router.push('/dashboard/assignments/new')}>
            <Plus className="mr-2 size-4" />
            Assign Asset
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as AssignmentStatus | 'all')}
          className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="returned">Returned</option>
          <option value="lost">Lost</option>
          <option value="revoked">Revoked</option>
        </select>

        <select
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value as AssignmentAssetKind | 'all')}
          className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Types</option>
          <option value="hardware">Hardware</option>
          <option value="software_license">Software License</option>
        </select>
      </div>

      {/* Assignments Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">All Assignments</h2>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading assignments...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchAssignments}>
                Retry
              </Button>
            </div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No assignments found</p>
              <PermissionGuard permission="assignments:create">
                <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/assignments/new')}>
                  <Plus className="mr-2 size-4" />
                  Create your first assignment
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
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Assigned Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Expected Return
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
                {assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-accent/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {assignment.asset && typeof assignment.asset === 'object' 
                        ? assignment.asset.name 
                        : typeof assignment.asset === 'string' 
                          ? assignment.asset 
                          : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {assignment.employee && typeof assignment.employee === 'object' 
                        ? assignment.employee.fullName 
                        : typeof assignment.employee === 'string' 
                          ? assignment.employee 
                          : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(assignment.assignedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {assignment.expectedReturnDate 
                        ? new Date(assignment.expectedReturnDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(assignment.status || 'active')}`}>
                        {assignment.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/assignments/${assignment._id}`)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        {assignment.status === 'active' && (
                          <>
                            <PermissionGuard permission="assignments:update">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReturn(assignment._id)}
                                title="Return Asset"
                              >
                                <RotateCcw className="size-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permission="assignments:update">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReportLost(assignment._id)}
                                title="Report Lost"
                              >
                                <AlertTriangle className="size-4 text-destructive" />
                              </Button>
                            </PermissionGuard>
                            {assignment.assetKind === 'software_license' && (
                              <PermissionGuard permission="assignments:update">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRevoke(assignment._id)}
                                  title="Revoke License"
                                >
                                  <Ban className="size-4 text-destructive" />
                                </Button>
                              </PermissionGuard>
                            )}
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
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} assignments
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
