import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, UserCheck, BookOpen, Save, Trash2 } from 'lucide-react';
import type { Faculty, Subject, FacultySubject, Department, Section } from '@/lib/types';
import { cn } from '@/lib/utils';

const FacultyMapping = () => {
  const [faculty, setFaculty] = useState<(Faculty & { department: Department })[]>([]);
  const [subjects, setSubjects] = useState<(Subject & { section: Section & { department: Department } })[]>([]);
  const [mappings, setMappings] = useState<FacultySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [departments, setDepartments] = useState<Department[]>([]);

  // Track pending changes
  const [pendingAdd, setPendingAdd] = useState<Set<string>>(new Set());
  const [pendingRemove, setPendingRemove] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    const [facultyRes, subjectsRes, mappingsRes, deptsRes] = await Promise.all([
      supabase.from('faculty').select('*, department:departments(*)').order('name'),
      supabase.from('subjects').select('*, section:sections(*, department:departments(*))').order('code'),
      supabase.from('faculty_subjects').select('*'),
      supabase.from('departments').select('*').order('name'),
    ]);

    if (!facultyRes.error) setFaculty(facultyRes.data as any || []);
    if (!subjectsRes.error) setSubjects(subjectsRes.data as any || []);
    if (!mappingsRes.error) setMappings(mappingsRes.data || []);
    if (!deptsRes.error) setDepartments(deptsRes.data || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMappingKey = (facultyId: string, subjectId: string) => `${facultyId}_${subjectId}`;

  const isCurrentlyMapped = (facultyId: string, subjectId: string) => {
    const key = getMappingKey(facultyId, subjectId);
    const existingMapping = mappings.some(m => m.faculty_id === facultyId && m.subject_id === subjectId);
    
    if (pendingRemove.has(key)) return false;
    if (pendingAdd.has(key)) return true;
    return existingMapping;
  };

  const toggleMapping = (facultyId: string, subjectId: string) => {
    const key = getMappingKey(facultyId, subjectId);
    const existingMapping = mappings.some(m => m.faculty_id === facultyId && m.subject_id === subjectId);

    if (existingMapping) {
      // Already exists in DB
      if (pendingRemove.has(key)) {
        // Cancel the removal
        setPendingRemove(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        // Mark for removal
        setPendingRemove(prev => new Set(prev).add(key));
      }
    } else {
      // Doesn't exist in DB
      if (pendingAdd.has(key)) {
        // Cancel the addition
        setPendingAdd(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        // Mark for addition
        setPendingAdd(prev => new Set(prev).add(key));
      }
    }
  };

  const saveChanges = async () => {
    if (pendingAdd.size === 0 && pendingRemove.size === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);

    try {
      // Process removals
      if (pendingRemove.size > 0) {
        for (const key of pendingRemove) {
          const [facultyId, subjectId] = key.split('_');
          await supabase
            .from('faculty_subjects')
            .delete()
            .eq('faculty_id', facultyId)
            .eq('subject_id', subjectId);
        }
      }

      // Process additions
      if (pendingAdd.size > 0) {
        const additions = Array.from(pendingAdd).map(key => {
          const [faculty_id, subject_id] = key.split('_');
          return { faculty_id, subject_id };
        });
        await supabase.from('faculty_subjects').insert(additions);
      }

      toast.success(`Saved ${pendingAdd.size} additions and ${pendingRemove.size} removals`);
      setPendingAdd(new Set());
      setPendingRemove(new Set());
      fetchData();
    } catch (error: any) {
      toast.error('Failed to save changes: ' + error.message);
    }

    setSaving(false);
  };

  const hasChanges = pendingAdd.size > 0 || pendingRemove.size > 0;

  const filteredFaculty = selectedDepartment === 'all' 
    ? faculty 
    : faculty.filter(f => f.department_id === selectedDepartment);

  const filteredSubjects = selectedDepartment === 'all'
    ? subjects
    : subjects.filter(s => s.section?.department_id === selectedDepartment);

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
            <h1 className="font-display text-2xl font-bold">Faculty-Subject Mapping</h1>
            <p className="text-muted-foreground">Assign faculty members to subjects they can teach</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="gradient" 
              onClick={saveChanges} 
              disabled={!hasChanges || saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
              {hasChanges && (
                <span className="ml-2 px-2 py-0.5 bg-primary-foreground/20 rounded text-xs">
                  {pendingAdd.size + pendingRemove.size}
                </span>
              )}
            </Button>
          </div>
        </div>

        {filteredFaculty.length === 0 || filteredSubjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UserCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-lg mb-1">No data available</h3>
              <p className="text-muted-foreground text-sm">
                Add faculty members and subjects first to create mappings
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Assignment Matrix
              </CardTitle>
              <CardDescription>
                Check the boxes to assign faculty to subjects. Changes are saved when you click "Save Changes".
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 bg-muted border border-border p-3 text-left font-medium">
                        Faculty / Subject
                      </th>
                      {filteredSubjects.map(subject => (
                        <th 
                          key={subject.id} 
                          className="border border-border p-2 text-center font-medium min-w-[100px]"
                        >
                          <div className="text-xs font-mono">{subject.code}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[100px]" title={subject.name}>
                            {subject.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaculty.map(f => (
                      <tr key={f.id} className="hover:bg-muted/30">
                        <td className="sticky left-0 z-10 bg-card border border-border p-3">
                          <div className="font-medium">{f.name}</div>
                          <div className="text-xs text-muted-foreground">{f.department?.code}</div>
                        </td>
                        {filteredSubjects.map(subject => {
                          const key = getMappingKey(f.id, subject.id);
                          const isMapped = isCurrentlyMapped(f.id, subject.id);
                          const isPendingAdd = pendingAdd.has(key);
                          const isPendingRemove = pendingRemove.has(key);
                          
                          return (
                            <td 
                              key={subject.id} 
                              className={cn(
                                "border border-border p-2 text-center cursor-pointer transition-colors",
                                isPendingAdd && "bg-lab/10",
                                isPendingRemove && "bg-destructive/10",
                                !isPendingAdd && !isPendingRemove && isMapped && "bg-primary/5"
                              )}
                              onClick={() => toggleMapping(f.id, subject.id)}
                            >
                              <Checkbox 
                                checked={isMapped}
                                className={cn(
                                  "pointer-events-none",
                                  isPendingAdd && "border-lab",
                                  isPendingRemove && "border-destructive"
                                )}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/5 border border-border" />
            <span>Currently assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-lab/10 border border-lab/30" />
            <span>Pending addition</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/10 border border-destructive/30" />
            <span>Pending removal</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyMapping;
