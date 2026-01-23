import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Clock, CheckCircle2, Coffee, Plus, Pencil, Trash2 } from 'lucide-react';
import type { TimeSlot, WorkingDay } from '@/lib/types';
import { z } from 'zod';

const timeSlotSchema = z.object({
  start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  slot_order: z.number().min(1, 'Order must be at least 1'),
  is_break: z.boolean(),
  break_name: z.string().optional().nullable(),
}).refine((data) => {
  if (data.is_break && !data.break_name) {
    return false;
  }
  return true;
}, {
  message: 'Break name is required for breaks',
  path: ['break_name'],
});

const TimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    start_time: '09:00',
    end_time: '09:50',
    slot_order: 1,
    is_break: false,
    break_name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [slotsRes, daysRes] = await Promise.all([
      supabase.from('time_slots').select('*').order('slot_order'),
      supabase.from('working_days').select('*').order('day_order'),
    ]);

    if (!slotsRes.error) setTimeSlots(slotsRes.data || []);
    if (!daysRes.error) setWorkingDays(daysRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleWorkingDay = async (day: WorkingDay) => {
    const { error } = await supabase
      .from('working_days')
      .update({ is_active: !day.is_active })
      .eq('id', day.id);

    if (error) {
      toast.error('Failed to update working day');
    } else {
      toast.success(`${day.day_name} ${!day.is_active ? 'enabled' : 'disabled'}`);
      fetchData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const dataToValidate = {
      ...formData,
      break_name: formData.is_break ? formData.break_name : null,
    };

    try {
      timeSlotSchema.parse(dataToValidate);
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

    const submitData = {
      start_time: formData.start_time,
      end_time: formData.end_time,
      slot_order: formData.slot_order,
      is_break: formData.is_break,
      break_name: formData.is_break ? formData.break_name : null,
    };

    if (editingSlot) {
      const { error } = await supabase
        .from('time_slots')
        .update(submitData)
        .eq('id', editingSlot.id);

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          toast.error('A time slot with these times already exists');
        } else {
          toast.error(error.message || 'Failed to update time slot');
        }
      } else {
        toast.success('Time slot updated successfully');
        setDialogOpen(false);
        fetchData();
      }
    } else {
      const { error } = await supabase.from('time_slots').insert(submitData);

      if (error) {
        if (error.message.includes('duplicate') || error.message.includes('unique')) {
          toast.error('A time slot with these times already exists');
        } else {
          toast.error(error.message || 'Failed to create time slot');
        }
      } else {
        toast.success('Time slot created successfully');
        setDialogOpen(false);
        fetchData();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this time slot? This may affect existing timetables.')) return;

    const { error } = await supabase.from('time_slots').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete time slot');
    } else {
      toast.success('Time slot deleted successfully');
      fetchData();
    }
  };

  const openEditDialog = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormData({
      start_time: slot.start_time,
      end_time: slot.end_time,
      slot_order: slot.slot_order,
      is_break: slot.is_break,
      break_name: slot.break_name || '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    const maxOrder = timeSlots.length > 0 ? Math.max(...timeSlots.map(s => s.slot_order)) : 0;
    setEditingSlot(null);
    setFormData({
      start_time: '09:00',
      end_time: '09:50',
      slot_order: maxOrder + 1,
      is_break: false,
      break_name: '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Time Slots & Schedule</h1>
          <p className="text-muted-foreground">Configure working days and time slots</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Working Days */}
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Working Days
              </CardTitle>
              <CardDescription>Enable or disable days for scheduling</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workingDays.map((day) => (
                  <div
                    key={day.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${day.is_active ? 'bg-lab' : 'bg-muted-foreground/30'}`} />
                      <span className="font-medium">{day.day_name}</span>
                    </div>
                    <Switch
                      checked={day.is_active}
                      onCheckedChange={() => toggleWorkingDay(day)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Time Slots
                  </CardTitle>
                  <CardDescription>Daily schedule time periods</CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="gradient" size="sm" onClick={openNewDialog}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slot
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}</DialogTitle>
                      <DialogDescription>
                        {editingSlot ? 'Update time slot details' : 'Add a new time slot to the schedule'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_time">Start Time</Label>
                          <Input
                            id="start_time"
                            type="time"
                            value={formData.start_time}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            required
                          />
                          {errors.start_time && <p className="text-xs text-destructive">{errors.start_time}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_time">End Time</Label>
                          <Input
                            id="end_time"
                            type="time"
                            value={formData.end_time}
                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                            required
                          />
                          {errors.end_time && <p className="text-xs text-destructive">{errors.end_time}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slot_order">Order</Label>
                        <Input
                          id="slot_order"
                          type="number"
                          min={1}
                          value={formData.slot_order}
                          onChange={(e) => setFormData({ ...formData, slot_order: parseInt(e.target.value) || 1 })}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Order in which this slot appears (1, 2, 3...)</p>
                        {errors.slot_order && <p className="text-xs text-destructive">{errors.slot_order}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_break"
                          checked={formData.is_break}
                          onCheckedChange={(checked) => {
                            setFormData({ 
                              ...formData, 
                              is_break: checked as boolean,
                              break_name: checked ? formData.break_name : ''
                            });
                          }}
                        />
                        <Label htmlFor="is_break" className="cursor-pointer">This is a break</Label>
                      </div>
                      {formData.is_break && (
                        <div className="space-y-2">
                          <Label htmlFor="break_name">Break Name</Label>
                          <Input
                            id="break_name"
                            placeholder="Short Break, Lunch Break, etc."
                            value={formData.break_name}
                            onChange={(e) => setFormData({ ...formData, break_name: e.target.value })}
                            required
                          />
                          {errors.break_name && <p className="text-xs text-destructive">{errors.break_name}</p>}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" variant="gradient" disabled={saving}>
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSlot ? 'Update' : 'Create'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((slot, index) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{slot.slot_order}</TableCell>
                      <TableCell>{slot.start_time}</TableCell>
                      <TableCell>{slot.end_time}</TableCell>
                      <TableCell>
                        {slot.is_break ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-break/10 text-break rounded text-xs font-medium">
                            <Coffee className="w-3 h-3" />
                            {slot.break_name}
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            Class Period
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(slot)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(slot.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Visual Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display">Daily Schedule Overview</CardTitle>
            <CardDescription>Visual representation of the day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1 overflow-x-auto pb-2">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex-shrink-0 rounded-lg p-3 min-w-[100px] text-center ${
                    slot.is_break
                      ? 'bg-break/10 border border-break/20'
                      : 'bg-primary/10 border border-primary/20'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">
                    {slot.start_time}
                  </div>
                  <div className={`text-xs ${slot.is_break ? 'text-break' : 'text-primary'}`}>
                    {slot.is_break ? slot.break_name : 'Class'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {slot.end_time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TimeSlots;
