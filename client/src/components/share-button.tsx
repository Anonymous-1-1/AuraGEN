
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Share } from "lucide-react";
import { type PostWithUser } from "@/types";

interface ShareButtonProps {
  post: PostWithUser;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ShareButton({ 
  post, 
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
      // First generate the share link
      const shareData = await sharePostMutation.mutateAsync(post.id);
      
      const userName = post.isAnonymous ? 'Anonymous' : (post.user?.displayName || 'Aura User');
      const shareUrl = shareData?.shareUrl || `${window.location.origin}/?post=${post.id}`;
      const shareTitle = shareData?.title || `${userName}'s Aura Story`;
      const shareText = `"${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}" - Feeling ${post.mood}`;

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare) {
        const webShareData = {
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        };

        // Check if the data can be shared
        if (navigator.canShare(webShareData)) {
          try {
            await navigator.share(webShareData);
            toast({
              title: "Shared successfully!",
              description: "Your aura story has been shared",
            });
            return;
          } catch (shareError: any) {
            // User cancelled or share failed
            if (shareError.name === 'AbortError') {
              return; // User cancelled, don't show error
            }
            console.log('Native share failed, falling back to clipboard');
          }
        }
      }

      // Fallback to clipboard
      const fallbackText = `${shareTitle}\n\n${shareText}\n\n${shareUrl}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fallbackText);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard - paste it anywhere!",
        });
      } else {
        // Manual fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fallbackText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast({
          title: "Content copied!",
          description: "Story content copied to clipboard",
        });
      }

    } catch (error) {
      console.error('Share error:', error);
      
      // Final fallback - just copy basic content without API call
      try {
        const basicShareText = `Check out this aura story: "${post.content}" - Feeling ${post.mood}\n\nShared from Aura App: ${window.location.origin}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(basicShareText);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = basicShareText;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        
        toast({
          title: "Content copied!",
          description: "Story content copied to clipboard",
        });
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
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
