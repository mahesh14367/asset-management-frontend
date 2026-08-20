'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Plus, Search, Eye, Edit, Shield, ShieldOff } from 'lucide-react';
import { employeesApi, Employee, EmploymentStatus, EmploymentType } from '../../../api/employees';
import { usePermissions } from '../../../hooks/use-permissions';
import { PermissionGuard } from '../../../components/auth/permission-guard';

export default function EmployeesPage() {
  const router = useRouter();
  const { can } = usePermissions();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmploymentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EmploymentType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.employmentStatus = statusFilter;
      if (typeFilter !== 'all') params.employmentType = typeFilter;
      
      const response = await employeesApi.getAll(params);
      setEmployees(response.employees);
      setTotal(response.pagination?.total || response.employees?.length || 0);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, statusFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const getStatusColor = (status: EmploymentStatus) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      on_leave: 'bg-yellow-100 text-yellow-800',
      resigned: 'bg-gray-100 text-gray-800',
      terminated: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: EmploymentType) => {
    const colors = {
      full_time: 'bg-blue-100 text-blue-800',
      part_time: 'bg-purple-100 text-purple-800',
      contract: 'bg-orange-100 text-orange-800',
      intern: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleGrantAccess = async (employeeId: string) => {
    // This would open a modal to grant system access
    router.push(`/dashboard/employees/${employeeId}/grant-access`);
  };

  const handleRevokeAccess = async (employeeId: string) => {
    try {
      await employeesApi.revokeAccess(employeeId);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to revoke access:', err);
      setError('Failed to revoke access');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground mt-2">
            Manage your workforce ({total} total)
          </p>
        </div>
        <PermissionGuard permission="employees:create">
          <Button onClick={() => router.push('/dashboard/employees/new')}>
            <Plus className="mr-2 size-4" />
            Add Employee
          </Button>
        </PermissionGuard>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EmploymentStatus | 'all')}
          className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="resigned">Resigned</option>
          <option value="terminated">Terminated</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EmploymentType | 'all')}
          className="h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="all">All Types</option>
          <option value="full_time">Full Time</option>
          <option value="part_time">Part Time</option>
          <option value="contract">Contract</option>
          <option value="intern">Intern</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">All Employees</h2>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading employees...</p>
            </div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" className="mt-4" onClick={fetchEmployees}>
                Retry
              </Button>
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">No employees found</p>
              <PermissionGuard permission="employees:create">
                <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/employees/new')}>
                  <Plus className="mr-2 size-4" />
                  Add your first employee
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
                    Employee Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((employee, index) => (
                  <tr key={employee.id || employee.employeeCode || `employee-${index}`} className="hover:bg-accent/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {employee.employeeCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <p className="font-medium">{employee.fullName}</p>
                        <p className="text-muted-foreground text-xs">{employee.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {employee.designation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(employee.employmentStatus)}`}>
                        {employee.employmentStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(employee.employmentType)}`}>
                        {employee.employmentType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <PermissionGuard permission="employees:update">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}
                          >
                            <Edit className="size-4" />
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard permission="employees:manage_access">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGrantAccess(employee.id)}
                            title="Grant System Access"
                          >
                            <Shield className="size-4" />
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
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, total)} of {total} employees
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
