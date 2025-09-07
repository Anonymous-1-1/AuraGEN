import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { MOOD_OPTIONS } from "@/types";

export function GlobalMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchCountry, setSearchCountry] = useState("");

  // Fetch global mood stats
  const { data: globalStats, isLoading: loadingGlobal } = useQuery({
    queryKey: ['/api/mood-stats/global'],
    retry: false,
  });

  // Fetch regional trends
  const { data: regionalStats, isLoading: loadingRegional } = useQuery({
    queryKey: ['/api/mood-stats/region', selectedRegion],
    retry: false,
    enabled: !!selectedRegion,
  });

  const mockLocations = [
    { 
      id: 'nyc', 
      name: 'Times Square, NY', 
      mood: 'happy', 
      count: 43, 
      description: 'Glowing yellow',
      country: 'United States',
      coordinates: { top: '25%', left: '25%' }
    },
    { 
      id: 'tokyo', 
      name: 'Shibuya, Tokyo', 
      mood: 'calm', 
      count: 28, 
      description: 'Peaceful blue',
      country: 'Japan',
      coordinates: { top: '35%', left: '85%' }
    },
    { 
      id: 'sydney', 
      name: 'Sydney Harbor', 
      mood: 'motivated', 
      count: 35, 
      description: 'Energetic green',
      country: 'Australia',
      coordinates: { top: '75%', left: '85%' }
    },
    { 
      id: 'london', 
      name: 'London Bridge', 
      mood: 'curious', 
      count: 22, 
      description: 'Thoughtful purple',
      country: 'United Kingdom',
      coordinates: { top: '30%', left: '50%' }
    },
    { 
      id: 'paris', 
      name: 'Eiffel Tower', 
      mood: 'grateful', 
      count: 31, 
      description: 'Warm pink',
      country: 'France',
      coordinates: { top: '32%', left: '52%' }
    },
    { 
      id: 'mumbai', 
      name: 'Mumbai Central', 
      mood: 'excited', 
      count: 67, 
      description: 'Vibrant orange',
      country: 'India',
      coordinates: { top: '45%', left: '72%' }
    },
  ];

  const getMoodEmoji = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(m => m.id === mood);
    return moodOption?.emoji || '😊';
  };

  const getTopMoods = () => {
    if (!globalStats) return [];
    
    return globalStats
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)
      .map((stat: any) => ({
        ...stat,
        percentage: Math.round((stat.count / 1000) * 100), // Mock calculation
      }));
  };

  const getRegionalTrends = () => {
    const regions = [
      {
        name: 'North America',
        description: 'Morning Energy',
        moods: [
          { mood: 'motivated', flex: 2 },
          { mood: 'happy', flex: 2 },
          { mood: 'curious', flex: 1 },
        ]
      },
      {
        name: 'Asia Pacific',
        description: 'Evening Calm',
        moods: [
          { mood: 'calm', flex: 2 },
          { mood: 'grateful', flex: 2 },
          { mood: 'happy', flex: 1 },
        ]
      },
      {
        name: 'Europe',
        description: 'Reflective Afternoon',
        moods: [
          { mood: 'reflective', flex: 2 },
          { mood: 'peaceful', flex: 1.5 },
          { mood: 'curious', flex: 1 },
        ]
      },
    ];
    return regions;
  };

  const filteredLocations = mockLocations.filter(location =>
    !searchCountry || location.country.toLowerCase().includes(searchCountry.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Global Mood Map</h2>
      
      {/* Search */}
      <div className="mb-4">
        <Input
          placeholder="Search by country..."
          value={searchCountry}
          onChange={(e) => setSearchCountry(e.target.value)}
          className="bg-input border-border"
          data-testid="input-search-country"
        />
      </div>
      
      {/* Interactive World Map */}
      <Card className="glassmorphism border-0">
        <CardContent className="pt-6">
          <div className="h-80 relative overflow-hidden rounded-xl bg-gradient-to-br from-mood-calm/20 to-mood-motivated/20">
            {/* Stylized world map with mood indicators */}
            <div className="w-full h-full relative">
              {/* Mood hotspots */}
              {filteredLocations.map((location) => (
                <Button
                  key={location.id}
                  variant="ghost"
                  size="icon"
                  className={`absolute w-4 h-4 p-0 bg-mood-${location.mood} rounded-full animate-pulse-slow hover:scale-150 transition-transform`}
                  style={location.coordinates}
                  onClick={() => setSelectedRegion(location.country)}
                  data-testid={`mood-hotspot-${location.id}`}
                >
                  <span className="sr-only">{location.name}</span>
                </Button>
              ))}
              
              {/* Map overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <i className="fas fa-globe-americas text-6xl text-primary/30 mb-4"></i>
                  <p className="text-sm text-muted-foreground">
                    Tap mood hotspots to explore
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Mood Check-ins */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Live Mood Check-ins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLocations.map((location) => (
              <div key={location.id} className="flex items-center space-x-3 p-3 bg-secondary rounded-lg">
                <div className={`w-3 h-3 bg-mood-${location.mood} rounded-full animate-pulse`}></div>
                <div className="flex-1">
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {location.count} {location.mood} posts • {location.description}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary hover:text-primary/80"
                  onClick={() => setSelectedRegion(location.country)}
                  data-testid={`button-explore-${location.id}`}
                >
                  <i className="fas fa-arrow-right"></i>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Mood Trends */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Global Mood Pulse</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingGlobal ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {getTopMoods().map((mood: any) => (
                <div key={mood.mood} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getMoodEmoji(mood.mood)}</span>
                    <span className="capitalize font-medium">{mood.mood}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div 
                        className={`bg-mood-${mood.mood} h-2 rounded-full transition-all duration-500`}
                        style={{width: `${mood.percentage}%`}}
                      ></div>
                    </div>
                    <span className="text-sm text-muted-foreground min-w-[3rem]">
                      {mood.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mood Trends by Region */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>Regional Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getRegionalTrends().map((region) => (
              <div key={region.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{region.name}</span>
                  <span className="text-sm text-muted-foreground">{region.description}</span>
                </div>
                <div className="flex space-x-1 h-2 rounded-full overflow-hidden">
                  {region.moods.map((moodData, index) => (
                    <div 
                      key={index}
                      className={`bg-mood-${moodData.mood} transition-all duration-500`}
                      style={{flex: moodData.flex}}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mood Timeline */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle>24-Hour Mood Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Dawn (6 AM)</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-mood-peaceful rounded-full"></div>
                <span>Peaceful</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Morning (9 AM)</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-mood-motivated rounded-full"></div>
                <span>Motivated</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Afternoon (2 PM)</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-mood-happy rounded-full"></div>
                <span>Happy</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Evening (8 PM)</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-mood-grateful rounded-full"></div>
                <span>Grateful</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Night (11 PM)</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-mood-reflective rounded-full"></div>
                <span>Reflective</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Region Details */}
      {selectedRegion && (
        <Card className="glassmorphism border-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Exploring: {selectedRegion}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedRegion(null)}
                data-testid="button-close-region"
              >
                <i className="fas fa-times"></i>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRegional ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Current mood trends and cultural insights from {selectedRegion}
                </p>
                
                {filteredLocations
                  .filter(loc => loc.country === selectedRegion)
                  .map((location) => (
                    <div key={location.id} className="p-3 bg-secondary rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg">{getMoodEmoji(location.mood)}</span>
                        <span className="font-medium">{location.name}</span>
                        <Badge className={`bg-mood-${location.mood} text-black`}>
                          {location.count} posts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Local community is feeling {location.mood} - {location.description}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
