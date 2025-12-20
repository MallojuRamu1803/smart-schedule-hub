import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, DoorOpen, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Faculty, Classroom, TimetableEntry, WorkingDay, TimeSlot } from '@/lib/types';

interface FacultyWorkload {
  faculty: Faculty;
  hoursPerWeek: number;
  maxHours: number;
  utilizationPercent: number;
  daysActive: number;
}

interface RoomUtilization {
  room: Classroom;
  hoursUsed: number;
  totalSlots: number;
  utilizationPercent: number;
}

interface ConflictInfo {
  type: 'faculty' | 'room' | 'section';
  description: string;
  severity: 'warning' | 'error';
  dayName: string;
  slotTime: string;
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [facultyWorkloads, setFacultyWorkloads] = useState<FacultyWorkload[]>([]);
  const [roomUtilizations, setRoomUtilizations] = useState<RoomUtilization[]>([]);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [activeTimetableId, setActiveTimetableId] = useState<string | null>(null);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    // Get active timetable
    const { data: activeTimetable } = await supabase
      .from('timetables')
      .select('id')
      .eq('is_active', true)
      .single();

    if (!activeTimetable) {
      // Get the most recent timetable
      const { data: recentTimetable } = await supabase
        .from('timetables')
        .select('id')
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (recentTimetable) {
        setActiveTimetableId(recentTimetable.id);
      }
    } else {
      setActiveTimetableId(activeTimetable.id);
    }

    const timetableId = activeTimetable?.id || (await supabase
      .from('timetables')
      .select('id')
      .order('generated_at', { ascending: false })
      .limit(1)
      .single()).data?.id;

    if (!timetableId) {
      setLoading(false);
      return;
    }

    // Fetch all required data
    const [entriesRes, facultyRes, roomsRes, daysRes, slotsRes] = await Promise.all([
      supabase.from('timetable_entries').select(`
        *,
        faculty:faculty(*),
        classroom:classrooms(*),
        section:sections(*),
        working_day:working_days(*),
        time_slot:time_slots(*)
      `).eq('timetable_id', timetableId),
      supabase.from('faculty').select('*, department:departments(*)'),
      supabase.from('classrooms').select('*'),
      supabase.from('working_days').select('*').eq('is_active', true).order('day_order'),
      supabase.from('time_slots').select('*').eq('is_break', false).order('slot_order'),
    ]);

    const entries = (entriesRes.data || []) as TimetableEntry[];
    const faculty = facultyRes.data || [];
    const rooms = roomsRes.data || [];
    const days = daysRes.data || [];
    const slots = slotsRes.data || [];

    setWorkingDays(days);
    setTimeSlots(slots);

    // Calculate faculty workload
    const maxWeeklyHours = days.length * slots.length;
    const workloads: FacultyWorkload[] = faculty.map(f => {
      const facultyEntries = entries.filter(e => e.faculty_id === f.id);
      const uniqueDays = new Set(facultyEntries.map(e => e.working_day_id)).size;
      
      return {
        faculty: f,
        hoursPerWeek: facultyEntries.length,
        maxHours: maxWeeklyHours,
        utilizationPercent: Math.round((facultyEntries.length / maxWeeklyHours) * 100),
        daysActive: uniqueDays,
      };
    }).sort((a, b) => b.utilizationPercent - a.utilizationPercent);

    setFacultyWorkloads(workloads);

    // Calculate room utilization
    const totalSlots = days.length * slots.length;
    const utilizations: RoomUtilization[] = rooms.map(r => {
      const roomEntries = entries.filter(e => e.classroom_id === r.id);
      
      return {
        room: r,
        hoursUsed: roomEntries.length,
        totalSlots,
        utilizationPercent: Math.round((roomEntries.length / totalSlots) * 100),
      };
    }).sort((a, b) => b.utilizationPercent - a.utilizationPercent);

    setRoomUtilizations(utilizations);

    // Detect conflicts
    const detectedConflicts: ConflictInfo[] = [];
    
