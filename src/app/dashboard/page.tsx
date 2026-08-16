'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Package, Users, TrendingUp, Loader2, Cpu, FileText, CheckCircle, Clock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { dashboardApi, DashboardStats } from '../../api/dashboard';
import { auditLogsApi, AuditLog, AuditStatus } from '../../api/audit-logs';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, auditData] = await Promise.all([
          dashboardApi.getStats(),
          auditLogsApi.getAll({ limit: 5, page: 1 }).catch(() => ({ logs: [], pagination: { total: 0 } }))
        ]);
        setStats(statsData);
        setAuditLogs(auditData.logs || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const statsCards = stats ? [
    {
      name: 'Total Assets',
      value: stats.assets.total.toLocaleString(),
      change: '+12.5%',
      icon: Package,
    },
    {
      name: 'Hardware',
      value: stats.assets.hardware.toLocaleString(),
      change: '+8.1%',
      icon: Cpu,
    },
    {
      name: 'Software Licenses',
      value: stats.assets.softwareLicense.toLocaleString(),
      change: '+5.2%',
      icon: FileText,
    },
    {
      name: 'Assigned Assets',
      value: stats.assets.byStatus.assigned.toLocaleString(),
      change: '+3.4%',
      icon: CheckCircle,
    },
    {
      name: 'Employees',
      value: stats.employees.total.toLocaleString(),
      change: '+2.1%',
      icon: Users,
    },
    {
      name: 'Available Assets',
      value: stats.assets.byStatus.available.toLocaleString(),
      change: '+1.8%',
      icon: LayoutDashboard,
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here's an overview of your assets.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-card p-6 shadow-sm flex items-center justify-center"
            >
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <p className="text-destructive">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((stat) => (
            <div
              key={stat.name}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <stat.icon className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <button
            onClick={() => router.push('/dashboard/audit-logs')}
            className="text-sm text-primary hover:underline"
          >
            View All
          </button>
        </div>
        <div className="p-6">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="size-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div
                  key={log._id}
                  onClick={() => {
                    const encoded = btoa(JSON.stringify(log));
                    router.push(`/dashboard/audit-logs/${log._id}?data=${encoded}`);
                  }}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 rounded px-2 -mx-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      log.status === 'SUCCESS' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {log.status === 'SUCCESS' ? (
                        <CheckCircle2 className="size-5 text-green-600" />
                      ) : (
                        <AlertCircle className="size-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{log.description}</p>
                      <p className="text-xs text-muted-foreground">
                        by {log.actor.name} • {formatTimeAgo(log.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      log.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
