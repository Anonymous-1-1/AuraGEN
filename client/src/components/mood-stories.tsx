import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MOOD_OPTIONS, type PostWithUser } from "@/types";

export function MoodStories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/posts'],
    retry: false,
  });

  const sendVibeMutation = useMutation({
    mutationFn: async ({ postId, type }: { postId: string; type: string }) => {
      const response = await apiRequest('POST', '/api/vibes', { postId, type });
      return response.json();
    },
    onSuccess: () => {
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
        description: "Failed to send vibe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getMoodEmoji = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(m => m.id === mood);
    return moodOption?.emoji || '😊';
  };

  const handleSendVibe = (postId: string, type: string) => {
    sendVibeMutation.mutate({ postId, type });
  };

  if (isLoading) {
    return (
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Aura Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glassmorphism border-0">
      <CardHeader>
        <CardTitle>Aura Stories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts?.slice(0, 3).map((post: PostWithUser) => (
            <div key={post.id} className="glassmorphism rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 bg-gradient-to-r from-mood-${post.mood} to-mood-${post.mood} rounded-full flex items-center justify-center`}>
                  <span className="text-xl">{getMoodEmoji(post.mood)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold">
                      {post.isAnonymous ? 'Anonymous' : (post.user?.displayName || 'Aura User')}
                    </span>
                    {post.location && (
                      <span className="text-xs text-muted-foreground">{post.location}</span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm mb-3">{post.content}</p>
                  
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="w-full h-32 object-cover rounded-lg mb-3" 
                    />
                  )}
                  
                  {post.musicUrl && (
                    <div className="flex items-center space-x-2 mb-3 p-2 bg-secondary rounded-lg">
                      <i className="fas fa-music text-primary"></i>
                      <span className="text-sm">{post.musicTitle || 'Music attached'}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                      onClick={() => handleSendVibe(post.id, 'heart')}
                      disabled={sendVibeMutation.isPending}
                      data-testid={`button-send-vibe-${post.id}`}
                    >
                      <i className="fas fa-heart"></i>
                      <span>{post.vibes?.length || 0} vibes</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-1 hover:text-foreground transition-colors p-0"
                      data-testid={`button-share-energy-${post.id}`}
                    >
                      <i className="fas fa-share"></i>
                      <span>Share energy</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(!posts || posts.length === 0) && (
            <div className="text-center text-muted-foreground py-8">
              <i className="fas fa-stream text-2xl mb-2"></i>
              <p>No stories yet. Be the first to share your aura!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
