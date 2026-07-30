import { useState } from "react";
import { Link } from "wouter";
import { useListInventory } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";

export default function InventoryOverview() {
  const { data: inventory, isLoading } = useListInventory();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const filtered = inventory?.filter(item => {
    const matchesSearch = item.hospital_name?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || item.resource_type === typeFilter;
    return matchesSearch && matchesType;
  })?.sort((a, b) => b.quantity - a.quantity);

  const resourceTypes = Array.from(new Set(inventory?.map(i => i.resource_type) || []));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Inventory</h1>
        <p className="text-muted-foreground mt-1">Real-time resource allocation across all registered facilities.</p>
      </div>

      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by facility name..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select 
                className="w-full sm:w-[200px] font-mono"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="ALL">ALL_RESOURCES</option>
                {resourceTypes.map(rt => (
                  <option key={rt} value={rt}>{rt}</option>
                ))}
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="pl-6">Facility</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right pr-6">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    Querying network databases...
                  </TableCell>
                </TableRow>
              )}
              {filtered?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="pl-6">
                    <Link href={`/hospitals/${item.hospital_id}`} className="font-semibold hover:text-primary transition-colors">
                      {item.hospital_name || `Unknown (ID: ${item.hospital_id})`}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{item.resource_type}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-mono text-lg ${item.quantity === 0 ? 'text-destructive font-bold' : ''}`}>
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6 text-xs text-muted-foreground font-mono">
                    {formatDate(item.last_updated)}
                  </TableCell>
                </TableRow>
              ))}
              {filtered?.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    No resources matched the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
