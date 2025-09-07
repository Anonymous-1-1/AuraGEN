import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MOOD_OPTIONS } from "@/types";

export function WhisperMode() {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("calm");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch anonymous posts (whispers)
  const { data: whispers, isLoading } = useQuery({
    queryKey: ['/api/posts?anonymous=true'],
    retry: false,
  });

  const createWhisperMutation = useMutation({
    mutationFn: async (whisperData: any) => {
      const response = await apiRequest('POST', '/api/posts', whisperData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Whisper Shared",
        description: "Your anonymous message has been shared safely.",
      });
      setContent("");
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to share whisper. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendSupportMutation = useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: string }) => {
      const response = await apiRequest('POST', '/api/vibes', { postId, type });
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Support Sent",
        description: `You sent ${variables.type} to someone who needed it.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to send support.",
        variant: "destructive",
      });
    },
  });

  const handleShareWhisper = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write something before sharing.",
        variant: "destructive",
      });
      return;
    }

    createWhisperMutation.mutate({
      content,
      mood: selectedMood,
      isAnonymous: true,
    });
  };

  const handleSendSupport = (postId: string, type: string) => {
    sendSupportMutation.mutate({ postId, type });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getRandomAvatarGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-500',
      'from-green-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-blue-500',
      'from-yellow-500 to-orange-500',
    ];
    return gradients[index % gradients.length];
  };

  const getRandomIcon = (index: number) => {
    const icons = ['fa-heart', 'fa-leaf', 'fa-sun', 'fa-star', 'fa-flower', 'fa-gem'];
    return icons[index % icons.length];
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">Whisper Mode</h2>
        <p className="text-sm text-muted-foreground">
          Anonymous safe space for authentic expression
        </p>
      </div>
      
      {/* Anonymous Post Creator */}
      <Card className="glassmorphism border-0">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <i className="fas fa-user-secret text-white"></i>
            </div>
            <div>
              <div className="font-medium">Anonymous</div>
              <div className="text-xs text-muted-foreground">Your identity is protected</div>
            </div>
          </div>
          
          <Textarea 
            placeholder="Share what's really on your mind..." 
            className="resize-none focus:ring-2 focus:ring-ring focus:border-transparent mb-4"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            data-testid="textarea-whisper-content"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">How are you feeling?</label>
            <div className="grid grid-cols-3 gap-2">
              {MOOD_OPTIONS.slice(0, 6).map((mood) => (
                <button
                  key={mood.id}
                  className={`p-2 rounded-lg text-center transition-all text-xs ${
                    selectedMood === mood.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                  onClick={() => setSelectedMood(mood.id)}
                  data-testid={`whisper-mood-${mood.id}`}
                >
                  <div className="text-lg mb-1">{mood.emoji}</div>
                  <div>{mood.name}</div>
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
            onClick={handleShareWhisper}
            disabled={createWhisperMutation.isPending}
            data-testid="button-share-whisper"
          >
            {createWhisperMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-paper-plane mr-2"></i>
            )}
            Share Anonymously
          </Button>
        </CardContent>
      </Card>

      {/* Anonymous Feed */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Community Whispers</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Sample whispers for demonstration */}
            <Card className="glassmorphism border-0">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-heart text-white text-xs"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm mb-3">
                      Been struggling with self-doubt lately. Some days I feel like I'm not good enough, 
                      but sharing this here helps me realize I'm not alone in feeling this way.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                        onClick={() => handleSendSupport('whisper-1', 'support')}
                        disabled={sendSupportMutation.isPending}
                        data-testid="button-send-support-1"
                      >
                        <i className="fas fa-hands"></i>
                        <span>Send Support</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                        onClick={() => handleSendSupport('whisper-1', 'calm')}
                        disabled={sendSupportMutation.isPending}
                        data-testid="button-send-calm-1"
                      >
                        <i className="fas fa-spa"></i>
                        <span>Send Calm</span>
                      </Button>
                      <span>12 people sent support</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-0">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-leaf text-white text-xs"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm mb-3">
                      Finally decided to pursue my dream of becoming an artist. 
                      Scared but excited. Sometimes the scariest steps lead to the most beautiful destinations.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                        onClick={() => handleSendSupport('whisper-2', 'motivation')}
                        disabled={sendSupportMutation.isPending}
                        data-testid="button-send-motivation-2"
                      >
                        <i className="fas fa-rocket"></i>
                        <span>Send Motivation</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                        onClick={() => handleSendSupport('whisper-2', 'inspiration')}
                        disabled={sendSupportMutation.isPending}
                        data-testid="button-send-inspiration-2"
                      >
                        <i className="fas fa-star"></i>
                        <span>Send Inspiration</span>
                      </Button>
                      <span>27 people sent motivation</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-0">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <i className="fas fa-sun text-white text-xs"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm mb-3">
                      Lost my job last week but today I felt genuine gratitude for the first time. 
                      Maybe this is the universe pushing me toward something better.
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                        onClick={() => handleSendSupport('whisper-3', 'hope')}
                        disabled={sendSupportMutation.isPending}
                        data-testid="button-send-hope-3"
                      >
                        <i className="fas fa-rainbow"></i>
                        <span>Send Hope</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                        onClick={() => handleSendSupport('whisper-3', 'love')}
                        disabled={sendSupportMutation.isPending}
                        data-testid="button-send-love-3"
                      >
                        <i className="fas fa-heart"></i>
                        <span>Send Love</span>
                      </Button>
                      <span>45 people sent hope</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fetch and display actual anonymous posts if available */}
            {whispers?.filter((post: any) => post.isAnonymous).map((whisper: any, index: number) => (
              <Card key={whisper.id} className="glassmorphism border-0">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${getRandomAvatarGradient(index)} rounded-full flex items-center justify-center`}>
                      <i className={`fas ${getRandomIcon(index)} text-white text-xs`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-3">{whisper.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                          onClick={() => handleSendSupport(whisper.id, 'support')}
                          disabled={sendSupportMutation.isPending}
                          data-testid={`button-send-support-${whisper.id}`}
                        >
                          <i className="fas fa-hands"></i>
                          <span>Send Support</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                          onClick={() => handleSendSupport(whisper.id, 'calm')}
                          disabled={sendSupportMutation.isPending}
                          data-testid={`button-send-calm-${whisper.id}`}
                        >
                          <i className="fas fa-spa"></i>
                          <span>Send Calm</span>
                        </Button>
                        <span>{whisper.vibes?.length || 0} people sent support</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
