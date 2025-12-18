import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Calendar, Check, X, Save } from 'lucide-react';
import type { Faculty, TimeSlot, WorkingDay, FacultyAvailability } from '@/lib/types';

const FacultyAvailabilityPage = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [availability, setAvailability] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchBaseData = async () => {
    const [facultyRes, slotsRes, daysRes] = await Promise.all([
      supabase.from('faculty').select('*').order('name'),
      supabase.from('time_slots').select('*').order('slot_order'),
      supabase.from('working_days').select('*').order('day_order'),
    ]);

    if (!facultyRes.error) setFaculty(facultyRes.data || []);
    if (!slotsRes.error) setTimeSlots((slotsRes.data || []).filter(s => !s.is_break));
    if (!daysRes.error) setWorkingDays((daysRes.data || []).filter(d => d.is_active));
    setLoading(false);
  };

  const fetchAvailability = async (facultyId: string) => {
    const { data, error } = await supabase
      .from('faculty_availability')
      .select('*')
      .eq('faculty_id', facultyId);

    if (error) {
      toast.error('Failed to load availability');
      return;
    }

    const availMap = new Map<string, boolean>();
    // Default all to available
    workingDays.forEach(day => {
      timeSlots.forEach(slot => {
        availMap.set(`${day.id}-${slot.id}`, true);
      });
    });

    // Apply saved availability
    data?.forEach(a => {
      availMap.set(`${a.working_day_id}-${a.time_slot_id}`, a.is_available);
    });

    setAvailability(availMap);
    setHasChanges(false);
  };

  useEffect(() => {
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (selectedFaculty && workingDays.length > 0 && timeSlots.length > 0) {
      fetchAvailability(selectedFaculty);
    }
  }, [selectedFaculty, workingDays.length, timeSlots.length]);

  const toggleAvailability = (dayId: string, slotId: string) => {
    const key = `${dayId}-${slotId}`;
    const newAvail = new Map(availability);
    newAvail.set(key, !newAvail.get(key));
    setAvailability(newAvail);
    setHasChanges(true);
  };

  const setAllForDay = (dayId: string, available: boolean) => {
    const newAvail = new Map(availability);
    timeSlots.forEach(slot => {
      newAvail.set(`${dayId}-${slot.id}`, available);
    });
    setAvailability(newAvail);
    setHasChanges(true);
  };

  const setAllForSlot = (slotId: string, available: boolean) => {
    const newAvail = new Map(availability);
    workingDays.forEach(day => {
      newAvail.set(`${day.id}-${slotId}`, available);
    });
    setAvailability(newAvail);
    setHasChanges(true);
  };

  const saveAvailability = async () => {
    if (!selectedFaculty) return;
    setSaving(true);

    // Delete existing records for this faculty
    await supabase
      .from('faculty_availability')
      .delete()
      .eq('faculty_id', selectedFaculty);

    // Insert new records
    const records: { faculty_id: string; working_day_id: string; time_slot_id: string; is_available: boolean }[] = [];
    availability.forEach((isAvailable, key) => {
      const [dayId, slotId] = key.split('-');
      records.push({
        faculty_id: selectedFaculty,
        working_day_id: dayId,
        time_slot_id: slotId,
        is_available: isAvailable,
      });
    });

    const { error } = await supabase.from('faculty_availability').insert(records);

    if (error) {
      toast.error('Failed to save availability');
    } else {
      toast.success('Availability saved successfully');
      setHasChanges(false);
    }
    setSaving(false);
  };

  const selectedFacultyName = faculty.find(f => f.id === selectedFaculty)?.name;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Faculty Availability</h1>
            <p className="text-muted-foreground">Set when each faculty member is available for teaching</p>
          </div>
          {hasChanges && (
            <Button variant="gradient" onClick={saveAvailability} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Select Faculty
            </CardTitle>
            <CardDescription>Choose a faculty member to manage their availability</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select a faculty member" />
              </SelectTrigger>
              <SelectContent>
                {faculty.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedFaculty && workingDays.length > 0 && timeSlots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="font-display">
                Availability Matrix for {selectedFacultyName}
              </CardTitle>
              <CardDescription>
                Click cells to toggle availability. Green = Available, Red = Unavailable
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border border-border bg-muted/50 min-w-[100px]">
                      Day / Time
                    </th>
                    {timeSlots.map((slot) => (
                      <th key={slot.id} className="p-2 border border-border bg-muted/50 min-w-[80px]">
                        <div className="text-xs font-medium">{slot.start_time}</div>
                        <div className="text-xs text-muted-foreground">{slot.end_time}</div>
                        <div className="flex gap-1 mt-1 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 hover:bg-lab/20"
                            onClick={() => setAllForSlot(slot.id, true)}
                            title="Mark all available"
                          >
                            <Check className="h-3 w-3 text-lab" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 hover:bg-destructive/20"
                            onClick={() => setAllForSlot(slot.id, false)}
                            title="Mark all unavailable"
                          >
                            <X className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workingDays.map((day) => (
                    <tr key={day.id}>
                      <td className="p-2 border border-border bg-muted/30 font-medium">
                        <div className="flex items-center justify-between gap-2">
                          <span>{day.day_name}</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 hover:bg-lab/20"
                              onClick={() => setAllForDay(day.id, true)}
                              title="Mark all available"
                            >
                              <Check className="h-3 w-3 text-lab" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 hover:bg-destructive/20"
                              onClick={() => setAllForDay(day.id, false)}
                              title="Mark all unavailable"
                            >
                              <X className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </td>
                      {timeSlots.map((slot) => {
                        const key = `${day.id}-${slot.id}`;
                        const isAvailable = availability.get(key) ?? true;
                        return (
                          <td
                            key={slot.id}
                            className={`p-2 border border-border cursor-pointer transition-colors ${
                              isAvailable
                                ? 'bg-lab/20 hover:bg-lab/30'
                                : 'bg-destructive/20 hover:bg-destructive/30'
                            }`}
                            onClick={() => toggleAvailability(day.id, slot.id)}
                          >
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={isAvailable}
                                className={isAvailable ? 'border-lab data-[state=checked]:bg-lab' : 'border-destructive'}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {selectedFaculty && (workingDays.length === 0 || timeSlots.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Please configure working days and time slots first in the Time Slots page.
              </p>
            </CardContent>
          </Card>
        )}

        {!selectedFaculty && faculty.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-lg mb-1">No faculty members</h3>
              <p className="text-muted-foreground text-sm">Add faculty members first to manage their availability</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyAvailabilityPage;
