import { LayoutDashboard, Package, Users, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      name: 'Total Assets',
      value: '1,234',
      change: '+12.5%',
      icon: Package,
    },
    {
      name: 'Active Users',
      value: '89',
      change: '+5.2%',
      icon: Users,
    },
    {
      name: 'Asset Value',
      value: '$2.4M',
      change: '+8.1%',
      icon: TrendingUp,
    },
    {
      name: 'Utilization',
      value: '78%',
      change: '+2.3%',
      icon: LayoutDashboard,
    },
  ];

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
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
