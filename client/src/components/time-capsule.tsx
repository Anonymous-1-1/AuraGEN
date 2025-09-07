import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MOOD_OPTIONS, type TimeCapsuleWithUser } from "@/types";

export function TimeCapsule() {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [unlockOption, setUnlockOption] = useState("");
  const [customDate, setCustomDate] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's time capsules
  const { data: userCapsules, isLoading: loadingUserCapsules } = useQuery({
    queryKey: ['/api/time-capsules/user'],
    retry: false,
  });

  // Fetch unlocked capsules
  const { data: unlockedCapsules, isLoading: loadingUnlocked } = useQuery({
    queryKey: ['/api/time-capsules/unlocked'],
    retry: false,
  });

  // Fetch community capsules
  const { data: communityCapsules, isLoading: loadingCommunity } = useQuery({
    queryKey: ['/api/time-capsules/community'],
    retry: false,
  });

  const createCapsuleMutation = useMutation({
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
      setSelectedMood("");
      setUnlockOption("");
      setCustomDate("");
      setIsPublic(false);
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

  const unlockCapsuleMutation = useMutation({
    mutationFn: async (capsuleId: string) => {
      const response = await apiRequest('POST', `/api/time-capsules/${capsuleId}/unlock`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Time Capsule Unlocked!",
        description: "Your message from the past has been revealed.",
      });
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
        description: "Failed to unlock time capsule.",
        variant: "destructive",
      });
    },
  });

  const getUnlockDate = () => {
    const now = new Date();
    switch (unlockOption) {
      case "1week":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case "1month":
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      case "1year":
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      case "5years":
        return new Date(now.getFullYear() + 5, now.getMonth(), now.getDate());
      case "custom":
        return customDate ? new Date(customDate) : null;
      default:
        return null;
    }
  };

  const handleCreateCapsule = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please write a message for your time capsule.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedMood) {
      toast({
        title: "Error",
        description: "Please select a mood for your time capsule.",
        variant: "destructive",
      });
      return;
    }

    const unlockDate = getUnlockDate();
    if (!unlockDate) {
      toast({
        title: "Error",
        description: "Please select when to unlock this capsule.",
        variant: "destructive",
      });
      return;
    }

    createCapsuleMutation.mutate({
      content,
      mood: selectedMood,
      unlockDate: unlockDate.toISOString(),
      isPublic,
    });
  };

  const formatTimeRemaining = (unlockDate: string) => {
    const unlock = new Date(unlockDate);
    const now = new Date();
    const diff = unlock.getTime() - now.getTime();
    
    if (diff <= 0) return "Ready to unlock!";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `Opens in ${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) return `Opens in ${months} month${months > 1 ? 's' : ''}`;
    if (days > 0) return `Opens in ${days} day${days > 1 ? 's' : ''}`;
    return "Opens soon";
  };

  const getMoodEmoji = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(m => m.id === mood);
    return moodOption?.emoji || '😊';
  };

  const canUnlock = (unlockDate: string) => {
    return new Date(unlockDate) <= new Date();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Time Capsules</h2>
      
      {/* Create Capsule */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Create a Time Capsule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea 
              placeholder="Write a message to your future self..." 
              className="resize-none focus:ring-2 focus:ring-ring focus:border-transparent"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              data-testid="textarea-capsule-content"
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">Mood</label>
              <Select value={selectedMood} onValueChange={setSelectedMood}>
                <SelectTrigger data-testid="select-capsule-mood">
                  <SelectValue placeholder="How are you feeling?" />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((mood) => (
                    <SelectItem key={mood.id} value={mood.id}>
                      <div className="flex items-center space-x-2">
                        <span>{mood.emoji}</span>
                        <span>{mood.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Unlock Time</label>
              <Select value={unlockOption} onValueChange={setUnlockOption}>
                <SelectTrigger data-testid="select-unlock-time">
                  <SelectValue placeholder="When should this unlock?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1week">Open in 1 week</SelectItem>
                  <SelectItem value="1month">Open in 1 month</SelectItem>
                  <SelectItem value="1year">Open in 1 year</SelectItem>
                  <SelectItem value="5years">Open in 5 years</SelectItem>
                  <SelectItem value="custom">Custom date...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {unlockOption === "custom" && (
              <div>
                <label className="block text-sm font-medium mb-2">Custom Date</label>
                <Input
                  type="datetime-local"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  data-testid="input-custom-unlock-date"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded"
                data-testid="checkbox-public-capsule"
              />
              <label htmlFor="isPublic" className="text-sm">
                Make this a community capsule (others can see when it unlocks)
              </label>
            </div>
            
            <Button 
              className="w-full font-semibold"
              onClick={handleCreateCapsule}
              disabled={createCapsuleMutation.isPending}
              data-testid="button-create-capsule"
            >
              {createCapsuleMutation.isPending ? (
                <i className="fas fa-spinner fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-archive mr-2"></i>
              )}
              Create Capsule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Capsules */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Pending Capsules</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUserCapsules ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {userCapsules?.filter((capsule: TimeCapsuleWithUser) => !capsule.isOpened).map((capsule: TimeCapsuleWithUser) => (
                <div key={capsule.id} className="bg-secondary rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getMoodEmoji(capsule.mood)}</span>
                      <div className="font-medium truncate">{capsule.content.substring(0, 30)}...</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatTimeRemaining(capsule.unlockDate)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {capsule.isPublic && (
                      <Badge variant="outline" className="text-xs">Public</Badge>
                    )}
                    {canUnlock(capsule.unlockDate) && (
                      <Button
                        size="sm"
                        onClick={() => unlockCapsuleMutation.mutate(capsule.id)}
                        disabled={unlockCapsuleMutation.isPending}
                        data-testid={`button-unlock-${capsule.id}`}
                      >
                        <i className="fas fa-unlock mr-1"></i>
                        Unlock
                      </Button>
                    )}
                    <i className="fas fa-clock text-mood-curious"></i>
                  </div>
                </div>
              ))}
              
              {(!userCapsules || userCapsules.filter((c: TimeCapsuleWithUser) => !c.isOpened).length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  <i className="fas fa-archive text-2xl mb-2"></i>
                  <p>No pending capsules. Create your first one above!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Opened */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Recently Opened</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUnlocked ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {unlockedCapsules?.slice(0, 3).map((capsule: TimeCapsuleWithUser) => (
                <div key={capsule.id} className="bg-gradient-to-r from-mood-happy to-mood-grateful rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{getMoodEmoji(capsule.mood)}</span>
                    <div className="font-medium">Past Self Message</div>
                  </div>
                  <p className="text-sm mb-2">"{capsule.content}"</p>
                  <div className="text-xs text-foreground/80">
                    Opened {capsule.openedAt ? new Date(capsule.openedAt).toLocaleDateString() : 'recently'}
                  </div>
                </div>
              ))}
              
              {(!unlockedCapsules || unlockedCapsules.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  <i className="fas fa-gift text-2xl mb-2"></i>
                  <p>No opened capsules yet. Your future messages will appear here!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Capsules */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Community Capsules</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCommunity ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {communityCapsules?.slice(0, 3).map((capsule: TimeCapsuleWithUser) => (
                <div key={capsule.id} className="bg-secondary rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getMoodEmoji(capsule.mood)}</span>
                      <div className="font-medium truncate">{capsule.content.substring(0, 40)}...</div>
                    </div>
                    <Badge className="text-xs bg-mood-motivated text-black">
                      Community
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    A collective hope from the community
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {formatTimeRemaining(capsule.unlockDate)}
                  </div>
                </div>
              ))}
              
              {(!communityCapsules || communityCapsules.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  <i className="fas fa-users text-2xl mb-2"></i>
                  <p>No community capsules available right now.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