    // Group entries by day and slot
    const slotMap = new Map<string, TimetableEntry[]>();
    entries.forEach(entry => {
      const key = `${entry.working_day_id}_${entry.time_slot_id}`;
      if (!slotMap.has(key)) {
        slotMap.set(key, []);
      }
      slotMap.get(key)!.push(entry);
    });

    // Check for conflicts in each slot
    slotMap.forEach((slotEntries, key) => {
      const dayId = key.split('_')[0];
      const slotId = key.split('_')[1];
      const day = days.find(d => d.id === dayId);
      const slot = slots.find(s => s.id === slotId);

      // Faculty conflicts
      const facultyCount = new Map<string, number>();
      slotEntries.forEach(e => {
        facultyCount.set(e.faculty_id, (facultyCount.get(e.faculty_id) || 0) + 1);
      });
      facultyCount.forEach((count, facultyId) => {
        if (count > 1) {
          const fac = faculty.find(f => f.id === facultyId);
          detectedConflicts.push({
            type: 'faculty',
            description: `${fac?.name || 'Unknown'} is double-booked`,
            severity: 'error',
            dayName: day?.day_name || '',
            slotTime: slot ? `${slot.start_time} - ${slot.end_time}` : '',
          });
        }
      });

      // Room conflicts
      const roomCount = new Map<string, number>();
      slotEntries.forEach(e => {
        roomCount.set(e.classroom_id, (roomCount.get(e.classroom_id) || 0) + 1);
      });
      roomCount.forEach((count, roomId) => {
        if (count > 1) {
          const rm = rooms.find(r => r.id === roomId);
          detectedConflicts.push({
            type: 'room',
            description: `Room ${rm?.name || 'Unknown'} has multiple classes`,
            severity: 'error',
            dayName: day?.day_name || '',
            slotTime: slot ? `${slot.start_time} - ${slot.end_time}` : '',
          });
        }
      });
    });

