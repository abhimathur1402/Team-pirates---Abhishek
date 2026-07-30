import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateHospital, HospitalInputType } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function NewHospital() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createHospital = useCreateHospital();

  const [formData, setFormData] = useState({
    name: "",
    type: "general" as HospitalInputType,
    phone: "",
    address: "",
    lat: "0",
    lng: "0"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Validation Error",
        description: "Name and Phone are required fields.",
        variant: "destructive"
      });
      return;
    }

    createHospital.mutate(
      { 
        data: {
          name: formData.name,
          type: formData.type,
          phone: formData.phone,
          address: formData.address,
          lat: parseFloat(formData.lat) || 0,
          lng: parseFloat(formData.lng) || 0
        }
      },
      {
        onSuccess: (hospital) => {
          toast({
            title: "Facility Registered",
            description: `${hospital.name} has been added to the network.`,
          });
          setLocation(`/hospitals/${hospital.id}`);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to register facility. Check inputs and try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Register Facility</h1>
        <p className="text-muted-foreground mt-1">Add a new hospital node to the emergency network.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Facility Details</CardTitle>
            <CardDescription>Enter verified contact and location data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Facility Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. Memorial General Hospital"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Facility Type</Label>
                <Select 
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as HospitalInputType }))}
                >
                  <option value="general">General</option>
                  <option value="trauma">Trauma Center</option>
                  <option value="specialty">Specialty</option>
                  <option value="children">Children's</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Emergency Contact</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Physical Address</Label>
              <Input 
                id="address" 
                placeholder="123 Medical Way, City, ST 12345"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-md border border-border/50">
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Coordinates (for emergency routing)</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lat" className="text-xs">Latitude</Label>
                <Input 
                  id="lat" 
                  type="number"
                  step="any"
                  placeholder="0.000000"
                  className="font-mono"
                  value={formData.lat}
                  onChange={(e) => setFormData(prev => ({ ...prev, lat: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng" className="text-xs">Longitude</Label>
                <Input 
                  id="lng" 
                  type="number"
                  step="any"
                  placeholder="0.000000"
                  className="font-mono"
                  value={formData.lng}
                  onChange={(e) => setFormData(prev => ({ ...prev, lng: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6">
            <Button type="button" variant="ghost" onClick={() => setLocation("/hospitals")}>
              Cancel
            </Button>
            <Button type="submit" disabled={createHospital.isPending}>
              {createHospital.isPending ? "Registering..." : "Register Facility"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
