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
  const [showMusicOptions, setShowMusicOptions] = useState(false);
  const [musicUrl, setMusicUrl] = useState("");
  const [musicTitle, setMusicTitle] = useState("");
  const [musicPlatform, setMusicPlatform] = useState<'spotify' | 'youtube' | 'upload'>('spotify');
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
      setShowMusicOptions(false);
      setMusicUrl("");
      setMusicTitle("");
      setMusicPlatform('spotify');
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
      setShowMusicOptions(false);
      setMusicUrl("");
      setMusicTitle("");
      setMusicPlatform('spotify');
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
        musicUrl: musicUrl || audioUrl,
        musicTitle: musicTitle || (audioFile ? audioFile.name : undefined),
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
      setMusicUrl("");
      setMusicTitle("");
      toast({
        title: "Music selected",
        description: file.name,
      });
    }
  };

  const handleMusicUrlSubmit = () => {
    if (!musicUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a music URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    const isValidSpotify = musicUrl.includes('spotify.com');
    const isValidYouTube = musicUrl.includes('youtube.com') || musicUrl.includes('youtu.be');
    
    if (musicPlatform === 'spotify' && !isValidSpotify) {
      toast({
        title: "Error",
        description: "Please enter a valid Spotify URL",
        variant: "destructive",
      });
      return;
    }
    
    if (musicPlatform === 'youtube' && !isValidYouTube) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    setAudioFile(null);
    setShowMusicOptions(false);
    toast({
      title: "Music added",
      description: musicTitle || "Music URL saved",
    });
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
              className={`flex-1 ${(audioFile || musicUrl) ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={() => setShowMusicOptions(!showMusicOptions)}
              data-testid="button-upload-music"
            >
              <i className="fas fa-music mr-2"></i>
              <span>Music</span>
              {(audioFile || musicUrl) && <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>}
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

          {showMusicOptions && (
            <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
              <div className="flex space-x-2">
                <Button
                  variant={musicPlatform === 'spotify' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMusicPlatform('spotify')}
                  className="flex-1"
                >
                  <i className="fab fa-spotify mr-2"></i>
                  Spotify
                </Button>
                <Button
                  variant={musicPlatform === 'youtube' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMusicPlatform('youtube')}
                  className="flex-1"
                >
                  <i className="fab fa-youtube mr-2"></i>
                  YouTube
                </Button>
                <Button
                  variant={musicPlatform === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setMusicPlatform('upload')}
                  className="flex-1"
                >
                  <i className="fas fa-upload mr-2"></i>
                  Upload
                </Button>
              </div>

              {musicPlatform === 'upload' ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleMusicUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
                    <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-600">Click to upload audio file</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder={`Enter ${musicPlatform === 'spotify' ? 'Spotify' : 'YouTube'} URL`}
                    value={musicUrl}
                    onChange={(e) => setMusicUrl(e.target.value)}
                  />
                  <Input
                    placeholder="Song title (optional)"
                    value={musicTitle}
                    onChange={(e) => setMusicTitle(e.target.value)}
                  />
                  <Button
                    onClick={handleMusicUrlSubmit}
                    className="w-full"
                    size="sm"
                  >
                    Add Music
                  </Button>
                </div>
              )}
              
              {(audioFile || musicUrl) && (
                <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                  <i className="fas fa-check-circle text-green-500"></i>
                  <span className="text-sm text-green-700">
                    {audioFile ? audioFile.name : (musicTitle || 'Music URL added')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAudioFile(null);
                      setMusicUrl("");
                      setMusicTitle("");
                    }}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              )}
            </div>
          )}

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
