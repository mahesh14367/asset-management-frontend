'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Edit, Mail, Phone, Building, MapPin, Calendar, User, Briefcase } from 'lucide-react';
import { employeesApi, Employee, EmploymentStatus, EmploymentType } from '../../../../api/employees';
import { usePermissions } from '../../../../hooks/use-permissions';
import { PermissionGuard } from '../../../../components/auth/permission-guard';

export default function EmployeeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { can } = usePermissions();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployee();
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      if (!employeeId) {
        throw new Error('Employee ID is missing');
      }
      console.log('Fetching employee with ID:', employeeId);
      const data = await employeesApi.getById(employeeId);
      setEmployee(data);
    } catch (err: any) {
      console.error('Failed to fetch employee:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to load employee details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Employee Details</h1>
          <Button variant="ghost" onClick={() => router.push('/dashboard/employees')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Employee Details</h1>
          <Button variant="ghost" onClick={() => router.push('/dashboard/employees')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">{error || 'Employee not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/employees')}>
            Back to Employees
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
          <h1 className="text-3xl font-bold tracking-tight">{employee.fullName}</h1>
          <p className="text-muted-foreground mt-2">
            {employee.employeeCode} • {employee.designation}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push('/dashboard/employees')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
          <PermissionGuard permission="employees:update">
            <Button onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}>
              <Edit className="mr-2 size-4" />
              Edit
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(employee.employmentStatus)}`}>
          {employee.employmentStatus.replace('_', ' ')}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getTypeColor(employee.employmentType)}`}>
          {employee.employmentType.replace('_', ' ')}
        </span>
      </div>

      {/* Employee Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Employee Code</p>
                <p className="font-medium">{employee.employeeCode}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{employee.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{employee.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Information */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Work Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Building className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{employee.department}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Designation</p>
                <p className="font-medium">{employee.designation}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Work Location</p>
                <p className="font-medium">{employee.workLocation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Employment Details</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Date of Joining</p>
                <p className="font-medium">{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
              </div>
            </div>
            {employee.dateOfLeaving && (
              <div className="flex items-start gap-3">
                <Calendar className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date of Leaving</p>
                  <p className="font-medium">{new Date(employee.dateOfLeaving).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {employee.reportingManager && (
              <div>
                <p className="text-sm text-muted-foreground">Reporting Manager</p>
                <p className="font-medium">{employee.reportingManager}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <PermissionGuard permission="employees:update">
            <Button variant="outline" onClick={() => router.push(`/dashboard/employees/${employee.id}/edit`)}>
              <Edit className="mr-2 size-4" />
              Update Employment Status
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="employees:manage_access">
            <Button variant="outline" onClick={() => router.push(`/dashboard/employees/${employee.id}/grant-access`)}>
              <User className="mr-2 size-4" />
              Grant System Access
            </Button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}
