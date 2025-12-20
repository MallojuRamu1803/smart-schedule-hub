-- Substitutions table for handling faculty absences
CREATE TABLE public.substitutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_entry_id UUID NOT NULL REFERENCES public.timetable_entries(id) ON DELETE CASCADE,
  original_faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  substitute_faculty_id UUID REFERENCES public.faculty(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Swap requests for faculty to request class swaps
CREATE TABLE public.swap_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  target_faculty_id UUID NOT NULL REFERENCES public.faculty(id) ON DELETE CASCADE,
  requester_entry_id UUID NOT NULL REFERENCES public.timetable_entries(id) ON DELETE CASCADE,
  target_entry_id UUID NOT NULL REFERENCES public.timetable_entries(id) ON DELETE CASCADE,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Timetable versions for version history
CREATE TABLE public.timetable_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timetable_id UUID NOT NULL REFERENCES public.timetables(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  name TEXT,
  description TEXT,
  snapshot JSONB NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(timetable_id, version_number)
);

-- Timetable templates for saving and reusing patterns
CREATE TABLE public.timetable_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for substitutions
CREATE POLICY "Allow read for authenticated users" ON public.substitutions FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON public.substitutions FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Allow admin update" ON public.substitutions FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Allow admin delete" ON public.substitutions FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for swap_requests
CREATE POLICY "Allow read for authenticated users" ON public.swap_requests FOR SELECT USING (true);
CREATE POLICY "Faculty can create swap requests" ON public.swap_requests FOR INSERT WITH CHECK (
  has_role(auth.uid(), 'faculty'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
);
CREATE POLICY "Allow admin update" ON public.swap_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Allow admin delete" ON public.swap_requests FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for timetable_versions
CREATE POLICY "Allow read for authenticated users" ON public.timetable_versions FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON public.timetable_versions FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Allow admin update" ON public.timetable_versions FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Allow admin delete" ON public.timetable_versions FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for timetable_templates
CREATE POLICY "Allow read for authenticated users" ON public.timetable_templates FOR SELECT USING (true);
CREATE POLICY "Allow admin insert" ON public.timetable_templates FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Allow admin update" ON public.timetable_templates FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Allow admin delete" ON public.timetable_templates FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));