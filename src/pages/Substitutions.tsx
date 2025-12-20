import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Loader2,
  UserMinus,
  UserPlus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Faculty, TimetableEntry, Substitution } from '@/lib/types';
import { format } from 'date-fns';

const Substitutions = () => {
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [suggestedSubstitutes, setSuggestedSubstitutes] = useState<Faculty[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    timetable_entry_id: '',
    original_faculty_id: '',
    substitute_faculty_id: '',
    date: '',
    reason: '',
  });

  const fetchData = async () => {
    const [subsRes, facultyRes, entriesRes] = await Promise.all([
      supabase.from('substitutions').select(`
        *,
        original_faculty:faculty!substitutions_original_faculty_id_fkey(*),
        substitute_faculty:faculty!substitutions_substitute_faculty_id_fkey(*)
      `).order('date', { ascending: false }),
      supabase.from('faculty').select('*, department:departments(*)'),
      supabase.from('timetable_entries').select(`
        *,
        section:sections(*),
        subject:subjects(*),
        faculty:faculty(*),
        classroom:classrooms(*),
        working_day:working_days(*),
        time_slot:time_slots(*)
      `),
    ]);

    if (!subsRes.error) setSubstitutions(subsRes.data as any || []);
    if (!facultyRes.error) setFaculty(facultyRes.data || []);
    if (!entriesRes.error) setEntries(entriesRes.data as any || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // When an entry is selected, find smart substitute suggestions
  useEffect(() => {
    if (formData.timetable_entry_id && formData.date) {
      findSubstitutes();
    }
  }, [formData.timetable_entry_id, formData.date]);

  const findSubstitutes = async () => {
    const entry = entries.find(e => e.id === formData.timetable_entry_id);
    if (!entry) return;

    // Get faculty who teach similar subjects (same department or subject type)
    const { data: facultySubjects } = await supabase
      .from('faculty_subjects')
      .select('*, faculty:faculty(*), subject:subjects(*)')
      .neq('faculty_id', entry.faculty_id);

    // Get faculty availability for the specific day/slot
    const dayOfWeek = new Date(formData.date).getDay();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[dayOfWeek];

    const { data: workingDay } = await supabase
      .from('working_days')
      .select('id')
      .eq('day_name', dayName)
      .single();

    if (!workingDay) return;

    // Get unavailable faculty
    const { data: unavailable } = await supabase
      .from('faculty_availability')
      .select('faculty_id')
      .eq('working_day_id', workingDay.id)
      .eq('time_slot_id', entry.time_slot_id)
      .eq('is_available', false);

    const unavailableFacultyIds = new Set(unavailable?.map(u => u.faculty_id) || []);

    // Get faculty who are already scheduled at this time
    const { data: busyEntries } = await supabase
      .from('timetable_entries')
      .select('faculty_id')
      .eq('working_day_id', entry.working_day_id)
      .eq('time_slot_id', entry.time_slot_id)
      .neq('id', entry.id);

    const busyFacultyIds = new Set(busyEntries?.map(e => e.faculty_id) || []);

    // Filter and rank available faculty
    const suggestions = faculty.filter(f => {
      if (f.id === entry.faculty_id) return false;
      if (unavailableFacultyIds.has(f.id)) return false;
      if (busyFacultyIds.has(f.id)) return false;
      return true;
    });

    // Prefer faculty from the same department
    suggestions.sort((a, b) => {
      const aMatch = a.department_id === entry.faculty?.department_id ? 1 : 0;
      const bMatch = b.department_id === entry.faculty?.department_id ? 1 : 0;
      return bMatch - aMatch;
    });

    setSuggestedSubstitutes(suggestions.slice(0, 5));
  };

  const handleSubmit = async () => {
    if (!formData.timetable_entry_id || !formData.date) {
      toast.error('Please fill in required fields');
      return;
    }

    const entry = entries.find(e => e.id === formData.timetable_entry_id);
    if (!entry) return;

    const { error } = await supabase.from('substitutions').insert({
      timetable_entry_id: formData.timetable_entry_id,
      original_faculty_id: entry.faculty_id,
      substitute_faculty_id: formData.substitute_faculty_id || null,
      date: formData.date,
      reason: formData.reason || null,
      status: formData.substitute_faculty_id ? 'assigned' : 'pending',
      created_by: user?.id,
    });

    if (error) {
      toast.error('Failed to create substitution request');
    } else {
      toast.success('Substitution request created');
      setDialogOpen(false);
      setFormData({ timetable_entry_id: '', original_faculty_id: '', substitute_faculty_id: '', date: '', reason: '' });
      setSuggestedSubstitutes([]);
      fetchData();
    }
  };

  const updateStatus = async (id: string, status: string, substituteId?: string) => {
    const updates: any = { status };
    if (substituteId) {
      updates.substitute_faculty_id = substituteId;
    }

    const { error } = await supabase
      .from('substitutions')
      .update(updates)
      .eq('id', id);

    if (error) {
      toast.error('Failed to update substitution');
    } else {
      toast.success('Substitution updated');
      fetchData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Pending</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Assigned</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-lab/10 text-lab border-lab/30">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Substitution Management</h1>
            <p className="text-muted-foreground">Handle faculty absences with smart substitute suggestions</p>
          </div>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="gradient">
                  <Plus className="w-4 h-4 mr-2" />
                  New Substitution
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Substitution Request</DialogTitle>
                  <DialogDescription>
                    Mark a faculty as absent and assign a substitute
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Class to Cover</Label>
                    <Select
                      value={formData.timetable_entry_id}
                      onValueChange={(v) => setFormData({ ...formData, timetable_entry_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {entries.map((entry) => (
                          <SelectItem key={entry.id} value={entry.id}>
                            {entry.subject?.name} - {entry.section?.name} ({entry.working_day?.day_name} {entry.time_slot?.start_time})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Reason (Optional)</Label>
                    <Textarea
                      placeholder="Reason for absence..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </div>

                  {suggestedSubstitutes.length > 0 && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-warning" />
                        Smart Suggestions
                      </Label>
                      <div className="grid grid-cols-1 gap-2">
                        {suggestedSubstitutes.map((fac) => (
                          <Button
                            key={fac.id}
                            variant={formData.substitute_faculty_id === fac.id ? "default" : "outline"}
                            className="justify-start h-auto py-3"
                            onClick={() => setFormData({ ...formData, substitute_faculty_id: fac.id })}
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <span className="text-xs font-semibold text-primary">
                                {fac.name.charAt(0)}
                              </span>
                            </div>
                            <div className="text-left">
                              <p className="font-medium">{fac.name}</p>
                              <p className="text-xs text-muted-foreground">{fac.department?.name}</p>
                            </div>
                            {formData.substitute_faculty_id === fac.id && (
                              <CheckCircle2 className="w-4 h-4 ml-auto text-lab" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Or Select Substitute Manually</Label>
                    <Select
                      value={formData.substitute_faculty_id}
                      onValueChange={(v) => setFormData({ ...formData, substitute_faculty_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select substitute faculty" />
                      </SelectTrigger>
                      <SelectContent>
                        {faculty.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="gradient" onClick={handleSubmit}>
                      Create Request
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Substitution List */}
        <div className="space-y-4">
          {substitutions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <UserMinus className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-1">No Substitutions</h3>
                <p className="text-muted-foreground text-sm">
                  No substitution requests have been created yet
                </p>
              </CardContent>
            </Card>
          ) : (
            substitutions.map((sub) => {
              const entry = entries.find(e => e.id === sub.timetable_entry_id);
              return (
                <Card key={sub.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "p-3 rounded-xl",
                          sub.status === 'pending' ? "bg-warning/10" :
                          sub.status === 'assigned' ? "bg-primary/10" :
                          sub.status === 'completed' ? "bg-lab/10" :
                          "bg-muted"
                        )}>
                          <Calendar className={cn(
                            "w-6 h-6",
                            sub.status === 'pending' ? "text-warning" :
                            sub.status === 'assigned' ? "text-primary" :
                            sub.status === 'completed' ? "text-lab" :
                            "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{entry?.subject?.name || 'Unknown Class'}</h3>
                            {getStatusBadge(sub.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {format(new Date(sub.date), 'EEEE, MMMM d, yyyy')} • {entry?.time_slot?.start_time} - {entry?.time_slot?.end_time}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <UserMinus className="w-4 h-4 text-destructive" />
                              <span className="text-muted-foreground">Absent:</span>
                              <span className="font-medium">{sub.original_faculty?.name}</span>
                            </div>
                            {sub.substitute_faculty && (
                              <div className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4 text-lab" />
                                <span className="text-muted-foreground">Substitute:</span>
                                <span className="font-medium">{sub.substitute_faculty.name}</span>
                              </div>
                            )}
                          </div>
                          {sub.reason && (
                            <p className="text-sm text-muted-foreground mt-2 italic">"{sub.reason}"</p>
                          )}
                        </div>
                      </div>
                      {isAdmin && sub.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => updateStatus(sub.id, 'cancelled')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {isAdmin && sub.status === 'assigned' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-lab hover:bg-lab/10"
                          onClick={() => updateStatus(sub.id, 'completed')}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Substitutions;
