import { Button } from '../../../components/ui/button';
import { Plus, Search } from 'lucide-react';

export default function AssetsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className ="text-3xl font-bold tracking-tight">Assets</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your assets
          </p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          Add Asset
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search assets..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      {/* Assets Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">All Assets</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No assets found</p>
            <Button variant="outline" className="mt-4">
              <Plus className="mr-2 size-4" />
              Add your first asset
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
