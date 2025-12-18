import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  BookOpen,
  Users,
  DoorOpen,
  Calendar,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stats {
  departments: number;
  subjects: number;
  faculty: number;
  rooms: number;
  timetables: number;
  mappings: number;
}

const Dashboard = () => {
  const { isAdmin, userRole } = useAuth();
  const [stats, setStats] = useState<Stats>({
    departments: 0,
    subjects: 0,
    faculty: 0,
    rooms: 0,
    timetables: 0,
    mappings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [departments, subjects, faculty, rooms, timetables, mappings] = await Promise.all([
        supabase.from('departments').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('faculty').select('id', { count: 'exact', head: true }),
        supabase.from('classrooms').select('id', { count: 'exact', head: true }),
        supabase.from('timetables').select('id', { count: 'exact', head: true }),
        supabase.from('faculty_subjects').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        departments: departments.count || 0,
        subjects: subjects.count || 0,
        faculty: faculty.count || 0,
        rooms: rooms.count || 0,
        timetables: timetables.count || 0,
        mappings: mappings.count || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { icon: Building2, label: 'Departments', value: stats.departments, href: '/departments', color: 'text-primary' },
    { icon: BookOpen, label: 'Subjects', value: stats.subjects, href: '/subjects', color: 'text-accent' },
    { icon: Users, label: 'Faculty', value: stats.faculty, href: '/faculty', color: 'text-lab' },
    { icon: DoorOpen, label: 'Rooms & Labs', value: stats.rooms, href: '/rooms', color: 'text-break' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl gradient-hero p-8 text-primary-foreground">
          <div className="relative z-10">
            <h1 className="font-display text-3xl font-bold mb-2">
              Welcome to TimetableGen
            </h1>
            <p className="text-primary-foreground/80 max-w-xl">
              {isAdmin 
                ? 'Manage your college timetable with our automated constraint-based scheduling system. Generate conflict-free schedules in minutes.'
                : 'View your class schedules and stay organized throughout the semester.'}
            </p>
            {isAdmin && (
              <Button asChild variant="secondary" className="mt-4">
                <Link to="/timetables">
                  Generate Timetable
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute right-20 bottom-0 w-32 h-32 bg-primary-foreground/5 rounded-full translate-y-1/2" />
        </div>

        {/* Stats Grid */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Link key={stat.label} to={stat.href}>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-3xl font-display font-bold mt-1">
                          {loading ? '...' : stat.value}
                        </p>
                      </div>
                      <div className={cn("p-3 rounded-xl bg-secondary", stat.color)}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-slide-up" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Recent Timetables
              </CardTitle>
              <CardDescription>View and manage generated schedules</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.timetables === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No timetables generated yet</p>
                  {isAdmin && (
                    <Button asChild variant="outline" className="mt-4">
                      <Link to="/timetables">Create First Timetable</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/timetables">
                    View All Timetables
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="animate-slide-up" style={{ animationDelay: '500ms' }}>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Quick Setup Guide
                </CardTitle>
                <CardDescription>Complete these steps to generate your first timetable</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: 'Add Departments', done: stats.departments > 0, href: '/departments' },
                    { label: 'Add Faculty Members', done: stats.faculty > 0, href: '/faculty' },
                    { label: 'Add Subjects', done: stats.subjects > 0, href: '/subjects' },
                    { label: 'Add Rooms & Labs', done: stats.rooms > 0, href: '/rooms' },
                    { label: 'Map Faculty to Subjects', done: stats.mappings > 0, href: '/faculty-mapping' },
                  ].map((step, index) => (
                    <Link
                      key={step.label}
                      to={step.href}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                        step.done ? "bg-lab/10" : "bg-secondary hover:bg-secondary/80"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                        step.done ? "bg-lab text-lab-foreground" : "bg-muted text-muted-foreground"
                      )}>
                        {step.done ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className={cn(
                        "flex-1 text-sm",
                        step.done && "line-through text-muted-foreground"
                      )}>
                        {step.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
