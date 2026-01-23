import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { Plus, Pencil, Trash2, Loader2, Clock, GraduationCap } from 'lucide-react';
import type { AcademicYear, Section, Department, TimeSlot, WorkingDay } from '@/lib/types';

const Settings = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [sections, setSections] = useState<(Section & { department: Department })[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
  const [loading, setLoading] = useState(true);

  // Section Dialog
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    department_id: '',
    academic_year_id: '',
    year_of_study: 1,
  });

  const fetchData = async () => {
    const [yearsRes, sectionsRes, deptsRes, slotsRes, daysRes] = await Promise.all([
      supabase.from('academic_years').select('*').order('year', { ascending: false }),
      supabase.from('sections').select('*, department:departments(*)').order('name'),
      supabase.from('departments').select('*').order('name'),
      supabase.from('time_slots').select('*').order('slot_order'),
      supabase.from('working_days').select('*').order('day_order'),
    ]);

    if (!yearsRes.error) setAcademicYears(yearsRes.data || []);
    if (!sectionsRes.error) setSections(sectionsRes.data as any || []);
    if (!deptsRes.error) setDepartments(deptsRes.data || []);
    if (!slotsRes.error) setTimeSlots(slotsRes.data || []);
    if (!daysRes.error) setWorkingDays(daysRes.data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('sections').insert(sectionFormData);
    if (error) {
      if (error.message.includes('duplicate')) toast.error('This section already exists');
      else toast.error('Failed to create section');
    } else {
      toast.success('Section created');
      setSectionDialogOpen(false);
      setSectionFormData({ name: '', department_id: '', academic_year_id: '', year_of_study: 1 });
      fetchData();
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Deleted');
      fetchData();
    }
  };

  const toggleWorkingDay = async (day: WorkingDay) => {
    const { error } = await supabase
      .from('working_days')
      .update({ is_active: !day.is_active })
      .eq('id', day.id);
    if (error) toast.error('Failed to update');
    else fetchData();
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
          <h1 className="font-display text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure sections and schedule settings</p>
        </div>

        <Tabs defaultValue="sections" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Sections</h2>
              <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Section</DialogTitle>
                    <DialogDescription>Create a new section</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateSection} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Section Name</Label>
                      <Input
                        placeholder="A or B"
                        value={sectionFormData.name}
                        onChange={(e) => setSectionFormData({ ...sectionFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select
                        value={sectionFormData.department_id}
                        onValueChange={(v) => setSectionFormData({ ...sectionFormData, department_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Academic Year</Label>
                      <Select
                        value={sectionFormData.academic_year_id}
                        onValueChange={(v) => setSectionFormData({ ...sectionFormData, academic_year_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((y) => (
                            <SelectItem key={y.id} value={y.id}>{y.year} - Sem {y.semester}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year of Study</Label>
                      <Select
                        value={String(sectionFormData.year_of_study)}
                        onValueChange={(v) => setSectionFormData({ ...sectionFormData, year_of_study: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1st Year</SelectItem>
                          <SelectItem value="2">2nd Year</SelectItem>
                          <SelectItem value="3">3rd Year</SelectItem>
                          <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setSectionDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="gradient">Create</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {sections.length === 0 ? (
                  <div className="text-center py-12">
                    <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-muted-foreground">No sections configured</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Section</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sections.map((section) => (
                        <TableRow key={section.id}>
                          <TableCell className="font-medium">{section.name}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                              {section.department?.code}
                            </span>
                          </TableCell>
                          <TableCell>Year {section.year_of_study}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSection(section.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Working Days</CardTitle>
                <CardDescription>Configure which days are active for scheduling</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {workingDays.map((day) => (
                    <div
                      key={day.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <span className="font-medium">{day.day_name}</span>
                      <Switch
                        checked={day.is_active}
                        onCheckedChange={() => toggleWorkingDay(day)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display">Time Slots</CardTitle>
                <CardDescription>Default time slots for the timetable</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Slot</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeSlots.map((slot, index) => (
                      <TableRow key={slot.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{slot.start_time}</TableCell>
                        <TableCell>{slot.end_time}</TableCell>
                        <TableCell>
                          {slot.is_break ? (
                            <span className="px-2 py-1 bg-break/10 text-break rounded text-xs font-medium">
                              {slot.break_name}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                              Class
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
