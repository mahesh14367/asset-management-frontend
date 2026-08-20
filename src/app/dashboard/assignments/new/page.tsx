'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { assetAssignmentsApi, CreateAssignmentData } from '../../../../api/asset-assignments';
import { assetsApi, Asset } from '../../../../api/assets';
import { employeesApi, Employee } from '../../../../api/employees';

export default function NewAssignmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [formData, setFormData] = useState<CreateAssignmentData>({
    asset: '',
    employee: '',
    expectedReturnDate: '',
    conditionAtAssignment: 'good',
    remarks: '',
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoadingOptions(true);
      const [assetsRes, employeesRes] = await Promise.all([
        assetsApi.getAll({ limit: 100, status: 'available' as any }),
        employeesApi.getAll({ limit: 100, employmentStatus: 'active' as any })
      ]);
      setAssets(assetsRes.assets);
      setEmployees(employeesRes.employees);
    } catch (err) {
      console.error('Failed to fetch options:', err);
      setError('Failed to load assets and employees');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await assetAssignmentsApi.create(formData);
      router.push('/dashboard/assignments');
    } catch (err: any) {
      console.error('Failed to create assignment:', err);
      setError(err?.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof CreateAssignmentData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loadingOptions) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Assign Asset</h1>
          <Button variant="ghost" onClick={() => router.push('/dashboard/assignments')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assign Asset</h1>
          <p className="text-muted-foreground mt-2">
            Assign an asset to an employee
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/dashboard/assignments')}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Assignments
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
                <option key={(asset as any)._id || asset.id} value={(asset as any)._id || asset.id}>
                  {asset.assetTag} - {asset.name} ({asset.category})
                </option>
              ))}
            </select>
            {assets.length === 0 && (
              <p className="text-xs text-muted-foreground">No available assets found</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Select Employee *</label>
            <select
              value={formData.employee}
              onChange={(e) => updateField('employee', e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">Select an employee</option>
              {employees.map((employee) => (
                <option key={(employee as any)._id || employee.id} value={(employee as any)._id || employee.id}>
                  {employee.fullName} - {employee.department}
                </option>
              ))}
            </select>
            {employees.length === 0 && (
              <p className="text-xs text-muted-foreground">No active employees found</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expected Return Date</label>
            <input
              type="date"
              value={formData.expectedReturnDate}
              onChange={(e) => updateField('expectedReturnDate', e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Condition at Assignment *</label>
            <select
              value={formData.conditionAtAssignment}
              onChange={(e) => updateField('conditionAtAssignment', e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Remarks</label>
          <textarea
            value={formData.remarks}
            onChange={(e) => updateField('remarks', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Add any notes about this assignment..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/assignments')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 size-4" />
            {loading ? 'Creating...' : 'Create Assignment'}
          </Button>
        </div>
      </form>
    </div>
  );
}
