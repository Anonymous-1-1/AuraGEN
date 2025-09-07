
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Share } from "lucide-react";

interface ShareButtonProps {
  postId: string;
  content: string;
  mood: string;
  userName?: string;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ShareButton({ 
  postId, 
  content, 
  mood, 
  userName, 
  variant = "ghost", 
  size = "sm",
  className = "" 
}: ShareButtonProps) {
  const { toast } = useToast();

  const sharePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest('POST', `/api/posts/${postId}/share`);
      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }
      return response.json();
    },
    onError: (error) => {
      console.error('Share mutation error:', error);
    }
  });

  const handleShare = async () => {
    try {
      const shareData = await sharePostMutation.mutateAsync(postId);
      
      const webShareData = {
        title: shareData.title || `${userName ? userName + "'s" : 'An'} Aura Story`,
        text: `"${content.slice(0, 100)}${content.length > 100 ? '...' : ''}" - Feeling ${mood}`,
        url: shareData.shareUrl || `${window.location.origin}/?post=${postId}`,
      };

      // Try native share first
      if (navigator.share) {
        try {
          await navigator.share(webShareData);
          toast({
            title: "Shared successfully!",
            description: "Your aura story has been shared",
          });
          return;
        } catch (shareError: any) {
          // User cancelled or share failed, fall back to clipboard
          if (shareError.name !== 'AbortError') {
            console.log('Native share failed, falling back to clipboard');
          }
        }
      }

      // Fallback to clipboard
      const shareText = `${webShareData.title}\n\n${webShareData.text}\n\n${webShareData.url}`;
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard - paste it anywhere!",
      });

    } catch (error) {
      console.error('Share error:', error);
      
      // Final fallback - just copy basic content
      try {
        const fallbackText = `Check out this aura story: "${content}" - Feeling ${mood}\n\nShared from Aura App: ${window.location.origin}`;
        await navigator.clipboard.writeText(fallbackText);
        toast({
          title: "Content copied!",
          description: "Story content copied to clipboard",
        });
      } catch (clipboardError) {
        toast({
          title: "Share failed",
          description: "Unable to share this story. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      disabled={sharePostMutation.isPending}
      className={`flex items-center space-x-2 hover:text-blue-500 transition-all duration-200 ${className}`}
    >
      {sharePostMutation.isPending ? (
        <i className="fas fa-spinner fa-spin" />
      ) : (
        <Share size={16} />
      )}
      <span>Share</span>
    </Button>
  );
}
