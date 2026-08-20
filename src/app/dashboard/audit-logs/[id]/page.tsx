'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft, User, Clock, AlertCircle, CheckCircle2, Globe, Monitor } from 'lucide-react';
import { AuditLog, AuditStatus } from '../../../../api/audit-logs';

export default function AuditLogDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const logId = params.id as string;

  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataParam = searchParams.get('data');
    if (dataParam) {
      try {
        const decoded = JSON.parse(atob(dataParam));
        setLog(decoded);
      } catch (err) {
        console.error('Failed to parse audit log data:', err);
        setError('Invalid audit log data');
      }
    } else {
      setError('Audit log data not provided');
    }
    setLoading(false);
  }, [searchParams]);

  const getStatusColor = (status: AuditStatus) => {
    const colors = {
      SUCCESS: 'bg-green-100 text-green-800',
      FAILURE: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''} ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Audit Log Details</h1>
          <Button variant="ghost" onClick={() => router.push('/dashboard/audit-logs')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading audit log details...</p>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Audit Log Details</h1>
          <Button variant="ghost" onClick={() => router.push('/dashboard/audit-logs')}>
            <ArrowLeft className="mr-2 size-4" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">{error || 'Audit log not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/dashboard/audit-logs')}>
            Back to Audit Logs
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
          <h1 className="text-3xl font-bold tracking-tight">Audit Log Details</h1>
          <p className="text-muted-foreground mt-2">
            {log.action.replace(/_/g, ' ')}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/dashboard/audit-logs')}>
          <ArrowLeft className="mr-2 size-4" />
          Back to Audit Logs
        </Button>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(log.status)}`}>
          {log.status}
        </span>
        <span className="text-sm text-muted-foreground">
          {formatTimeAgo(log.createdAt)}
        </span>
      </div>

      {/* Audit Log Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Actor Information */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Actor Information</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{log.actor.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{log.actor.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{log.actor.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Entity Information */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Entity Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Entity Type</p>
              <p className="font-medium">{log.entityType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Entity ID</p>
              <p className="font-medium font-mono">{log.entityId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{log.description}</p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Metadata</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Timestamp</p>
                <p className="font-medium">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>
            {log.metadata?.ipAddress && (
              <div className="flex items-start gap-3">
                <Globe className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">IP Address</p>
                  <p className="font-medium">{log.metadata.ipAddress}</p>
                </div>
              </div>
            )}
            {log.metadata?.userAgent && (
              <div className="flex items-start gap-3">
                <Monitor className="size-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">User Agent</p>
                  <p className="font-medium text-xs truncate max-w-xs">{log.metadata.userAgent}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Changes */}
      {log.changes && (log.changes.before || log.changes.after) && (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Changes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {log.changes.before && (
              <div>
                <p className="text-sm font-medium mb-2">Before</p>
                <pre className="bg-accent p-4 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(log.changes.before, null, 2)}
                </pre>
              </div>
            )}
            {log.changes.after && (
              <div>
                <p className="text-sm font-medium mb-2">After</p>
                <pre className="bg-accent p-4 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(log.changes.after, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
