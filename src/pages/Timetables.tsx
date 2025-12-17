import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Loader2,
  Calendar,
  Sparkles,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  BookOpen,
  FlaskConical,
} from 'lucide-react';
import type {
  AcademicYear,
  Timetable,
  TimetableEntry,
  Section,
  Subject,
  Faculty,
  Classroom,
  WorkingDay,
  TimeSlot,
  FacultySubject,
} from '@/lib/types';
import { cn } from '@/lib/utils';

const Timetables = () => {
  const { isAdmin } = useAuth();
  const [timetables, setTimetables] = useState<(Timetable & { academic_year: AcademicYear })[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', academic_year_id: '' });

  // View state
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [viewType, setViewType] = useState<'section' | 'faculty'>('section');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [allFaculty, setAllFaculty] = useState<Faculty[]>([]);

  const fetchData = async () => {
    const [ttRes, yearsRes, sectionsRes, daysRes, slotsRes, facultyRes] = await Promise.all([
      supabase.from('timetables').select('*, academic_year:academic_years(*)').order('generated_at', { ascending: false }),
      supabase.from('academic_years').select('*').order('year', { ascending: false }),
      supabase.from('sections').select('*, department:departments(*)').order('name'),
      supabase.from('working_days').select('*').eq('is_active', true).order('day_order'),
      supabase.from('time_slots').select('*').order('slot_order'),
      supabase.from('faculty').select('*').order('name'),
    ]);

    if (!ttRes.error) setTimetables(ttRes.data as any || []);
    if (!yearsRes.error) setAcademicYears(yearsRes.data || []);
    if (!sectionsRes.error) setSections(sectionsRes.data as any || []);
    if (!daysRes.error) setWorkingDays(daysRes.data || []);
    if (!slotsRes.error) setTimeSlots(slotsRes.data || []);
    if (!facultyRes.error) setAllFaculty(facultyRes.data || []);

    setLoading(false);
  };

  const fetchEntries = async (timetableId: string) => {
    const { data, error } = await supabase
      .from('timetable_entries')
      .select(`
        *,
        section:sections(*, department:departments(*)),
        subject:subjects(*),
        faculty:faculty(*),
        classroom:classrooms(*),
        working_day:working_days(*),
        time_slot:time_slots(*)
      `)
      .eq('timetable_id', timetableId);

    if (!error && data) {
      setEntries(data as any);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedTimetable) {
      fetchEntries(selectedTimetable.id);
    }
  }, [selectedTimetable]);

  const generateTimetable = async () => {
    if (!formData.name || !formData.academic_year_id) {
      toast.error('Please fill in all fields');
      return;
    }

    setGenerating(true);

    // Create timetable record
    const { data: newTimetable, error: createError } = await supabase
      .from('timetables')
      .insert({
        name: formData.name,
        academic_year_id: formData.academic_year_id,
        generation_status: 'generating',
      })
      .select()
      .single();

    if (createError) {
      toast.error('Failed to create timetable');
      setGenerating(false);
      return;
    }

    try {
      // Fetch all required data for generation
      const [subjectsRes, facultySubjectsRes, roomsRes, sectionsRes] = await Promise.all([
        supabase.from('subjects').select('*, section:sections(*, department:departments(*))'),
        supabase.from('faculty_subjects').select('*, faculty:faculty(*), subject:subjects(*)'),
        supabase.from('classrooms').select('*'),
        supabase.from('sections').select('*').eq('academic_year_id', formData.academic_year_id),
      ]);

      const subjects = subjectsRes.data || [];
      const facultySubjects = facultySubjectsRes.data || [];
      const rooms = roomsRes.data || [];
      const activeSections = sectionsRes.data || [];
      const activeDays = workingDays.filter(d => d.is_active);
      const classSlots = timeSlots.filter(s => !s.is_break);

      // Simple constraint-based scheduling algorithm
      const generatedEntries: Omit<TimetableEntry, 'id' | 'created_at'>[] = [];
      const usedSlots = new Map<string, Set<string>>(); // day_slot -> set of (faculty_id, room_id)

      for (const section of activeSections) {
        const sectionSubjects = subjects.filter(s => s.section_id === section.id);

        for (const subject of sectionSubjects) {
          // Find faculty for this subject
          const facultyMapping = facultySubjects.find(fs => fs.subject_id === subject.id);
          if (!facultyMapping) continue;

          // Determine if we need lab or classroom
          const availableRooms = rooms.filter(r => r.is_lab === (subject.subject_type === 'lab'));
          if (availableRooms.length === 0) continue;

          // Schedule the required weekly hours
          let hoursScheduled = 0;
          const labHoursPerSession = subject.subject_type === 'lab' ? 2 : 1;

          for (const day of activeDays) {
            if (hoursScheduled >= subject.weekly_hours) break;

            for (const slot of classSlots) {
              if (hoursScheduled >= subject.weekly_hours) break;

              const slotKey = `${day.id}_${slot.id}`;
              if (!usedSlots.has(slotKey)) {
                usedSlots.set(slotKey, new Set());
              }

              const slotUsage = usedSlots.get(slotKey)!;
              
              // Check if faculty is free
              if (slotUsage.has(`faculty_${facultyMapping.faculty_id}`)) continue;
              
              // Check if section already has a class
              if (slotUsage.has(`section_${section.id}`)) continue;

              // Find available room
              const availableRoom = availableRooms.find(
                r => !slotUsage.has(`room_${r.id}`)
              );
              if (!availableRoom) continue;

              // For labs, we need consecutive slots
              if (subject.subject_type === 'lab') {
                const currentSlotIndex = classSlots.findIndex(s => s.id === slot.id);
                if (currentSlotIndex === -1 || currentSlotIndex >= classSlots.length - 1) continue;
                
                const nextSlot = classSlots[currentSlotIndex + 1];
                const nextSlotKey = `${day.id}_${nextSlot.id}`;
                
                if (!usedSlots.has(nextSlotKey)) {
                  usedSlots.set(nextSlotKey, new Set());
                }
                const nextSlotUsage = usedSlots.get(nextSlotKey)!;
                
                if (nextSlotUsage.has(`faculty_${facultyMapping.faculty_id}`)) continue;
                if (nextSlotUsage.has(`section_${section.id}`)) continue;
                if (nextSlotUsage.has(`room_${availableRoom.id}`)) continue;

                // Schedule both slots
                generatedEntries.push({
                  timetable_id: newTimetable.id,
                  section_id: section.id,
                  subject_id: subject.id,
                  faculty_id: facultyMapping.faculty_id,
                  classroom_id: availableRoom.id,
                  working_day_id: day.id,
                  time_slot_id: slot.id,
                  is_locked: false,
                });

                generatedEntries.push({
                  timetable_id: newTimetable.id,
                  section_id: section.id,
                  subject_id: subject.id,
                  faculty_id: facultyMapping.faculty_id,
                  classroom_id: availableRoom.id,
                  working_day_id: day.id,
                  time_slot_id: nextSlot.id,
                  is_locked: false,
                });

                slotUsage.add(`faculty_${facultyMapping.faculty_id}`);
                slotUsage.add(`section_${section.id}`);
                slotUsage.add(`room_${availableRoom.id}`);
                nextSlotUsage.add(`faculty_${facultyMapping.faculty_id}`);
                nextSlotUsage.add(`section_${section.id}`);
                nextSlotUsage.add(`room_${availableRoom.id}`);

                hoursScheduled += 2;
              } else {
                // Schedule single slot for theory
                generatedEntries.push({
                  timetable_id: newTimetable.id,
                  section_id: section.id,
                  subject_id: subject.id,
                  faculty_id: facultyMapping.faculty_id,
                  classroom_id: availableRoom.id,
                  working_day_id: day.id,
                  time_slot_id: slot.id,
                  is_locked: false,
                });

                slotUsage.add(`faculty_${facultyMapping.faculty_id}`);
                slotUsage.add(`section_${section.id}`);
                slotUsage.add(`room_${availableRoom.id}`);

                hoursScheduled += 1;
              }
            }
          }
        }
      }

      // Insert all entries
      if (generatedEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('timetable_entries')
          .insert(generatedEntries);

        if (insertError) throw insertError;
      }

      // Update timetable status
      await supabase
        .from('timetables')
        .update({
          generation_status: 'completed',
          generated_at: new Date().toISOString(),
        })
        .eq('id', newTimetable.id);

      toast.success(`Timetable generated with ${generatedEntries.length} entries`);
      setDialogOpen(false);
      setFormData({ name: '', academic_year_id: '' });
      fetchData();

    } catch (error: any) {
      await supabase
        .from('timetables')
        .update({
          generation_status: 'failed',
          error_message: error.message,
        })
        .eq('id', newTimetable.id);

      toast.error('Failed to generate timetable: ' + error.message);
    }

    setGenerating(false);
  };

  const getEntryForCell = (sectionId: string, dayId: string, slotId: string) => {
    return entries.find(
      e => e.section_id === sectionId && e.working_day_id === dayId && e.time_slot_id === slotId
    );
  };

  const getFacultyEntryForCell = (facultyId: string, dayId: string, slotId: string) => {
    return entries.find(
      e => e.faculty_id === facultyId && e.working_day_id === dayId && e.time_slot_id === slotId
    );
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Timetables</h1>
            <p className="text-muted-foreground">Generate and view class schedules</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Timetable
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate New Timetable</DialogTitle>
                  <DialogDescription>
                    Create an automated timetable based on constraints
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Timetable Name</Label>
                    <Input
                      placeholder="Main Timetable 2024-25"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select
                      value={formData.academic_year_id}
                      onValueChange={(v) => setFormData({ ...formData, academic_year_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((y) => (
                          <SelectItem key={y.id} value={y.id}>
                            {y.year} - Semester {y.semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-2">Generation will:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ensure no faculty conflicts</li>
                      <li>Assign appropriate rooms/labs</li>
                      <li>Schedule lab sessions in consecutive slots</li>
                      <li>Meet weekly hour requirements</li>
                    </ul>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="gradient" onClick={generateTimetable} disabled={generating}>
                      {generating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Timetable List */}
        {!selectedTimetable && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetables.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg mb-1">No timetables yet</h3>
                  <p className="text-muted-foreground text-sm">
                    {isAdmin ? 'Generate your first timetable to get started' : 'No timetables have been generated yet'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              timetables.map((tt) => (
                <Card key={tt.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedTimetable(tt)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{tt.name}</CardTitle>
                        <CardDescription>
                          {tt.academic_year?.year} - Sem {tt.academic_year?.semester}
                        </CardDescription>
                      </div>
                      {tt.generation_status === 'completed' ? (
                        <CheckCircle2 className="w-5 h-5 text-lab" />
                      ) : tt.generation_status === 'failed' ? (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      ) : (
                        <Clock className="w-5 h-5 text-break" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(tt.generated_at).toLocaleDateString()}
                      </span>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Timetable View */}
        {selectedTimetable && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setSelectedTimetable(null)}>
                ← Back to List
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{selectedTimetable.name}</CardTitle>
                <CardDescription>View timetable by section or faculty</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={viewType} onValueChange={(v) => setViewType(v as 'section' | 'faculty')}>
                  <TabsList>
                    <TabsTrigger value="section">
                      <BookOpen className="w-4 h-4 mr-2" />
                      By Section
                    </TabsTrigger>
                    <TabsTrigger value="faculty">
                      <Users className="w-4 h-4 mr-2" />
                      By Faculty
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="section" className="space-y-4">
                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.department?.code} - {s.name} (Year {s.year_of_study})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedSection && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border border-border p-2 bg-muted text-left font-medium">Time</th>
                              {workingDays.map((day) => (
                                <th key={day.id} className="border border-border p-2 bg-muted text-center font-medium min-w-[120px]">
                                  {day.day_name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {timeSlots.map((slot) => (
                              <tr key={slot.id}>
                                <td className="border border-border p-2 text-sm whitespace-nowrap">
                                  {slot.start_time} - {slot.end_time}
                                </td>
                                {workingDays.map((day) => {
                                  const entry = getEntryForCell(selectedSection, day.id, slot.id);
                                  if (slot.is_break) {
                                    return (
                                      <td key={day.id} className="border border-border p-2 bg-break/10 text-center">
                                        <span className="text-xs text-break font-medium">{slot.break_name}</span>
                                      </td>
                                    );
                                  }
                                  return (
                                    <td key={day.id} className="border border-border p-1">
                                      {entry ? (
                                        <div className={cn(
                                          "p-2 rounded text-xs",
                                          entry.subject?.subject_type === 'lab'
                                            ? "bg-lab/10 border border-lab/20"
                                            : "bg-theory/10 border border-theory/20"
                                        )}>
                                          <div className="font-medium truncate">{entry.subject?.name}</div>
                                          <div className="text-muted-foreground truncate">{entry.faculty?.name}</div>
                                          <div className="text-muted-foreground flex items-center gap-1">
                                            {entry.subject?.subject_type === 'lab' ? (
                                              <FlaskConical className="w-3 h-3" />
                                            ) : null}
                                            {entry.classroom?.name}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="h-16" />
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="faculty" className="space-y-4">
                    <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                      <SelectTrigger className="w-64">
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {allFaculty.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {selectedFaculty && (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="border border-border p-2 bg-muted text-left font-medium">Time</th>
                              {workingDays.map((day) => (
                                <th key={day.id} className="border border-border p-2 bg-muted text-center font-medium min-w-[120px]">
                                  {day.day_name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {timeSlots.map((slot) => (
                              <tr key={slot.id}>
                                <td className="border border-border p-2 text-sm whitespace-nowrap">
                                  {slot.start_time} - {slot.end_time}
                                </td>
                                {workingDays.map((day) => {
                                  const entry = getFacultyEntryForCell(selectedFaculty, day.id, slot.id);
                                  if (slot.is_break) {
                                    return (
                                      <td key={day.id} className="border border-border p-2 bg-break/10 text-center">
                                        <span className="text-xs text-break font-medium">{slot.break_name}</span>
                                      </td>
                                    );
                                  }
                                  return (
                                    <td key={day.id} className="border border-border p-1">
                                      {entry ? (
                                        <div className={cn(
                                          "p-2 rounded text-xs",
                                          entry.subject?.subject_type === 'lab'
                                            ? "bg-lab/10 border border-lab/20"
                                            : "bg-theory/10 border border-theory/20"
                                        )}>
                                          <div className="font-medium truncate">{entry.subject?.name}</div>
                                          <div className="text-muted-foreground truncate">
                                            {(entry.section as any)?.department?.code} - {entry.section?.name}
                                          </div>
                                          <div className="text-muted-foreground">{entry.classroom?.name}</div>
                                        </div>
                                      ) : (
                                        <div className="h-16" />
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Timetables;
