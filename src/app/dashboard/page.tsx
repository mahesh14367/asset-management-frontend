'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, TrendingUp, Loader2 } from 'lucide-react';
import { dashboardApi, DashboardStats } from '../../api/dashboard';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsCards = stats ? [
    {
      name: 'Total Assets',
      value: stats.assets.total.toLocaleString(),
      change: '+12.5%',
      icon: Package,
    },
    {
      name: 'Active Employees',
      value: stats.employees.active.toLocaleString(),
      change: '+5.2%',
      icon: Users,
    },
    {
      name: 'Active Assignments',
      value: (stats.assignments.activeHardware + stats.assignments.activeLicenseSeats).toLocaleString(),
      change: '+8.1%',
      icon: TrendingUp,
    },
    {
      name: 'Available Assets',
      value: stats.assets.byStatus.available.toLocaleString(),
      change: '+2.3%',
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Asset #{1000 + i} updated</p>
                    <p className="text-xs text-muted-foreground">
                      {i} hour{i > 1 ? 's' : ''} ago
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">View</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
