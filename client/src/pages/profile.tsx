
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Profile() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    location: ''
  });

  // Initialize form when user data loads
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName || '',
        bio: user.bio || '',
        location: user.location || ''
      });
    }
  }, [user]);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch user's aura activities
  const { data: activities } = useQuery({
    queryKey: ['/api/aura-activities'],
    retry: false,
  });

  // Fetch user's posts
  const { data: userPosts } = useQuery({
    queryKey: ['/api/posts/user', user?.id],
    retry: false,
    enabled: !!user?.id,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: typeof editForm) => {
      const response = await apiRequest('PATCH', '/api/user/profile', profileData);
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    if (!editForm.displayName.trim()) {
      toast({
        title: "Error",
        description: "Display name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    updateProfileMutation.mutate(editForm);
  };

  const handleCancelEdit = () => {
    setEditForm({
      displayName: user?.displayName || '',
      bio: user?.bio || '',
      location: user?.location || ''
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <i className="fas fa-user text-white text-xl"></i>
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="glassmorphism border-0 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Profile</CardTitle>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                disabled={updateProfileMutation.isPending}
              >
                {isEditing ? (
                  <>
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </>
                ) : (
                  <>
                    <i className="fas fa-edit mr-2"></i>
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <img 
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=120"} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover" 
              />
              <div className="text-center md:text-left flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={editForm.displayName}
                        onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Enter your display name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Enter your location"
                      />
                    </div>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={updateProfileMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save mr-2"></i>
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold mb-2">
                      {user?.displayName || user?.firstName || "Aura User"}
                    </h1>
                    <p className="text-muted-foreground mb-2">{user?.bio || "No bio yet"}</p>
                    <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-muted-foreground">
                      <span><i className="fas fa-map-marker-alt mr-1"></i>{user?.location || "Location not set"}</span>
                      <span><i className="fas fa-calendar mr-1"></i>Joined {new Date(user?.createdAt || '').toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{user?.auraPoints || 0}</div>
                <div className="text-sm text-muted-foreground">Aura Points</div>
                <Badge variant="secondary" className="mt-2">
                  Level {user?.treeLevel || 1}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Aura Tree Stats */}
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-tree mr-2 text-mood-motivated"></i>
                Aura Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-mood-happy">
                    {userPosts?.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Shared Experiences</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-mood-motivated">
                    {activities?.filter((a: any) => a.type === 'supportive_gesture').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Supportive Gestures</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-mood-grateful">
                    {activities?.filter((a: any) => a.type === 'time_capsule').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Time Capsules</div>
                </div>
                <div className="text-center p-4 bg-secondary rounded-lg">
                  <div className="text-2xl font-bold text-mood-curious">
                    {activities?.filter((a: any) => a.type === 'global_exchange').length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Global Exchanges</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="glassmorphism border-0">
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-history mr-2"></i>
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activities?.slice(0, 10).map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{activity.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-mood-motivated">
                      +{activity.points}
                    </Badge>
                  </div>
                ))}
                {(!activities || activities.length === 0) && (
                  <div className="text-center text-muted-foreground py-8">
                    <i className="fas fa-seedling text-2xl mb-2"></i>
                    <p>Start sharing experiences to grow your aura!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Posts */}
        <Card className="glassmorphism border-0 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-stream mr-2"></i>
              Your Recent Experiences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userPosts?.slice(0, 5).map((post: any) => (
                <div key={post.id} className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full bg-mood-${post.mood}`}></div>
                      <span className="text-sm font-medium capitalize">{post.mood}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.location.href = `/?edit=${post.id}`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this post?')) {
                            // This would need to be implemented with a delete mutation
                            console.log('Delete post:', post.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">{post.content}</p>
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="w-full h-32 object-cover rounded-lg mt-2" 
                    />
                  )}
                </div>
              ))}
              {(!userPosts || userPosts.length === 0) && (
                <div className="text-center text-muted-foreground py-8">
                  <i className="fas fa-camera text-2xl mb-2"></i>
                  <p>You haven't shared any experiences yet.</p>
                  <Button className="mt-4" onClick={() => window.location.href = '/'}>
                    Share Your First Experience
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-8 text-center space-x-4">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            <i className="fas fa-home mr-2"></i>
            Back to Home
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/api/logout'}>
            <i className="fas fa-sign-out-alt mr-2"></i>
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
