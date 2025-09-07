import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface PostCreatorProps {
  selectedMood: string | null;
}

export function PostCreator({ selectedMood }: PostCreatorProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isSchedulingCapsule, setIsSchedulingCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const response = await apiRequest('POST', '/api/posts', postData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your aura has been shared!",
      });
      setContent("");
      setImageFile(null);
      setAudioFile(null);
      setIsSchedulingCapsule(false);
      setUnlockDate("");
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
        description: "Failed to share your aura. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createTimeCapsuleMutation = useMutation({
    mutationFn: async (capsuleData: any) => {
      const response = await apiRequest('POST', '/api/time-capsules', capsuleData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your time capsule has been created!",
      });
      setContent("");
      setImageFile(null);
      setAudioFile(null);
      setIsSchedulingCapsule(false);
      setUnlockDate("");
      queryClient.invalidateQueries({ queryKey: ['/api/time-capsules'] });
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
        description: "Failed to create time capsule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiRequest('POST', '/api/upload/image', formData);
      return response.json();
    },
  });

  const uploadAudioMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('audio', file);
      const response = await apiRequest('POST', '/api/upload/audio', formData);
      return response.json();
    },
  });

  const handleShare = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write something before sharing.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMood) {
      toast({
        title: "Error",
        description: "Please select a mood first.",
        variant: "destructive",
      });
      return;
    }

    try {
      let imageUrl = null;
      let audioUrl = null;

      // Upload image if selected
      if (imageFile) {
        const imageResult = await uploadImageMutation.mutateAsync(imageFile);
        imageUrl = imageResult.imageUrl;
      }

      // Upload audio if selected
      if (audioFile) {
        const audioResult = await uploadAudioMutation.mutateAsync(audioFile);
        audioUrl = audioResult.audioUrl;
      }

      const postData = {
        content,
        mood: selectedMood,
        imageUrl,
        musicUrl: audioUrl,
        // Add location if available
        location: navigator.geolocation ? "Current Location" : null,
      };

      if (isSchedulingCapsule && unlockDate) {
        // Create time capsule
        await createTimeCapsuleMutation.mutateAsync({
          ...postData,
          unlockDate: new Date(unlockDate).toISOString(),
          isPublic: false,
        });
      } else {
        // Create regular post
        await createPostMutation.mutateAsync(postData);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      toast({
        title: "Photo selected",
        description: file.name,
      });
    }
  };

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      toast({
        title: "Music selected",
        description: file.name,
      });
    }
  };

  return (
    <Card className="glassmorphism border-0">
      <CardHeader>
        <CardTitle>Share Your Aura</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea 
            placeholder="What's your experience right now?" 
            className="resize-none focus:ring-2 focus:ring-ring focus:border-transparent"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            data-testid="textarea-post-content"
          />
          
          {isSchedulingCapsule && (
            <div>
              <label className="block text-sm font-medium mb-2">Unlock Date</label>
              <Input
                type="datetime-local"
                value={unlockDate}
                onChange={(e) => setUnlockDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                data-testid="input-unlock-date"
              />
            </div>
          )}
          
          <div className="flex space-x-3">
            <Button 
              variant="secondary" 
              className="flex-1 relative"
              data-testid="button-upload-photo"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <i className="fas fa-camera mr-2"></i>
              <span>Photo</span>
              {imageFile && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>}
            </Button>
            
            <Button 
              variant="secondary" 
              className="flex-1 relative"
              data-testid="button-upload-music"
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleMusicUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <i className="fas fa-music mr-2"></i>
              <span>Music</span>
              {audioFile && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>}
            </Button>
            
            <Button 
              variant="secondary" 
              className={`flex-1 ${isSchedulingCapsule ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setIsSchedulingCapsule(!isSchedulingCapsule)}
              data-testid="button-schedule-capsule"
            >
              <i className="fas fa-clock mr-2"></i>
              <span>Capsule</span>
            </Button>
          </div>

          <Button 
            className="w-full font-semibold"
            onClick={handleShare}
            disabled={createPostMutation.isPending || createTimeCapsuleMutation.isPending}
            data-testid="button-share-aura"
          >
            {createPostMutation.isPending || createTimeCapsuleMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : null}
            {isSchedulingCapsule ? 'Create Time Capsule' : 'Share Aura'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
