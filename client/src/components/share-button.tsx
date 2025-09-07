
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
      return response.json();
    },
  });

  const handleShare = async () => {
    try {
      const shareData = await sharePostMutation.mutateAsync(postId);
      
      const webShareData = {
        title: shareData.title,
        text: `"${content}" - ${userName ? `by ${userName}` : 'Shared from Aura'}`,
        url: shareData.shareUrl,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(webShareData)) {
        await navigator.share(webShareData);
        toast({
          title: "Shared!",
          description: "Aura story shared successfully",
        });
      } else {
        await navigator.clipboard.writeText(`${webShareData.text}\n\n${webShareData.url}`);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard - paste it anywhere!",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
      // Fallback to simple text copy
      try {
        await navigator.clipboard.writeText(`${content}\n\nShared from Aura: ${window.location.origin}`);
        toast({
          title: "Content copied!",
          description: "Share this aura story with others",
        });
      } catch {
        toast({
          title: "Share failed",
          description: "Unable to share this story",
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
