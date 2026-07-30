const fs = require('fs');

let content = fs.readFileSync('artifacts/medlink-hospital/src/pages/hospitals/detail.tsx', 'utf8');

// We need to add state for edit dialog
content = content.replace('const [isAddingResource, setIsAddingResource] = useState(false);', 
`const [isAddingResource, setIsAddingResource] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });`);

// We need to update the edit form when hospital loads
content = content.replace('const handleAddResource = (e: React.FormEvent) => {', 
`const handleEditProfile = (e: React.FormEvent) => {
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

  const handleAddResource = (e: React.FormEvent) => {`);

// Add the Edit button
content = content.replace('<CardTitle>Profile</CardTitle>', 
`<div className="flex items-center justify-between">
              <CardTitle>Profile</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => {
                setEditForm({ name: hospital.name, phone: hospital.phone, address: hospital.address || "" });
                setIsEditingProfile(true);
              }}>Edit</Button>
            </div>`);

// Add the Edit Dialog
const editDialog = `
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
`;

content = content.replace('</DialogContent>\n      </Dialog>', `</DialogContent>\n      </Dialog>\n${editDialog}`);

fs.writeFileSync('artifacts/medlink-hospital/src/pages/hospitals/detail.tsx', content);