    setConflicts(detectedConflicts);
    setLoading(false);
  };

  const getWorkloadColor = (percent: number) => {
    if (percent >= 80) return 'text-destructive';
    if (percent >= 60) return 'text-warning';
    return 'text-lab';
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return 'bg-destructive';
    if (percent >= 60) return 'bg-warning';
    return 'bg-lab';
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

  const avgFacultyUtilization = facultyWorkloads.length > 0
    ? Math.round(facultyWorkloads.reduce((acc, f) => acc + f.utilizationPercent, 0) / facultyWorkloads.length)
    : 0;

  const avgRoomUtilization = roomUtilizations.length > 0
    ? Math.round(roomUtilizations.reduce((acc, r) => acc + r.utilizationPercent, 0) / roomUtilizations.length)
    : 0;

  const overloadedFaculty = facultyWorkloads.filter(f => f.utilizationPercent >= 80).length;
  const underutilizedRooms = roomUtilizations.filter(r => r.utilizationPercent < 30).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Workload distribution, room utilization, and conflict detection</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Faculty Load</p>
                  <p className={cn("text-3xl font-display font-bold", getWorkloadColor(avgFacultyUtilization))}>
                    {avgFacultyUtilization}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-secondary text-primary">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Room Usage</p>
                  <p className={cn("text-3xl font-display font-bold", getWorkloadColor(avgRoomUtilization))}>
                    {avgRoomUtilization}%
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-secondary text-accent">
                  <DoorOpen className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overloaded Faculty</p>
                  <p className={cn("text-3xl font-display font-bold", overloadedFaculty > 0 ? 'text-destructive' : 'text-lab')}>
                    {overloadedFaculty}
                  </p>
                </div>
                <div className={cn("p-3 rounded-xl", overloadedFaculty > 0 ? 'bg-destructive/10 text-destructive' : 'bg-lab/10 text-lab')}>
                  {overloadedFaculty > 0 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Conflicts</p>
                  <p className={cn("text-3xl font-display font-bold", conflicts.length > 0 ? 'text-destructive' : 'text-lab')}>
                    {conflicts.length}
                  </p>
                </div>
                <div className={cn("p-3 rounded-xl", conflicts.length > 0 ? 'bg-destructive/10 text-destructive' : 'bg-lab/10 text-lab')}>
                  {conflicts.length > 0 ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faculty" className="space-y-4">
          <TabsList>
            <TabsTrigger value="faculty">Faculty Workload</TabsTrigger>
            <TabsTrigger value="rooms">Room Utilization</TabsTrigger>
            <TabsTrigger value="conflicts">Conflict Detection</TabsTrigger>
          </TabsList>

          <TabsContent value="faculty">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Faculty Workload Distribution
                </CardTitle>
                <CardDescription>Hours scheduled per week for each faculty member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {facultyWorkloads.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No faculty data available</p>
                  ) : (
                    facultyWorkloads.map(fw => (
                      <div key={fw.faculty.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {fw.faculty.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{fw.faculty.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {fw.hoursPerWeek} hrs/week • {fw.daysActive} days active
                              </p>
                            </div>
                          </div>
                          <span className={cn("text-sm font-semibold", getWorkloadColor(fw.utilizationPercent))}>
                            {fw.utilizationPercent}%
                          </span>
                        </div>
                        <div className="relative">
                          <Progress value={fw.utilizationPercent} className="h-2" />
                          <div 
                            className={cn("absolute top-0 left-0 h-2 rounded-full transition-all", getProgressColor(fw.utilizationPercent))}
                            style={{ width: `${fw.utilizationPercent}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rooms">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-accent" />
                  Room Utilization Heatmap
                </CardTitle>
                <CardDescription>Usage percentage for each classroom and lab</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roomUtilizations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8 col-span-full">No room data available</p>
                  ) : (
                    roomUtilizations.map(ru => (
                      <Card key={ru.room.id} className={cn(
                        "border-2 transition-colors",
                        ru.utilizationPercent >= 80 ? "border-destructive/50 bg-destructive/5" :
                        ru.utilizationPercent >= 50 ? "border-warning/50 bg-warning/5" :
                        ru.utilizationPercent >= 30 ? "border-lab/50 bg-lab/5" :
                        "border-muted bg-muted/5"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <DoorOpen className={cn(
                                "w-5 h-5",
                                ru.room.is_lab ? "text-lab" : "text-primary"
                              )} />
                              <div>
                                <p className="font-medium">{ru.room.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {ru.room.is_lab ? 'Lab' : 'Classroom'} • {ru.room.capacity} seats
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{ru.hoursUsed}/{ru.totalSlots} slots</span>
                              <span className={cn("font-semibold", getWorkloadColor(ru.utilizationPercent))}>
                                {ru.utilizationPercent}%
                              </span>
                            </div>
                            <div className="relative">
                              <Progress value={ru.utilizationPercent} className="h-3" />
                              <div 
                                className={cn("absolute top-0 left-0 h-3 rounded-full transition-all", getProgressColor(ru.utilizationPercent))}
                                style={{ width: `${ru.utilizationPercent}%` }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conflicts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Conflict Detection
                </CardTitle>
                <CardDescription>Scheduling conflicts and warnings</CardDescription>
              </CardHeader>
              <CardContent>
                {conflicts.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-lab" />
                    <h3 className="font-medium text-lg mb-1">No Conflicts Detected</h3>
                    <p className="text-muted-foreground text-sm">
                      Your timetable is conflict-free!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conflicts.map((conflict, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border",
                          conflict.severity === 'error' 
                            ? "bg-destructive/5 border-destructive/30" 
                            : "bg-warning/5 border-warning/30"
                        )}
                      >
                        <AlertTriangle className={cn(
                          "w-5 h-5 mt-0.5",
                          conflict.severity === 'error' ? "text-destructive" : "text-warning"
                        )} />
                        <div className="flex-1">
                          <p className="font-medium">{conflict.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {conflict.dayName} • {conflict.slotTime}
                          </p>
                        </div>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          conflict.type === 'faculty' ? "bg-primary/10 text-primary" :
                          conflict.type === 'room' ? "bg-accent/10 text-accent" :
                          "bg-lab/10 text-lab"
                        )}>
                          {conflict.type}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
