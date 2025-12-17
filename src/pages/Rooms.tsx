import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, DoorOpen, Loader2, FlaskConical } from 'lucide-react';
import type { Classroom } from '@/lib/types';
import { z } from 'zod';

const roomSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  is_lab: z.boolean(),
});

const Rooms = () => {
  const [rooms, setRooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState({ name: '', capacity: 60, is_lab: false });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .order('name');

    if (error) toast.error('Failed to load rooms');
    else setRooms(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      roomSchema.parse(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach(e => {
          if (e.path[0]) fieldErrors[e.path[0] as string] = e.message;
        });
        setErrors(fieldErrors);
        return;
      }
    }

    setSaving(true);

    if (editingRoom) {
      const { error } = await supabase
        .from('classrooms')
        .update(formData)
        .eq('id', editingRoom.id);

      if (error) toast.error(error.message || 'Failed to update room');
      else {
        toast.success('Room updated successfully');
        setDialogOpen(false);
        fetchRooms();
      }
    } else {
      const { error } = await supabase.from('classrooms').insert(formData);

      if (error) {
        if (error.message.includes('duplicate')) toast.error('A room with this name already exists');
        else toast.error(error.message || 'Failed to create room');
      } else {
        toast.success('Room created successfully');
        setDialogOpen(false);
        fetchRooms();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    const { error } = await supabase.from('classrooms').delete().eq('id', id);
    if (error) toast.error('Failed to delete room');
    else {
      toast.success('Room deleted successfully');
      fetchRooms();
    }
  };

  const openEditDialog = (room: Classroom) => {
    setEditingRoom(room);
    setFormData({ name: room.name, capacity: room.capacity, is_lab: room.is_lab });
    setErrors({});
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingRoom(null);
    setFormData({ name: '', capacity: 60, is_lab: false });
    setErrors({});
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Rooms & Labs</h1>
            <p className="text-muted-foreground">Manage classrooms and laboratories</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                <DialogDescription>
                  {editingRoom ? 'Update room details' : 'Add a new classroom or lab'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Room Name/Number</Label>
                  <Input
                    id="name"
                    placeholder="Room 101 or Lab A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  />
                  {errors.capacity && <p className="text-xs text-destructive">{errors.capacity}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_lab"
                    checked={formData.is_lab}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_lab: checked as boolean })}
                  />
                  <Label htmlFor="is_lab" className="cursor-pointer">This is a laboratory</Label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingRoom ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-12">
                <DoorOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-1">No rooms yet</h3>
                <p className="text-muted-foreground text-sm">Add classrooms and labs to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.name}</TableCell>
                      <TableCell>
                        {room.is_lab ? (
                          <span className="px-2 py-1 bg-lab/10 text-lab rounded text-xs font-medium inline-flex items-center gap-1">
                            <FlaskConical className="w-3 h-3" />
                            Lab
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            Classroom
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{room.capacity} seats</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(room)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(room.id)} className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Rooms;
