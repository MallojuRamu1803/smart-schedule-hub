import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar, Users, Sparkles, ArrowRight, Check } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const features = [
    {
      icon: Calendar,
      title: 'Automated Scheduling',
      description: 'Generate conflict-free timetables in seconds using our constraint-based algorithm',
    },
    {
      icon: Users,
      title: 'Multi-View Support',
      description: 'View schedules by section, faculty, or room with color-coded entries',
    },
    {
      icon: Sparkles,
      title: 'Smart Constraints',
      description: 'Respects faculty availability, room capacity, and consecutive lab slots',
    },
  ];

  const benefits = [
    'No faculty conflicts or double-bookings',
    'Labs scheduled in consecutive slots',
    'Balanced workload distribution',
    'Export to PDF and Excel',
    'Role-based access control',
    'Real-time collaboration',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-foreground/10 backdrop-blur flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-primary-foreground">TimetableGen</span>
            </div>
            <Button asChild variant="secondary">
              <Link to="/auth">Sign In</Link>
            </Button>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-in">
              Automated College
              <br />
              <span className="text-accent">Timetable Generator</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
              Generate conflict-free, optimized timetables for your entire college in minutes.
              Our intelligent algorithm handles all constraints automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Button asChild size="xl" variant="secondary">
                <Link to="/auth">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="xl" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Powerful Scheduling Made Simple
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to manage complex college timetables with ease
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Built for Real College Needs
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our algorithm handles the complex constraints that make manual scheduling a nightmare.
                From faculty availability to lab requirements, we've got you covered.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-lab/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-lab" />
                    </div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-card border border-border">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-10 h-10 text-accent-foreground" />
                    </div>
                    <p className="text-lg font-medium">Interactive Timetable View</p>
                    <p className="text-muted-foreground text-sm mt-2">Color-coded, sortable, and exportable</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl gradient-primary opacity-20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Ready to Simplify Scheduling?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Join colleges that have transformed their timetable management with TimetableGen.
            Start generating conflict-free schedules today.
          </p>
          <Button asChild size="xl" variant="gradient">
            <Link to="/auth">
              Start Free Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="font-display font-semibold">TimetableGen</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TimetableGen. Built for educational institutions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
