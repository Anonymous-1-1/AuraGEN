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

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest('DELETE', `/api/posts/${postId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
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
        description: "Failed to delete post. Please try again.",
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

  const handleDeletePost = (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      deletePostMutation.mutate(postId);
    }
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
    <Card className="glassmorphism border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Aura Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts?.slice(0, 3).map((post: PostWithUser) => (
            <div key={post.id} className={`relative glassmorphism rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300`}>
              {/* Mood-based glazy background overlay */}
              <div className={`absolute inset-0 ${MOOD_OPTIONS.find(m => m.id === post.mood)?.bgClass || 'mood-happy-bg'} opacity-10 rounded-2xl`}></div>
              
              <div className="relative z-10 flex items-start space-x-4">
                <div className={`w-14 h-14 ${MOOD_OPTIONS.find(m => m.id === post.mood)?.bgClass || 'mood-happy-bg'} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl drop-shadow-sm">{getMoodEmoji(post.mood)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-foreground">
                        {post.isAnonymous ? 'Anonymous' : (post.user?.displayName || 'Aura User')}
                      </span>
                      {post.location && (
                        <span className="text-xs text-muted-foreground bg-white/30 px-2 py-1 rounded-full">
                          {post.location}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    
                    {/* Delete button - only show for own posts */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full opacity-70 hover:opacity-100 transition-all"
                      onClick={() => handleDeletePost(post.id)}
                      disabled={deletePostMutation.isPending}
                      data-testid={`button-delete-post-${post.id}`}
                    >
                      <i className="fas fa-trash text-sm"></i>
                    </Button>
                  </div>
                  
                  <p className="text-sm mb-4 text-foreground/90 leading-relaxed">{post.content}</p>
                  
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="w-full h-40 object-cover rounded-xl mb-4 shadow-md" 
                    />
                  )}
                  
                  {post.musicUrl && (
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-white/40 backdrop-blur rounded-xl border border-white/30">
                      <i className="fas fa-music text-purple-600"></i>
                      <span className="text-sm font-medium">{post.musicTitle || 'Music attached'}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center space-x-2 hover:text-red-500 transition-colors p-0 font-medium"
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
                      className="flex items-center space-x-2 hover:text-blue-500 transition-colors p-0 font-medium"
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
            <div className="text-center text-muted-foreground py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-stream text-2xl text-white"></i>
              </div>
              <p className="font-medium">No stories yet. Be the first to share your aura!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
