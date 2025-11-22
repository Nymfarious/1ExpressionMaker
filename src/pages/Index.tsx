import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Layers, Wand2, Package, ArrowRight, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!user);
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-accent">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-5" />
        <div className="container mx-auto px-6 py-24 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-card rounded-full px-4 py-2 mb-6 shadow-card">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Phase 1: Creator MVP</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Nano Banana PRO
              </span>
              <br />
              <span className="text-foreground">VTuber Asset Creation</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform character images into complete VTuber asset packs with AI-powered
              decomposition and expression generation
            </p>
            
            <div className="flex gap-4 justify-center">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  className="bg-gradient-primary hover:shadow-glow transition-all"
                  onClick={() => navigate("/dashboard")}
                >
                  Open Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="bg-gradient-primary hover:shadow-glow transition-all"
                    onClick={() => navigate("/auth")}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/auth")}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI pipeline automates the complex process of creating VTuber assets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-8 text-center shadow-card hover:shadow-elevated transition-all">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow">
              <Layers className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Image Decomposition</h3>
            <p className="text-muted-foreground">
              Automatically separate your character into layers: head, eyes, mouth, body, and accessories
            </p>
          </Card>

          <Card className="p-8 text-center shadow-card hover:shadow-elevated transition-all">
            <div className="w-16 h-16 rounded-2xl bg-gradient-secondary mx-auto mb-6 flex items-center justify-center shadow-glow">
              <Wand2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Expression Generation</h3>
            <p className="text-muted-foreground">
              Generate 30+ expressions including phonemes, eye directions, and emotional states
            </p>
          </Card>

          <Card className="p-8 text-center shadow-card hover:shadow-elevated transition-all">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-glow">
              <Package className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Export & Package</h3>
            <p className="text-muted-foreground">
              Get organized folders with transparency maps, rigging data, and setup guides
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-24">
        <Card className="p-12 text-center bg-gradient-primary shadow-glow max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary-foreground">
            Ready to create amazing VTuber assets?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start with a single character image and let our AI pipeline do the heavy lifting
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/dashboard")}
          >
            Get Started Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Card>
      </section>
    </div>
  );
};

export default Index;
