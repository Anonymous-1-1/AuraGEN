import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export function AuraTree() {
  const { user } = useAuth();
  const [selectedTreeType, setSelectedTreeType] = useState(user?.treeType || 'oak');

  // Fetch user's aura activities for stats
  const { data: activities, isLoading: loadingActivities } = useQuery({
    queryKey: ['/api/aura-activities'],
    retry: false,
  });

  const treeTypes = [
    { id: 'cherry', name: 'Cherry', emoji: '🌸', unlockLevel: 1 },
    { id: 'oak', name: 'Oak', emoji: '🌳', unlockLevel: 1 },
    { id: 'pine', name: 'Pine', emoji: '🌲', unlockLevel: 5 },
    { id: 'willow', name: 'Willow', emoji: '🌿', unlockLevel: 10 },
    { id: 'maple', name: 'Maple', emoji: '🍁', unlockLevel: 15 },
    { id: 'bamboo', name: 'Bamboo', emoji: '🎋', unlockLevel: 20 },
  ];

  const getTreeLevelName = (level: number) => {
    if (level >= 20) return 'Ancient Wisdom Tree';
    if (level >= 15) return 'Majestic Elder Tree';
    if (level >= 10) return 'Flourishing Canopy Tree';
    if (level >= 5) return 'Growing Spirit Tree';
    return 'Blooming Spirit Tree';
  };

  const getProgressToNextLevel = () => {
    const currentPoints = user?.auraPoints || 0;
    const currentLevel = user?.treeLevel || 1;
    const pointsPerLevel = 500; // Base points needed per level
    const pointsForCurrentLevel = (currentLevel - 1) * pointsPerLevel;
    const pointsForNextLevel = currentLevel * pointsPerLevel;
    const progressPoints = currentPoints - pointsForCurrentLevel;
    const neededForNext = pointsForNextLevel - pointsForCurrentLevel;
    
    return {
      progress: Math.min((progressPoints / neededForNext) * 100, 100),
      pointsNeeded: Math.max(0, pointsForNextLevel - currentPoints),
      currentLevelPoints: progressPoints,
      totalNeededForNext: neededForNext,
    };
  };

  const getActivityStats = () => {
    if (!activities) return { shared: 0, supportive: 0, capsules: 0, exchanges: 0 };
    
    return {
      shared: activities.filter((a: any) => a.type === 'shared_experience').length,
      supportive: activities.filter((a: any) => a.type === 'supportive_gesture').length,
      capsules: activities.filter((a: any) => a.type === 'time_capsule').length,
      exchanges: activities.filter((a: any) => a.type === 'global_exchange').length,
    };
  };

  const isTreeUnlocked = (requiredLevel: number) => {
    return (user?.treeLevel || 1) >= requiredLevel;
  };

  const progressData = getProgressToNextLevel();
  const stats = getActivityStats();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Your Aura Tree</h2>
      
      {/* Aura Tree Visualization */}
      <Card className="glassmorphism border-0">
        <CardContent className="pt-6 text-center">
          <div className="aura-tree mb-6">
            {/* Tree visualization with growth indicators */}
            <div className="relative mx-auto w-48 h-48 flex items-end justify-center">
              {/* Tree trunk */}
              <div className="w-6 h-16 bg-gradient-to-t from-amber-800 to-amber-600 rounded-t-lg"></div>
              
              {/* Tree crown - size based on level */}
              <div 
                className={`absolute bottom-12 bg-gradient-to-br from-mood-motivated via-mood-happy to-mood-grateful rounded-full opacity-80 animate-pulse-slow`}
                style={{
                  width: `${Math.min(32 + (user?.treeLevel || 1) * 4, 160)}px`,
                  height: `${Math.min(32 + (user?.treeLevel || 1) * 4, 160)}px`,
                }}
              ></div>
              
              {/* Glowing particles around tree */}
              <div className="absolute bottom-20 left-12 w-2 h-2 bg-mood-curious rounded-full animate-float"></div>
              <div className="absolute bottom-24 right-8 w-1 h-1 bg-mood-calm rounded-full animate-float" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-16 right-14 w-1 h-1 bg-mood-grateful rounded-full animate-float" style={{animationDelay: '2s'}}></div>
              
              {/* Level indicator */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Level {user?.treeLevel || 1}
                </Badge>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {getTreeLevelName(user?.treeLevel || 1)}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Level {user?.treeLevel || 1} • Growing through shared experiences
          </p>
          
          {/* Aura Points */}
          <Card className="bg-secondary border-0 p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Aura Points</span>
              <span className="text-primary font-bold">
                {user?.auraPoints?.toLocaleString() || 0}
              </span>
            </div>
            <Progress value={progressData.progress} className="mb-2" />
            <div className="text-xs text-muted-foreground">
              {progressData.pointsNeeded > 0 ? (
                `${progressData.pointsNeeded.toLocaleString()} points to next level`
              ) : (
                'Maximum level reached!'
              )}
            </div>
          </Card>
        </CardContent>
      </Card>

      {/* Growth Stats */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Growth Journey</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingActivities ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-mood-happy">
                  {stats.shared}
                </div>
                <div className="text-sm text-muted-foreground">Shared Experiences</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-mood-motivated">
                  {stats.supportive}
                </div>
                <div className="text-sm text-muted-foreground">Supportive Gestures</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-mood-grateful">
                  {stats.capsules}
                </div>
                <div className="text-sm text-muted-foreground">Time Capsules</div>
              </div>
              <div className="text-center p-4 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-mood-curious">
                  {stats.exchanges}
                </div>
                <div className="text-sm text-muted-foreground">Global Exchanges</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tree Customization */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Customize Your Tree</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {treeTypes.map((tree) => (
              <button
                key={tree.id}
                className={`p-3 bg-secondary rounded-lg text-center hover:bg-secondary/80 transition-colors relative ${
                  selectedTreeType === tree.id ? 'border-2 border-primary' : ''
                } ${!isTreeUnlocked(tree.unlockLevel) ? 'opacity-50' : ''}`}
                onClick={() => isTreeUnlocked(tree.unlockLevel) && setSelectedTreeType(tree.id)}
                disabled={!isTreeUnlocked(tree.unlockLevel)}
                data-testid={`tree-type-${tree.id}`}
              >
                <div className="text-2xl mb-1">{tree.emoji}</div>
                <div className="text-xs">{tree.name}</div>
                {!isTreeUnlocked(tree.unlockLevel) && (
                  <div className="absolute top-1 right-1">
                    <Badge variant="outline" className="text-xs px-1">
                      L{tree.unlockLevel}
                    </Badge>
                  </div>
                )}
                {tree.unlockLevel > (user?.treeLevel || 1) && (
                  <i className="fas fa-lock text-xs text-muted-foreground absolute bottom-1 right-1"></i>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Unlock new tree types by leveling up your aura!
          </p>
        </CardContent>
      </Card>

      {/* Community Tree */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Global Aura Forest</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-mood-motivated/20 to-mood-grateful/20 rounded-lg p-4 text-center">
            <div className="text-4xl mb-2">🌍🌳</div>
            <div className="font-semibold mb-2">The World Tree is Growing!</div>
            <p className="text-sm text-muted-foreground mb-4">
              342,891 people contributed today. Together we're growing something beautiful.
            </p>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium"
              data-testid="button-view-global-forest"
            >
              View Global Forest
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Level Benefits */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Level Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <div className="font-medium">Mood Circles Access</div>
                <div className="text-sm text-muted-foreground">Join exclusive communities</div>
              </div>
              <Badge className="bg-mood-motivated text-black">Level 1</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <div className="font-medium">Premium Tree Types</div>
                <div className="text-sm text-muted-foreground">Unlock special tree varieties</div>
              </div>
              <Badge className="bg-mood-curious text-white">Level 5</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div>
                <div className="font-medium">Global Influence</div>
                <div className="text-sm text-muted-foreground">Contribute to world mood trends</div>
              </div>
              <Badge className="bg-mood-grateful text-white">Level 10</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
