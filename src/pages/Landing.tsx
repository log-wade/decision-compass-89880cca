import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FileCheck2, X } from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/decisions/new');
    } else {
      navigate('/auth', { state: { redirectTo: '/decisions/new' } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <FileCheck2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-foreground">Decision Memory</span>
          </div>
          {!user && (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
          )}
          {user && (
            <Button 
              variant="ghost" 
              onClick={() => navigate('/decisions')}
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Never Lose the "Why" Behind a Decision Again.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Capture the reasoning, context, and trade-offs behind critical decisions — before they disappear into email and memory.
          </p>
          
          <div className="mt-10">
            <Button 
              size="lg" 
              onClick={handleCTA}
              className="text-base px-8 py-6 h-auto font-medium"
            >
              Record Your First Decision
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Takes less than 5 minutes. No setup required.
            </p>
          </div>

          <p className="mt-12 text-sm text-muted-foreground/70">
            No automation. No judgment. Just clarity.
          </p>
        </div>
      </section>

      {/* What This Product Is */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-foreground text-center mb-6">
              What is Decision Memory?
            </h2>
            <p className="text-muted-foreground text-center leading-relaxed">
              Decision Memory is a simple tool for capturing human decisions and reasoning. 
              It's not AI automation or approval enforcement — it creates a searchable record 
              of how and why important decisions were made. When you need to understand past 
              choices, the context is there.
            </p>
          </div>
        </div>
      </section>

      {/* What This Product Is NOT */}
      <section className="border-t border-border/40">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 text-muted-foreground">
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-sm">Not surveillance</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-sm">Not autonomous AI</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-sm">Not workflow enforcement</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/40 bg-muted/20">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-4">
              Ready to start?
            </h2>
            <p className="text-muted-foreground mb-8">
              Document your first decision while it's still clear.
            </p>
            <Button 
              size="lg" 
              onClick={handleCTA}
              className="text-base px-8 py-6 h-auto font-medium"
            >
              Record Your First Decision
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Decision Memory
        </div>
      </footer>
    </div>
  );
}
