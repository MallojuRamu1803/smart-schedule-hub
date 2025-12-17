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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Building2, Loader2 } from 'lucide-react';
import type { Department } from '@/lib/types';
import { z } from 'zod';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10).toUpperCase(),
});

const Departments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) {
      toast.error('Failed to load departments');
    } else {
      setDepartments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDepartments();
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
      } else {
        toast.success('Department updated successfully');
        setDialogOpen(false);
        fetchDepartments();
      }
    } else {
      const { error } = await supabase
        .from('departments')
        .insert({ name: formData.name, code: formData.code.toUpperCase() });

      if (error) {
        if (error.message.includes('duplicate')) {
          toast.error('A department with this name or code already exists');
        } else {
          toast.error(error.message || 'Failed to create department');
        }
      } else {
        toast.success('Department created successfully');
        setDialogOpen(false);
        fetchDepartments();
      }
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

  const openEditDialog = (dept: Department) => {
    setEditingDept(dept);
    setFormData({ name: dept.name, code: dept.code });
    setErrors({});
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDept(null);
    setFormData({ name: '', code: '' });
    setErrors({});
    setDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Departments</h1>
            <p className="text-muted-foreground">Manage academic departments</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                          {dept.code}
                        </span>
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

export default Departments;
