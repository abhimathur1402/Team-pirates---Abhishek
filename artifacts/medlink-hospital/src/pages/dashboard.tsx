import { Activity, AlertTriangle, Building, Droplets } from "lucide-react";
import { useGetDashboardStats, useGetInventoryActivity } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: activity, isLoading: activityLoading } = useGetInventoryActivity();

  if (statsLoading || activityLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50 rounded-t-md border-b-0" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-muted-foreground mt-1">Live overview of network resources and facility status.</p>
        </div>
        {stats.low_stock_alerts > 0 && (
          <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-4 py-2 rounded-md border border-destructive/20">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold">{stats.low_stock_alerts} CRITICAL ALERTS</span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Active Facilities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.active_hospitals} <span className="text-sm font-sans text-muted-foreground font-normal">/ {stats.total_hospitals}</span></div>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Nodes Online</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">ICU Capacity</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono text-primary">{stats.total_icu_beds}</div>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Available Units</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">General Wards</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.total_general_beds}</div>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Available Units</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Blood Supply</CardTitle>
            <Droplets className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-mono">{stats.total_blood_units}</div>
            <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">Pints Logged</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Distribution</CardTitle>
            <CardDescription>Global resources by type</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead className="text-right">Total Quantity</TableHead>
                  <TableHead className="text-right">Providers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.inventory_by_type.map((item) => (
                  <TableRow key={item.resource_type}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="font-mono">{item.resource_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.total_quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground font-mono">{item.hospital_count}</TableCell>
                  </TableRow>
                ))}
                {stats.inventory_by_type.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      No inventory logged in the system.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Network Activity</CardTitle>
            <CardDescription>Latest inventory changes across facilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity?.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between border-b border-border/50 pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">{entry.hospital_name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] py-0">{entry.resource_type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {entry.action === 'created' ? 'logged' : entry.action === 'deleted' ? 'removed' : 'updated to'} <span className="font-mono font-bold text-foreground">{entry.quantity}</span> units
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                    {formatDate(entry.timestamp)}
                  </div>
                </div>
              ))}
              {(!activity || activity.length === 0) && (
                <div className="text-center py-6 text-muted-foreground">
                  No recent activity.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
