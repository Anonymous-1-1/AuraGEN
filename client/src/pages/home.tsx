import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MoodParticles } from "@/components/mood-particles";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MoodSelector } from "@/components/mood-selector";
import { PostCreator } from "@/components/post-creator";
import { MoodStories } from "@/components/mood-stories";
import { TimeCapsule } from "@/components/time-capsule";
import { GlobalMap } from "@/components/global-map";
import { AuraTree } from "@/components/aura-tree";
import { WhisperMode } from "@/components/whisper-mode";
import { FloatingActionButton } from "@/components/floating-action-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { TAB_OPTIONS, type MoodOption, MOOD_OPTIONS } from "@/types";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch global mood stats
  const { data: globalStats } = useQuery({
    queryKey: ['/api/mood-stats/global'],
    retry: false,
  });

  // Fetch mood challenges or trending topics
  const { data: challenges } = useQuery({
    queryKey: ['/api/mood-challenges'],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-circle text-white text-xl"></i>
          </div>
          <p className="text-muted-foreground">Loading your aura...</p>
        </div>
      </div>
    );
  }

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    // Update dynamic background based on mood
    updateDynamicBackground(mood);
  };

  const updateDynamicBackground = (mood?: string) => {
    const body = document.body;
    const hour = new Date().getHours();

    if (mood) {
      const moodOption = MOOD_OPTIONS.find(m => m.id === mood);
      if (moodOption) {
        body.style.background = `linear-gradient(135deg, var(--background) 0%, var(--mood-${mood}) 10%)`;
        return;
      }
    }

    // Fallback to time-based background
    if (hour >= 6 && hour < 12) {
      body.style.background = 'linear-gradient(135deg, hsl(222, 84%, 4%) 0%, hsl(45, 50%, 10%) 100%)';
    } else if (hour >= 12 && hour < 18) {
      body.style.background = 'linear-gradient(135deg, hsl(222, 84%, 4%) 0%, hsl(200, 30%, 8%) 100%)';
    } else {
      body.style.background = 'linear-gradient(135deg, hsl(222, 84%, 4%) 0%, hsl(271, 40%, 8%) 100%)';
    }
  };

  useEffect(() => {
    updateDynamicBackground();
    const interval = setInterval(updateDynamicBackground, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickShare = () => {
    // Placeholder for quick share functionality
    toast({ title: "Quick Share", description: "Initiating quick share..." });
    // Implement actual share logic here
  };

  const handleQuickVibe = () => {
    // Placeholder for quick vibe functionality
    toast({ title: "Quick Vibe", description: "Setting a quick vibe..." });
    // Implement actual vibe logic here
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            {/* Mood Selector */}
            <MoodSelector onMoodSelect={handleMoodSelect} selectedMood={selectedMood} />

            {/* Post Creator */}
            <PostCreator selectedMood={selectedMood} />

            {/* Global Mood Trends */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-globe mr-2"></i>
                  Global Mood Pulse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {globalStats?.slice(0, 3).map((stat: any) => {
                    const moodOption = MOOD_OPTIONS.find(m => m.id === stat.mood);
                    const percentage = Math.round((stat.count / 1000) * 100); // Rough calculation

                    return (
                      <div key={stat.mood} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full bg-mood-${stat.mood}`}></div>
                          <span className="capitalize">{stat.mood}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div className={`bg-mood-${stat.mood} h-2 rounded-full`} style={{width: `${percentage}%`}}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Mood Stories */}
            <MoodStories />

            {/* Mood Challenges */}
            <Card className="glassmorphism border-0">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <i className="fas fa-trophy mr-2 text-mood-motivated"></i>
                  Today's Challenge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-mood-grateful to-mood-happy rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🌸</div>
                  <h4 className="font-semibold mb-2">#GratitudeAura</h4>
                  <p className="text-sm mb-4">Share one thing you're thankful for today</p>
                  <div className="text-xs text-foreground/80">2,847 people joined • 6 hours left</div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'capsules':
        return <TimeCapsule />;
      case 'map':
        return <GlobalMap />;
      case 'tree':
        return <AuraTree />;
      case 'whisper':
        return <WhisperMode />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen relative">
      <MoodParticles />

      {/* Header */}
      <header className="glassmorphism fixed top-0 w-full z-50 p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <i className="fas fa-circle text-white text-sm"></i>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Aura
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" data-testid="button-notifications">
              <div className="relative">
                <i className="fas fa-bell text-muted-foreground hover:text-foreground transition-colors"></i>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"></div>
              </div>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowProfile(true)}
              data-testid="button-profile"
            >
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover" 
              />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-20 px-4 max-w-md mx-auto relative z-10">
        {renderTabContent()}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onProfileClick={() => setShowProfile(true)}
      />

      <FloatingActionButton 
        onQuickShare={handleQuickShare}
        onQuickVibe={handleQuickVibe}
      />
    </div>
  );
}