import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, BookOpen, Loader2, FlaskConical, GraduationCap } from 'lucide-react';
import type { Subject, Section, Department, AcademicYear } from '@/lib/types';
import { z } from 'zod';

const subjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters').max(15),
  subject_type: z.enum(['theory', 'lab']),
  weekly_hours: z.number().min(1).max(10),
  section_id: z.string().uuid('Please select a section'),
});

const Subjects = () => {
  const [subjects, setSubjects] = useState<(Subject & { section: Section & { department: Department } })[]>([]);
  const [sections, setSections] = useState<(Section & { department: Department; academic_year: AcademicYear })[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    subject_type: 'theory' as 'theory' | 'lab',
    weekly_hours: 3,
    section_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [subjectsRes, sectionsRes] = await Promise.all([
      supabase.from('subjects').select('*, section:sections(*, department:departments(*))').order('code'),
      supabase.from('sections').select('*, department:departments(*), academic_year:academic_years(*)').order('name'),
    ]);

    if (subjectsRes.error) toast.error('Failed to load subjects');
    else setSubjects(subjectsRes.data as any || []);

    if (sectionsRes.error) toast.error('Failed to load sections');
    else setSections(sectionsRes.data as any || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      subjectSchema.parse(formData);
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

    if (editingSubject) {
      const { error } = await supabase
        .from('subjects')
        .update(formData)
        .eq('id', editingSubject.id);

      if (error) toast.error(error.message || 'Failed to update subject');
      else {
        toast.success('Subject updated successfully');
        setDialogOpen(false);
        fetchData();
      }
    } else {
      const { error } = await supabase.from('subjects').insert(formData);

      if (error) {
        if (error.message.includes('duplicate')) toast.error('A subject with this code already exists');
        else toast.error(error.message || 'Failed to create subject');
      } else {
        toast.success('Subject created successfully');
        setDialogOpen(false);
        fetchData();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) toast.error('Failed to delete subject');
    else {
      toast.success('Subject deleted successfully');
      fetchData();
    }
  };

  const openEditDialog = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      subject_type: subject.subject_type,
      weekly_hours: subject.weekly_hours,
      section_id: subject.section_id,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingSubject(null);
    setFormData({ name: '', code: '', subject_type: 'theory', weekly_hours: 3, section_id: '' });
    setErrors({});
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Subjects</h1>
            <p className="text-muted-foreground">Manage courses and subjects</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                <DialogDescription>
                  {editingSubject ? 'Update subject details' : 'Add a new subject'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Subject Name</Label>
                    <Input
                      id="name"
                      placeholder="Data Structures"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Subject Code</Label>
                    <Input
                      id="code"
                      placeholder="CS201"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                    {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.subject_type}
                      onValueChange={(value: 'theory' | 'lab') => setFormData({ ...formData, subject_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="theory">Theory</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Weekly Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min={1}
                      max={10}
                      value={formData.weekly_hours}
                      onChange={(e) => setFormData({ ...formData, weekly_hours: parseInt(e.target.value) || 1 })}
                    />
                    {errors.weekly_hours && <p className="text-xs text-destructive">{errors.weekly_hours}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={formData.section_id}
                    onValueChange={(value) => setFormData({ ...formData, section_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.department?.code} - {section.name} (Year {section.year_of_study})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.section_id && <p className="text-xs text-destructive">{errors.section_id}</p>}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingSubject ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {sections.length === 0 && !loading && (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <GraduationCap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-lg mb-1">No sections available</h3>
              <p className="text-muted-foreground text-sm mb-4">You need to create sections before adding subjects</p>
              <Button asChild variant="outline">
                <a href="/settings">Go to Settings</a>
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-1">No subjects yet</h3>
                <p className="text-muted-foreground text-sm">Add subjects to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Hours/Week</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-mono font-medium">{subject.code}</TableCell>
                      <TableCell>{subject.name}</TableCell>
                      <TableCell>
                        {subject.subject_type === 'lab' ? (
                          <span className="px-2 py-1 bg-lab/10 text-lab rounded text-xs font-medium inline-flex items-center gap-1">
                            <FlaskConical className="w-3 h-3" />
                            Lab
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-theory/10 text-theory rounded text-xs font-medium">
                            Theory
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{subject.weekly_hours}h</TableCell>
                      <TableCell className="text-muted-foreground">
                        {subject.section?.department?.code} - {subject.section?.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(subject)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(subject.id)} className="text-destructive hover:text-destructive">
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

export default Subjects;
