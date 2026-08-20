'use client';

import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { reportsApi, ReportType, ReportFormat } from '../../../api/reports';
import { usePermissions } from '../../../hooks/use-permissions';
import { PermissionGuard } from '../../../components/auth/permission-guard';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { can } = usePermissions();

  const reportTypes: { value: ReportType; label: string; icon: any }[] = [
    { value: 'asset_inventory', label: 'Asset Inventory', icon: FileSpreadsheet },
    { value: 'asset_assignments', label: 'Asset Assignments', icon: FileText },
    { value: 'maintenance_log', label: 'Maintenance Log', icon: File },
    { value: 'employee_assets', label: 'Employee Assets', icon: FileText },
  ];

  const formats: { value: ReportFormat; label: string }[] = [
    { value: 'csv', label: 'CSV' },
    { value: 'xlsx', label: 'Excel (XLSX)' },
    { value: 'pdf', label: 'PDF' },
  ];

  const handleDownload = async (type: ReportType, format: ReportFormat) => {
    setLoading(true);
    setError(null);

    try {
      const blob = await reportsApi.download({ type, format });
      
      // Validate blob
      if (!(blob instanceof Blob)) {
        throw new Error('Invalid response format from server');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Failed to download report:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to download report';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-2">
          Download and export reports in various formats
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {reportTypes.map((reportType) => (
          <div key={reportType.value} className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <reportType.icon className="size-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">{reportType.label}</h3>
                <p className="text-sm text-muted-foreground">
                  Export {reportType.label.toLowerCase()} data
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Download as:</p>
              <div className="flex flex-wrap gap-2">
                {formats.map((format) => (
                  <Button
                    key={format.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(reportType.value, format.value)}
                    disabled={loading}
                  >
                    <Download className="mr-2 size-4" />
                    {format.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Report Information</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Reports are generated based on current data in the system</p>
          <p>• CSV files are suitable for spreadsheet import and analysis</p>
          <p>• Excel (XLSX) files include formatting and multiple sheets</p>
          <p>• PDF files are suitable for printing and sharing</p>
          <p>• Large datasets may take longer to generate</p>
        </div>
      </div>
    </div>
  );
}
