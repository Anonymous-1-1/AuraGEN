import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodParticles } from "@/components/mood-particles";

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      <MoodParticles />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <i className="fas fa-circle text-white text-2xl"></i>
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Aura
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              The Social Graph of Experiences. Connect through emotions, share authentic moments, 
              and build meaningful relationships beyond likes and followers.
            </p>
            
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              <i className="fas fa-sparkles mr-2"></i>
              Enter Your Aura
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="glassmorphism border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-mood-happy rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">😊</span>
                </div>
                <CardTitle>Mood-Based Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Share experiences that adapt to your emotions. Your content reflects how you feel, 
                  creating authentic connections.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-mood-curious rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clock text-white"></i>
                </div>
                <CardTitle>Time Capsules</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Send messages to your future self or create community capsules that unlock 
                  on special dates and events.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-mood-calm rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-user-secret text-white"></i>
                </div>
                <CardTitle>Whisper Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Share your deepest thoughts anonymously in a safe, supportive environment 
                  protected by AI moderation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-mood-motivated rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-globe text-white"></i>
                </div>
                <CardTitle>Global Mood Map</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore how people around the world are feeling in real-time. 
                  Connect with others who share your emotional wavelength.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-mood-grateful rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-tree text-white"></i>
                </div>
                <CardTitle>Aura Tree</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Grow your personal tree through meaningful interactions. 
                  No vanity metrics, just authentic connection growth.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-0">
              <CardHeader>
                <div className="w-12 h-12 bg-mood-peaceful rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-heart text-white"></i>
                </div>
                <CardTitle>Mood Circles</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join communities based on emotions and interests. 
                  Find your tribe and support each other's journeys.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="glassmorphism rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Share Your Aura?</h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of people sharing authentic experiences and building meaningful connections.
            </p>
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-join"
            >
              Join Aura Today
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
