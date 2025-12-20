import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Loader2,
  ArrowLeftRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Faculty, TimetableEntry, SwapRequest } from '@/lib/types';
import { format } from 'date-fns';

const SwapRequests = () => {
  const { isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [currentFacultyId, setCurrentFacultyId] = useState<string | null>(null);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    requester_entry_id: '',
    target_entry_id: '',
    reason: '',
  });
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const fetchData = async () => {
    // Get current user's faculty ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('faculty_id')
      .eq('user_id', user?.id)
      .single();

    if (profile?.faculty_id) {
      setCurrentFacultyId(profile.faculty_id);
    }

    const [swapsRes, facultyRes, entriesRes] = await Promise.all([
      supabase.from('swap_requests').select(`
        *,
        requester_faculty:faculty!swap_requests_requester_faculty_id_fkey(*),
        target_faculty:faculty!swap_requests_target_faculty_id_fkey(*)
      `).order('created_at', { ascending: false }),
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

    if (!swapsRes.error) setSwapRequests(swapsRes.data as any || []);
    if (!facultyRes.error) setFaculty(facultyRes.data || []);
    if (!entriesRes.error) setEntries(entriesRes.data as any || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmit = async () => {
    if (!formData.requester_entry_id || !formData.target_entry_id) {
      toast.error('Please select both classes to swap');
      return;
    }

    const requesterEntry = entries.find(e => e.id === formData.requester_entry_id);
    const targetEntry = entries.find(e => e.id === formData.target_entry_id);

    if (!requesterEntry || !targetEntry) {
      toast.error('Invalid entries selected');
      return;
    }

    const { error } = await supabase.from('swap_requests').insert({
      requester_faculty_id: requesterEntry.faculty_id,
      target_faculty_id: targetEntry.faculty_id,
      requester_entry_id: formData.requester_entry_id,
      target_entry_id: formData.target_entry_id,
      reason: formData.reason || null,
      status: 'pending',
    });

    if (error) {
      toast.error('Failed to create swap request');
    } else {
      toast.success('Swap request submitted for approval');
      setDialogOpen(false);
      setFormData({ requester_entry_id: '', target_entry_id: '', reason: '' });
      fetchData();
    }
  };

  const handleReview = async (approved: boolean) => {
    if (!selectedRequest) return;

    const updates: any = {
      status: approved ? 'approved' : 'rejected',
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes || null,
    };

    const { error } = await supabase
      .from('swap_requests')
      .update(updates)
      .eq('id', selectedRequest.id);

    if (error) {
      toast.error('Failed to update swap request');
    } else {
      // If approved, actually swap the entries
      if (approved) {
        const requesterEntry = entries.find(e => e.id === selectedRequest.requester_entry_id);
        const targetEntry = entries.find(e => e.id === selectedRequest.target_entry_id);

        if (requesterEntry && targetEntry) {
          // Swap the faculty IDs
          await Promise.all([
            supabase.from('timetable_entries').update({ faculty_id: targetEntry.faculty_id }).eq('id', requesterEntry.id),
            supabase.from('timetable_entries').update({ faculty_id: requesterEntry.faculty_id }).eq('id', targetEntry.id),
          ]);
        }
      }

      toast.success(approved ? 'Swap request approved and executed' : 'Swap request rejected');
      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchData();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-lab/10 text-lab border-lab/30">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-muted text-muted-foreground">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const myEntries = entries.filter(e => e.faculty_id === currentFacultyId);
  const otherEntries = entries.filter(e => e.faculty_id !== currentFacultyId);

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
            <h1 className="font-display text-2xl font-bold">Swap Requests</h1>
            <p className="text-muted-foreground">Request class swaps with other faculty members</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                New Swap Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Swap Request</DialogTitle>
                <DialogDescription>
                  Request to swap one of your classes with another faculty member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Your Class (to give away)</Label>
                  <Select
                    value={formData.requester_entry_id}
                    onValueChange={(v) => setFormData({ ...formData, requester_entry_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your class" />
                    </SelectTrigger>
                    <SelectContent>
                      {(isAdmin ? entries : myEntries).map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {entry.subject?.name} - {entry.section?.name} ({entry.working_day?.day_name} {entry.time_slot?.start_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class to Receive</Label>
                  <Select
                    value={formData.target_entry_id}
                    onValueChange={(v) => setFormData({ ...formData, target_entry_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target class" />
                    </SelectTrigger>
                    <SelectContent>
                      {(isAdmin ? entries : otherEntries).map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {entry.faculty?.name}: {entry.subject?.name} ({entry.working_day?.day_name} {entry.time_slot?.start_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Reason (Optional)</Label>
                  <Textarea
                    placeholder="Why do you want to swap this class?"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="gradient" onClick={handleSubmit}>
                    Submit Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Swap Requests List */}
        <div className="space-y-4">
          {swapRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ArrowLeftRight className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-medium text-lg mb-1">No Swap Requests</h3>
                <p className="text-muted-foreground text-sm">
                  No swap requests have been created yet
                </p>
              </CardContent>
            </Card>
          ) : (
            swapRequests.map((req) => {
              const requesterEntry = entries.find(e => e.id === req.requester_entry_id);
              const targetEntry = entries.find(e => e.id === req.target_entry_id);
              return (
                <Card key={req.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={cn(
                          "p-3 rounded-xl",
                          req.status === 'pending' ? "bg-warning/10" :
                          req.status === 'approved' ? "bg-lab/10" :
                          req.status === 'rejected' ? "bg-destructive/10" :
                          "bg-muted"
                        )}>
                          <ArrowLeftRight className={cn(
                            "w-6 h-6",
                            req.status === 'pending' ? "text-warning" :
                            req.status === 'approved' ? "text-lab" :
                            req.status === 'rejected' ? "text-destructive" :
                            "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">Swap Request</h3>
                            {getStatusBadge(req.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="p-3 rounded-lg bg-secondary/50">
                              <p className="text-xs text-muted-foreground mb-1">Giving Away</p>
                              <p className="font-medium text-sm">{requesterEntry?.subject?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {requesterEntry?.working_day?.day_name} {requesterEntry?.time_slot?.start_time} - {requesterEntry?.time_slot?.end_time}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                By: {req.requester_faculty?.name}
                              </p>
                            </div>
                            <div className="p-3 rounded-lg bg-secondary/50">
                              <p className="text-xs text-muted-foreground mb-1">Receiving</p>
                              <p className="font-medium text-sm">{targetEntry?.subject?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {targetEntry?.working_day?.day_name} {targetEntry?.time_slot?.start_time} - {targetEntry?.time_slot?.end_time}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                From: {req.target_faculty?.name}
                              </p>
                            </div>
                          </div>

                          {req.reason && (
                            <p className="text-sm text-muted-foreground italic mb-2">"{req.reason}"</p>
                          )}
                          {req.admin_notes && (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium">Admin notes:</span> {req.admin_notes}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Requested {format(new Date(req.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                      {isAdmin && req.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(req);
                            setReviewDialogOpen(true);
                          }}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review Swap Request</DialogTitle>
              <DialogDescription>
                Approve or reject this swap request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Admin Notes (Optional)</Label>
                <Textarea
                  placeholder="Add notes about this decision..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleReview(false)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => handleReview(true)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve & Execute
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SwapRequests;
