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
  FileDown,
  Trash2,
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
import { exportTimetableToPDF } from '@/lib/pdfExport';

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

  const handleDeleteTimetable = async (timetableId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this timetable? This will remove all its entries.');
    if (!confirmed) return;

    const { error } = await supabase.from('timetables').delete().eq('id', timetableId);
    if (error) {
      toast.error('Failed to delete timetable');
      return;
    }

    toast.success('Timetable deleted');

    if (selectedTimetable?.id === timetableId) {
      setSelectedTimetable(null);
      setEntries([]);
    }

    fetchData();
  };

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
      // Fetch all required data for generation including faculty availability
      const [subjectsRes, facultySubjectsRes, roomsRes, sectionsRes, availabilityRes] = await Promise.all([
        supabase.from('subjects').select('*, section:sections(*, department:departments(*))'),
        supabase.from('faculty_subjects').select('*, faculty:faculty(*), subject:subjects(*)'),
        supabase.from('classrooms').select('*'),
        supabase.from('sections').select('*').eq('academic_year_id', formData.academic_year_id),
        supabase.from('faculty_availability').select('*').eq('is_available', false),
      ]);

      const subjects = subjectsRes.data || [];
      const facultySubjects = facultySubjectsRes.data || [];
      const rooms = roomsRes.data || [];
      const activeSections = sectionsRes.data || [];
      const facultyUnavailability = availabilityRes.data || [];
      const activeDays = workingDays.filter(d => d.is_active);
      const classSlots = timeSlots.filter(s => !s.is_break);

      console.log('DEBUG: Starting Generation');
      console.log('DEBUG: Active Days:', activeDays.map(d => d.day_name));
      console.log('DEBUG: Active Sections:', activeSections.map(s => s.name));
      console.log('DEBUG: Total Subjects:', subjects.length);
      console.log('DEBUG: Subjects:', subjects.map(s => `${s.name} (${s.code}) - ${s.type} - ${s.weekly_hours}h`));


      // Helper to check if faculty is available at a given day/slot
      const isFacultyAvailable = (facultyId: string, dayId: string, slotId: string) => {
        return !facultyUnavailability.some(
          ua => ua.faculty_id === facultyId && ua.working_day_id === dayId && ua.time_slot_id === slotId
        );
      };

      // Helper to identify subjects that belong to the parallel block (DP, OB, GAI, RPA)
      const isParallelBlockSubject = (subjectName: string, subjectCode: string) => {
        const nameLower = subjectName.toLowerCase();
        const codeLower = subjectCode.toLowerCase();
        return (
          // Match generic codes strictly or names loosely
          codeLower === 'dp' || nameLower === 'dp' ||
          codeLower === 'gai' || nameLower === 'gai' ||
          codeLower === 'rpa' || nameLower === 'rpa' ||
          // Keep legacy support just in case
          (nameLower.includes('dp') && (nameLower.includes('b1') || nameLower.includes('b2'))) ||
          codeLower === 'dp-b1' || codeLower === 'dp-b2'
        );
      };

      // Simple constraint-based scheduling algorithm
      const generatedEntries: Omit<TimetableEntry, 'id' | 'created_at'>[] = [];
      const usedSlots = new Map<string, Set<string>>(); // day_slot -> set of (faculty_id, room_id)
      const parallelBlockScheduledPerDay = new Set<string>(); // section_day keys to track if parallel block already scheduled

      // First pass: generate timetable based on weekly hours and constraints
      for (const section of activeSections) {
        const sectionSubjects = subjects.filter((s) => s.section_id === section.id);

        // Identify parallel block subjects for this section
        const parallelBlockSubjects = sectionSubjects.filter((s) =>
          isParallelBlockSubject(s.name, s.code)
        );

        // Track which subjects have been scheduled per day (for non-project work, non-parallel block subjects)
        const subjectScheduledPerDay = new Set<string>(); // subject_day keys

        for (const subject of sectionSubjects) {
          // Skip parallel block subjects - they'll be handled separately
          if (isParallelBlockSubject(subject.name, subject.code)) continue;

          // Find faculty for this subject
          const facultyMapping = facultySubjects.find((fs) => fs.subject_id === subject.id);
          if (!facultyMapping) continue;

          // Determine if we need lab or classroom
          const availableRooms = rooms.filter((r) => r.is_lab === (subject.subject_type === 'lab'));

          console.log(`DEBUG: Process Subject: ${subject.name} (${subject.code})`);
          console.log(`DEBUG: Faculty: ${facultyMapping.faculty.name}`);
          console.log(`DEBUG: Weekly Hours: ${subject.weekly_hours}`);
          console.log(`DEBUG: Available Rooms: ${availableRooms.length}`);

          if (availableRooms.length === 0) {
            console.log(`DEBUG: Skipped ${subject.name} - No rooms`);
            continue;
          }


          // Check if this is Project Work (allowed to have multiple periods per day)
          const isProjectWork = subject.name.toLowerCase().includes('project work');

          // Schedule the required weekly hours
          let hoursScheduled = 0;
          const labHoursPerSession = subject.subject_type === 'lab' ? 2 : 1;

          for (const day of activeDays) {
            if (hoursScheduled >= subject.weekly_hours) break;

            // For non-Project Work subjects, check if already scheduled on this day
            if (!isProjectWork) {
              const subjectDayKey = `${subject.id}_${day.id}`;
              if (subjectScheduledPerDay.has(subjectDayKey)) {
                continue; // Skip to next day
              }
            }

            for (const slot of classSlots) {
              if (hoursScheduled >= subject.weekly_hours) break;

              const slotKey = `${day.id}_${slot.id}`;
              if (!usedSlots.has(slotKey)) {
                usedSlots.set(slotKey, new Set());
              }

              const slotUsage = usedSlots.get(slotKey)!;

              // Check if faculty is available (not marked unavailable)
              if (!isFacultyAvailable(facultyMapping.faculty_id, day.id, slot.id)) continue;

              // Check if faculty is free (not already scheduled)
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

                // Check faculty availability for next slot too
                if (!isFacultyAvailable(facultyMapping.faculty_id, day.id, nextSlot.id)) continue;

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

                // Mark subject as scheduled on this day (for non-Project Work subjects)
                if (!isProjectWork) {
                  const subjectDayKey = `${subject.id}_${day.id}`;
                  subjectScheduledPerDay.add(subjectDayKey);
                }

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

                // Mark subject as scheduled on this day (for non-Project Work subjects)
                if (!isProjectWork) {
                  const subjectDayKey = `${subject.id}_${day.id}`;
                  subjectScheduledPerDay.add(subjectDayKey);
                }

                hoursScheduled += 1;
              }
            }
          }
        }

        // Handle parallel block subjects (DP-B1, DP-B2, GAI, RPA) - schedule them together in one block per day
        if (parallelBlockSubjects.length > 0) {
          // Track how many hours each parallel block subject needs
          const parallelBlockHours = new Map<string, number>();
          parallelBlockSubjects.forEach((subj) => {
            parallelBlockHours.set(subj.id, subj.weekly_hours);
          });

          // Find maximum weekly hours needed (to know how many times to schedule the block)
          const maxWeeklyHours = Math.max(...Array.from(parallelBlockHours.values()));

          // Schedule parallel block together multiple times per week (but only once per day)
          for (let blockCount = 0; blockCount < maxWeeklyHours; blockCount++) {
            let scheduled = false;

            for (const day of activeDays) {
              if (scheduled) break;

              const parallelBlockDayKey = `${section.id}_${day.id}`;
              if (parallelBlockScheduledPerDay.has(parallelBlockDayKey)) {
                continue; // Already scheduled parallel block for this day
              }

              // Check if any parallel block subject still needs hours
              const needsScheduling = Array.from(parallelBlockHours.entries()).some(([_, hours]) => hours > 0);
              if (!needsScheduling) break;

              // Try to find a slot where we can schedule all parallel block subjects together
              for (const slot of classSlots) {
                if (slot.is_break) continue;

                const slotKey = `${day.id}_${slot.id}`;
                if (!usedSlots.has(slotKey)) {
                  usedSlots.set(slotKey, new Set());
                }
                const slotUsage = usedSlots.get(slotKey)!;

                // Check if section already has a class in this slot
                if (slotUsage.has(`section_${section.id}`)) continue;

                // Try to schedule all parallel block subjects in this slot (different rooms)
                const scheduledParallelEntries: Array<{
                  subject: typeof parallelBlockSubjects[0];
                  facultyMapping: typeof facultySubjects[0];
                  room: typeof rooms[0];
                }> = [];
                const usedRoomsForBlock = new Set<string>();

                for (const subject of parallelBlockSubjects) {
                  // Check if this subject still needs hours
                  if ((parallelBlockHours.get(subject.id) || 0) <= 0) continue;

                  // Get faculty mappings for this subject
                  const facultyMappings = facultySubjects.filter((fs) => fs.subject_id === subject.id);
                  if (facultyMappings.length === 0) continue;

                  // Try each faculty mapping until we find one that works
                  let subjectScheduled = false;
                  for (const facultyMapping of facultyMappings) {
                    // Check if faculty is available
                    if (!isFacultyAvailable(facultyMapping.faculty_id, day.id, slot.id)) continue;
                    if (slotUsage.has(`faculty_${facultyMapping.faculty_id}`)) continue;

                    // Find available room (theory rooms)
                    const availableRooms = rooms.filter((r) => !r.is_lab);
                    const availableRoom = availableRooms.find(
                      (r) => !slotUsage.has(`room_${r.id}`) && !usedRoomsForBlock.has(r.id)
                    );

                    if (availableRoom) {
                      scheduledParallelEntries.push({
                        subject,
                        facultyMapping,
                        room: availableRoom,
                      });
                      usedRoomsForBlock.add(availableRoom.id);
                      subjectScheduled = true;
                      break;
                    }
                  }
                }

                // Schedule all parallel block subjects together in this slot
                if (scheduledParallelEntries.length > 0) {
                  for (const { subject, facultyMapping, room } of scheduledParallelEntries) {
                    generatedEntries.push({
                      timetable_id: newTimetable.id,
                      section_id: section.id,
                      subject_id: subject.id,
                      faculty_id: facultyMapping.faculty_id,
                      classroom_id: room.id,
                      working_day_id: day.id,
                      time_slot_id: slot.id,
                      is_locked: false,
                    });

                    slotUsage.add(`faculty_${facultyMapping.faculty_id}`);
                    slotUsage.add(`room_${room.id}`);

                    // Update hours scheduled
                    const currentHours = parallelBlockHours.get(subject.id) || 0;
                    parallelBlockHours.set(subject.id, Math.max(0, currentHours - 1));
                  }

                  slotUsage.add(`section_${section.id}`);
                  parallelBlockScheduledPerDay.add(parallelBlockDayKey);
                  scheduled = true;
                  break; // Move to next iteration after scheduling parallel block
                }
              }
            }
          }
        }
      }

      // Second pass: fill any remaining empty cells with Project Work (allowed to appear multiple times per day)
      for (const section of activeSections) {
        const sectionSubjects = subjects.filter((s) => s.section_id === section.id);
        const projectWorkSubject = sectionSubjects.find((s) =>
          s.name.toLowerCase().includes('project work')
        );
        if (!projectWorkSubject) continue;

        const projectFacultyMapping = facultySubjects.find(
          (fs) => fs.subject_id === projectWorkSubject.id
        );
        if (!projectFacultyMapping) continue;

        // Initialize a counter for how many hours of this subject have ALREADY been scheduled in the first pass
        // We need to count them to ensure we don't exceed weekly_hours
        let projectHoursScheduled = generatedEntries.filter(e => e.subject_id === projectWorkSubject.id && e.section_id === section.id).length;

        // If we assumed labs take 2 slots per entry in the array, the length check is fine because we push 2 entries for labs.
        // But for theory filler it's 1. Project Work is usually a lab (2 slots), but here we might treat it as single slot filler if needed?
        // Actually, let's keep it simple: just count the entries.

        if (projectHoursScheduled >= projectWorkSubject.weekly_hours) continue;

        for (const day of activeDays) {
          if (projectHoursScheduled >= projectWorkSubject.weekly_hours) break;

          for (const slot of classSlots) {
            if (projectHoursScheduled >= projectWorkSubject.weekly_hours) break;

            const slotKey = `${day.id}_${slot.id}`;
            if (!usedSlots.has(slotKey)) {
              usedSlots.set(slotKey, new Set());
            }
            const slotUsage = usedSlots.get(slotKey)!;

            // Skip break slots
            if (slot.is_break) continue;

            // Skip if this section already has an entry in this cell from the first pass
            const alreadyHasEntry = generatedEntries.some(
              (e) =>
                e.section_id === section.id &&
                e.working_day_id === day.id &&
                e.time_slot_id === slot.id
            );
            if (alreadyHasEntry) continue;

            // Respect faculty availability and conflicts
            if (!isFacultyAvailable(projectFacultyMapping.faculty_id, day.id, slot.id)) continue;
            if (slotUsage.has(`faculty_${projectFacultyMapping.faculty_id}`)) continue;
            if (slotUsage.has(`section_${section.id}`)) continue;

            const availableRoom = projectRooms.find((r) => !slotUsage.has(`room_${r.id}`));
            if (!availableRoom) continue;

            generatedEntries.push({
              timetable_id: newTimetable.id,
              section_id: section.id,
              subject_id: projectWorkSubject.id,
              faculty_id: projectFacultyMapping.faculty_id,
              classroom_id: availableRoom.id,
              working_day_id: day.id,
              time_slot_id: slot.id,
              is_locked: false,
            });

            slotUsage.add(`faculty_${projectFacultyMapping.faculty_id}`);
            slotUsage.add(`section_${section.id}`);
            slotUsage.add(`room_${availableRoom.id}`);

            projectHoursScheduled++;

          }
        }
      }

      // Post-process to ensure each non-Project-Work subject has at most ONE period per day per section
      const filteredEntries: typeof generatedEntries = [];
      const perDaySubjectSet = new Set<string>(); // section_subject_day

      for (const entry of generatedEntries) {
        const subject = subjects.find((s) => s.id === entry.subject_id);
        const isProjectWork = subject?.name.toLowerCase().includes('project work');
        const key = `${entry.section_id}_${entry.subject_id}_${entry.working_day_id}`;

        if (!isProjectWork && perDaySubjectSet.has(key)) {
          // Skip extra periods for non-Project-Work subjects on the same day
          continue;
        }

        perDaySubjectSet.add(key);
        filteredEntries.push(entry);
      }

      // Insert all entries
      if (filteredEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('timetable_entries')
          .insert(filteredEntries);

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

      toast.success(`Timetable generated with ${filteredEntries.length} entries`);
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
                      <li>Respect faculty availability constraints</li>
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
                <Card
                  key={tt.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedTimetable(tt)}
                >
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
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTimetable(tt);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTimetable(tt.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
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
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setSelectedTimetable(null)}>
                  ← Back to List
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => selectedTimetable && handleDeleteTimetable(selectedTimetable.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!selectedSection && viewType === 'section') {
                      toast.error('Please select a section first');
                      return;
                    }
                    if (!selectedFaculty && viewType === 'faculty') {
                      toast.error('Please select a faculty member first');
                      return;
                    }

                    const filteredEntries = viewType === 'section'
                      ? entries.filter(e => e.section_id === selectedSection)
                      : entries.filter(e => e.faculty_id === selectedFaculty);

                    const viewName = viewType === 'section'
                      ? sections.find((s: any) => s.id === selectedSection)?.name || 'Section'
                      : allFaculty.find(f => f.id === selectedFaculty)?.name || 'Faculty';

                    exportTimetableToPDF(
                      filteredEntries,
                      workingDays,
                      timeSlots,
                      {
                        title: selectedTimetable.name,
                        subtitle: `Academic Year: ${(selectedTimetable as any).academic_year?.year || ''}`,
                        viewType: viewType,
                        viewName: viewName,
                      }
                    );
                    toast.success('PDF exported successfully');
                  }}
                >
                  <FileDown className="w-4 h-4 mr-2" />
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
