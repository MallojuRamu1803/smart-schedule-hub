import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Loader2, Clock, CheckCircle2, Coffee } from 'lucide-react';
import type { TimeSlot, WorkingDay } from '@/lib/types';

const TimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [loading, setLoading] = useState(true);

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
              <CardTitle className="font-display flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Time Slots
              </CardTitle>
              <CardDescription>Daily schedule time periods</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((slot, index) => (
                    <TableRow key={slot.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
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
