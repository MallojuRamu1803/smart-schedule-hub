import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Pencil, Trash2, Building2, Loader2, X } from 'lucide-react';
import type { Department, AcademicYear, Section } from '@/lib/types';
import { z } from 'zod';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10).toUpperCase(),
});

interface SectionFormData {
  name: string;
  year_of_study: number;
}

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [sections, setSections] = useState<SectionFormData[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sectionErrors, setSectionErrors] = useState<Record<number, Record<string, string>>>({});
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select(`
        *,
        sections (
          id,
          name,
          year_of_study
        )
      `)
      .order('name');
    
    if (error) {
      toast.error('Failed to load departments');
    } else {
      setDepartments(data || []);
    }
    setLoading(false);
  };

  const fetchAcademicYears = async () => {
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .order('year', { ascending: false });
    
    if (error) {
      toast.error('Failed to load academic years');
    } else {
      setAcademicYears(data || []);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchAcademicYears();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      departmentSchema.parse(formData);
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

    if (editingDept) {
      const { error } = await supabase
        .from('departments')
        .update({ name: formData.name, code: formData.code.toUpperCase() })
        .eq('id', editingDept.id);

      if (error) {
        toast.error(error.message || 'Failed to update department');
        setSaving(false);
        return;
      }

      // Update sections if any were added
      if (sections.length > 0) {
        // Validate each section and collect errors
        const newSectionErrors: Record<number, Record<string, string>> = {};
        let hasIncompleteSections = false;

        sections.forEach((section, index) => {
          const hasSomeFields = section.name.trim() !== '' || section.academic_year_id !== '';
          const isComplete = section.name.trim() !== '' && 
                           section.academic_year_id !== '' && 
                           section.year_of_study >= 1 && 
                           section.year_of_study <= 4;

          if (hasSomeFields && !isComplete) {
            hasIncompleteSections = true;
            newSectionErrors[index] = {};
            if (section.name.trim() === '') {
              newSectionErrors[index].name = 'Section name is required';
            }
            if (section.academic_year_id === '') {
              newSectionErrors[index].academic_year_id = 'Academic year is required';
            }
            if (section.year_of_study < 1 || section.year_of_study > 4) {
              newSectionErrors[index].year_of_study = 'Year of study must be 1-4';
            }
          }
        });

        if (hasIncompleteSections) {
          setSectionErrors(newSectionErrors);
          toast.error('Please complete all fields in the highlighted sections or remove them');
          setSaving(false);
          return;
        }

        setSectionErrors({});

        // Filter out completely empty sections
        const validSections = sections.filter(section => 
          section.name.trim() !== '' && 
          section.year_of_study >= 1 && 
          section.year_of_study <= 4
        );

        // Get default academic year (active one or first available)
        const defaultAcademicYear = academicYears.find(ay => ay.is_active) || academicYears[0];
        
        if (!defaultAcademicYear && validSections.length > 0) {
          toast.error('Please create an academic year first');
          setSaving(false);
          return;
        }

        const sectionsToInsert = validSections.map(section => ({
          name: section.name.trim(),
          department_id: editingDept.id,
          academic_year_id: defaultAcademicYear!.id,
          year_of_study: section.year_of_study,
        }));

        if (validSections.length > 0) {
          const { error: sectionsError } = await supabase
            .from('sections')
            .insert(sectionsToInsert);

          if (sectionsError) {
            toast.error(sectionsError.message || 'Department updated but failed to add sections');
          } else {
            toast.success(`Department updated successfully with ${validSections.length} section(s)`);
          }
        } else {
          toast.success('Department updated successfully');
        }
      } else {
        toast.success('Department updated successfully');
      }

      setDialogOpen(false);
      fetchDepartments();
    } else {
      // Create department first
      const { data: newDept, error } = await supabase
        .from('departments')
        .insert({ name: formData.name, code: formData.code.toUpperCase() })
        .select()
        .single();

      if (error) {
        toast.error(error.message || 'Failed to create department');
        setSaving(false);
        return;
      }

      // Create sections if any were added
      if (sections.length > 0 && newDept) {
        // Validate each section and collect errors
        const newSectionErrors: Record<number, Record<string, string>> = {};
        let hasIncompleteSections = false;

        sections.forEach((section, index) => {
          const hasSomeFields = section.name.trim() !== '';
          const isComplete = section.name.trim() !== '' && 
                           section.year_of_study >= 1 && 
                           section.year_of_study <= 4;

          if (hasSomeFields && !isComplete) {
            hasIncompleteSections = true;
            newSectionErrors[index] = {};
            if (section.name.trim() === '') {
              newSectionErrors[index].name = 'Section name is required';
            }
            if (section.year_of_study < 1 || section.year_of_study > 4) {
              newSectionErrors[index].year_of_study = 'Year of study must be 1-4';
            }
          }
        });

        if (hasIncompleteSections) {
          setSectionErrors(newSectionErrors);
          toast.error('Please complete all fields in the highlighted sections or remove them');
          setSaving(false);
          return;
        }

        setSectionErrors({});

        // Filter out completely empty sections
        const validSections = sections.filter(section => 
          section.name.trim() !== '' && 
          section.year_of_study >= 1 && 
          section.year_of_study <= 4
        );

        // Get default academic year (active one or first available)
        const defaultAcademicYear = academicYears.find(ay => ay.is_active) || academicYears[0];
        
        if (!defaultAcademicYear && validSections.length > 0) {
          toast.error('Please create an academic year first');
          setSaving(false);
          return;
        }

        const sectionsToInsert = validSections.map(section => ({
          name: section.name.trim(),
          department_id: newDept.id,
          academic_year_id: defaultAcademicYear!.id,
          year_of_study: section.year_of_study,
        }));

        if (validSections.length > 0) {
          const { error: sectionsError } = await supabase
            .from('sections')
            .insert(sectionsToInsert);

          if (sectionsError) {
            toast.error(sectionsError.message || 'Department created but failed to add sections');
          } else {
            toast.success(`Department created successfully with ${validSections.length} section(s)`);
          }
        } else {
          toast.success('Department created successfully');
        }
      } else {
        toast.success('Department created successfully');
      }

      setDialogOpen(false);
      fetchDepartments();
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department? This will also delete all associated sections, subjects, and faculty.')) {
      return;
    }

    const { error } = await supabase.from('departments').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete department');
    } else {
      toast.success('Department deleted successfully');
      fetchDepartments();
    }
  };

  const openEditDialog = async (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, code: dept.code });
    setErrors({});
    setSectionErrors({});
    
    // Load existing sections for this department
    const { data: existingSections } = await supabase
      .from('sections')
      .select('*')
      .eq('department_id', dept.id);
    
    if (existingSections) {
      setSections(existingSections.map(s => ({
        name: s.name,
        year_of_study: s.year_of_study,
      })));
    } else {
      setSections([]);
    }
    
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '' });
    setSections([]);
    setErrors({});
    setSectionErrors({});
    setDialogOpen(true);
  };

  const addSection = () => {
    setSections([...sections, { name: '', year_of_study: 1 }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: keyof SectionFormData, value: string | number) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Departments</h1>
            <p className="text-muted-foreground">Manage academic departments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSectionErrors({});
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="gradient" onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDept ? 'Edit Department' : 'Add New Department'}</DialogTitle>
                <DialogDescription>
                  {editingDept ? 'Update department details' : 'Create a new academic department'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    placeholder="Computer Science & Engineering"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Department Code</Label>
                  <Input
                    id="code"
                    placeholder="CSE"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    maxLength={10}
                  />
                  {errors.code && <p className="text-xs text-destructive">{errors.code}</p>}
                </div>

                {/* Sections Section */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Sections</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSection}
                      className="h-8"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Section
                    </Button>
                  </div>
                  
                  {sections.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sections added. Click "Add Section" to add one.</p>
                  ) : (
                    <div className="space-y-3">
                      {sections.map((section, index) => {
                        const hasErrors = sectionErrors[index] && Object.keys(sectionErrors[index]).length > 0;
                        const hasSomeFields = section.name.trim() !== '';
                        const isIncomplete = hasSomeFields && !(section.name.trim() !== '' && 
                                                               section.year_of_study >= 1 && 
                                                               section.year_of_study <= 4);
                        
                        return (
                          <div 
                            key={index} 
                            className={`p-3 border rounded-lg space-y-2 ${
                              hasErrors || isIncomplete 
                                ? 'bg-destructive/5 border-destructive' 
                                : 'bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">
                                Section {index + 1}
                                {hasErrors && (
                                  <span className="ml-2 text-xs text-destructive">(Incomplete)</span>
                                )}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  removeSection(index);
                                  // Clear errors for this section
                                  const newErrors = { ...sectionErrors };
                                  delete newErrors[index];
                                  setSectionErrors(newErrors);
                                }}
                                className="h-6 w-6 text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Section Name</Label>
                                <Input
                                  placeholder="A, B, etc."
                                  value={section.name}
                                  onChange={(e) => {
                                    updateSection(index, 'name', e.target.value);
                                    // Clear error when user starts typing
                                    if (sectionErrors[index]?.name) {
                                      const newErrors = { ...sectionErrors };
                                      delete newErrors[index].name;
                                      if (Object.keys(newErrors[index]).length === 0) {
                                        delete newErrors[index];
                                      }
                                      setSectionErrors(newErrors);
                                    }
                                  }}
                                  className={`h-8 ${sectionErrors[index]?.name ? 'border-destructive' : ''}`}
                                />
                                {sectionErrors[index]?.name && (
                                  <p className="text-xs text-destructive">{sectionErrors[index].name}</p>
                                )}
                              </div>
                              
                              <div className="space-y-1">
                                <Label className="text-xs">Year of Study</Label>
                                <Select
                                  value={section.year_of_study.toString()}
                                  onValueChange={(value) => {
                                    updateSection(index, 'year_of_study', parseInt(value));
                                    // Clear error when user selects
                                    if (sectionErrors[index]?.year_of_study) {
                                      const newErrors = { ...sectionErrors };
                                      delete newErrors[index].year_of_study;
                                      if (Object.keys(newErrors[index]).length === 0) {
                                        delete newErrors[index];
                                      }
                                      setSectionErrors(newErrors);
                                    }
                                  }}
                                >
                                  <SelectTrigger className={`h-8 ${sectionErrors[index]?.year_of_study ? 'border-destructive' : ''}`}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1st Year</SelectItem>
                                    <SelectItem value="2">2nd Year</SelectItem>
                                    <SelectItem value="3">3rd Year</SelectItem>
                                    <SelectItem value="4">4th Year</SelectItem>
                                  </SelectContent>
                                </Select>
                                {sectionErrors[index]?.year_of_study && (
                                  <p className="text-xs text-destructive">{sectionErrors[index].year_of_study}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gradient" disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingDept ? 'Update' : 'Create'}
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
            ) : departments.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-1">No departments yet</h3>
                <p className="text-muted-foreground text-sm">Create your first department to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept: any) => {
                    const sections = dept.sections || [];
                    return (
                      <TableRow key={dept.id}>
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                            {dept.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          {sections.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {sections.map((section: any) => (
                                <span
                                  key={section.id}
                                  className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                                >
                                  {section.name} (Y{section.year_of_study})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No sections</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(dept.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(dept)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Departments;
