import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetHospital, 
  useUpdateHospital, 
  useGetHospitalInventory,
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
  getGetHospitalQueryKey,
  getGetHospitalInventoryQueryKey,
  InventoryInputResourceType,
  InventoryUpdateResourceType
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Phone, Activity, Power, PowerOff, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

export default function HospitalDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hospital, isLoading: loadingHospital } = useGetHospital(id, { query: { enabled: !!id, queryKey: getGetHospitalQueryKey(id) } });
  const { data: inventory, isLoading: loadingInventory } = useGetHospitalInventory(id, { query: { enabled: !!id, queryKey: getGetHospitalInventoryQueryKey(id) } });
  
  const updateHospital = useUpdateHospital();
  const createInventory = useCreateInventoryItem();
  const updateInventory = useUpdateInventoryItem();
  const deleteInventory = useDeleteInventoryItem();

  const [isAddingResource, setIsAddingResource] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
  const [newResource, setNewResource] = useState({ type: "ICU" as InventoryInputResourceType, quantity: 0 });

  const toggleStatus = () => {
    if (!hospital) return;
    updateHospital.mutate({
      id,
      data: { is_active: !hospital.is_active }
    }, {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetHospitalQueryKey(id), data);
        toast({ title: "Status Updated", description: `Facility is now ${data.is_active ? 'ONLINE' : 'OFFLINE'}` });
      }
    });
  };

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateHospital.mutate({
      id,
      data: { name: editForm.name, phone: editForm.phone, address: editForm.address }
    }, {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetHospitalQueryKey(id), data);
        setIsEditingProfile(false);
        toast({ title: "Profile Updated" });
      }
    });
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    createInventory.mutate({
      data: {
        hospital_id: id,
        resource_type: newResource.type,
        quantity: newResource.quantity
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetHospitalInventoryQueryKey(id) });
        setIsAddingResource(false);
        setNewResource({ type: "ICU", quantity: 0 });
        toast({ title: "Resource Added", description: "Inventory successfully updated." });
      }
    });
  };

  const handleUpdateQuantity = (itemId: number, type: InventoryUpdateResourceType, qty: number) => {
    updateInventory.mutate({
      id: itemId,
      data: { quantity: qty, resource_type: type }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetHospitalInventoryQueryKey(id) });
        toast({ title: "Quantity Updated" });
      }
    });
  };

  const handleDeleteItem = (itemId: number) => {
    if (!confirm("Remove this resource tracker completely?")) return;
    deleteInventory.mutate({ id: itemId }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetHospitalInventoryQueryKey(id) });
        toast({ title: "Resource Removed" });
      }
    });
  };

  if (loadingHospital) {
    return <div className="text-center py-12">Loading facility profile...</div>;
  }

  if (!hospital) {
    return <div className="text-center py-12">Facility not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hospitals" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{hospital.name}</h1>
            {hospital.is_active ? (
              <Badge variant="success">ONLINE</Badge>
            ) : (
              <Badge variant="secondary">OFFLINE</Badge>
            )}
          </div>
          <p className="text-muted-foreground font-mono text-sm mt-1">NODE-{hospital.id.toString().padStart(4, '0')} • {hospital.type.toUpperCase()}</p>
        </div>
        <Button 
          variant={hospital.is_active ? "outline" : "default"} 
          className={hospital.is_active ? "text-destructive border-destructive hover:bg-destructive/10" : ""}
          onClick={toggleStatus}
          disabled={updateHospital.isPending}
        >
          {hospital.is_active ? <><PowerOff className="w-4 h-4 mr-2" /> Take Offline</> : <><Power className="w-4 h-4 mr-2" /> Bring Online</>}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => {
                setEditForm({ name: hospital.name, phone: hospital.phone, address: hospital.address || "" });
                setIsEditingProfile(true);
              }}>Edit</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <Label className="text-xs">Emergency Dispatch</Label>
                <div className="font-mono mt-0.5">{hospital.phone}</div>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <Label className="text-xs">Location</Label>
                <div className="text-sm mt-0.5">{hospital.address || "No physical address provided"}</div>
                <div className="font-mono text-xs text-muted-foreground mt-1">
                  LAT: {hospital.lat.toFixed(6)}<br/>
                  LNG: {hospital.lng.toFixed(6)}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Activity className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <Label className="text-xs">Registered</Label>
                <div className="font-mono text-xs mt-0.5">{formatDate(hospital.created_at)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Live Inventory</CardTitle>
              <CardDescription>Tracked resources for this facility</CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsAddingResource(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Resource
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[150px]">Quantity</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingInventory && (
                  <TableRow><TableCell colSpan={4} className="text-center py-4 text-muted-foreground">Loading inventory...</TableCell></TableRow>
                )}
                {inventory?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">{item.resource_type}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {formatDate(item.last_updated)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input 
                          type="number" 
                          className="h-8 w-20 font-mono text-right" 
                          defaultValue={item.quantity}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val !== item.quantity) {
                              handleUpdateQuantity(item.id, item.resource_type as InventoryUpdateResourceType, val);
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {inventory?.length === 0 && (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No resources tracked for this facility.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddingResource} onOpenChange={setIsAddingResource}>
        <DialogContent>
          <form onSubmit={handleAddResource}>
            <DialogHeader>
              <DialogTitle>Add Resource Tracker</DialogTitle>
              <DialogDescription>Start tracking a new inventory item for {hospital.name}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resource_type" className="text-right">Type</Label>
                <Select 
                  id="resource_type"
                  className="col-span-3 font-mono"
                  value={newResource.type}
                  onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as InventoryInputResourceType }))}
                >
                  <option value="ICU">ICU</option>
                  <option value="GENERAL_BED">GENERAL_BED</option>
                  <option value="BLOOD_A_POS">BLOOD_A_POS</option>
                  <option value="BLOOD_A_NEG">BLOOD_A_NEG</option>
                  <option value="BLOOD_B_POS">BLOOD_B_POS</option>
                  <option value="BLOOD_B_NEG">BLOOD_B_NEG</option>
                  <option value="BLOOD_AB_POS">BLOOD_AB_POS</option>
                  <option value="BLOOD_AB_NEG">BLOOD_AB_NEG</option>
                  <option value="BLOOD_O_POS">BLOOD_O_POS</option>
                  <option value="BLOOD_O_NEG">BLOOD_O_NEG</option>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">Initial Qty</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="0"
                  className="col-span-3 font-mono"
                  value={newResource.quantity}
                  onChange={(e) => setNewResource(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 0 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddingResource(false)}>Cancel</Button>
              <Button type="submit" disabled={createInventory.isPending}>Add Tracker</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent>
          <form onSubmit={handleEditProfile}>
            <DialogHeader>
              <DialogTitle>Edit Facility Profile</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_name" className="text-right">Name</Label>
                <Input id="edit_name" className="col-span-3" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_phone" className="text-right">Phone</Label>
                <Input id="edit_phone" className="col-span-3" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit_address" className="text-right">Address</Label>
                <Input id="edit_address" className="col-span-3" value={editForm.address} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
              <Button type="submit" disabled={updateHospital.isPending}>Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
