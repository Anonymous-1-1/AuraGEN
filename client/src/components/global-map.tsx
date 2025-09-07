
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { MOOD_OPTIONS } from "@/types";
import { ShareButton } from "./share-button";

export function GlobalMap() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
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

  const continents = [
    {
      name: 'North America',
      countries: ['United States', 'Canada', 'Mexico'],
      topMood: 'motivated',
      coordinates: { top: '25%', left: '20%' },
      size: 'large'
    },
    {
      name: 'South America', 
      countries: ['Brazil', 'Argentina', 'Chile'],
      topMood: 'excited',
      coordinates: { top: '50%', left: '30%' },
      size: 'medium'
    },
    {
      name: 'Europe',
      countries: ['United Kingdom', 'France', 'Germany', 'Spain', 'Italy'],
      topMood: 'curious',
      coordinates: { top: '25%', left: '50%' },
      size: 'medium'
    },
    {
      name: 'Africa',
      countries: ['Nigeria', 'South Africa', 'Egypt'],
      topMood: 'grateful',
      coordinates: { top: '45%', left: '55%' },
      size: 'large'
    },
    {
      name: 'Asia',
      countries: ['China', 'India', 'Japan', 'South Korea'],
      topMood: 'calm',
      coordinates: { top: '30%', left: '75%' },
      size: 'large'
    },
    {
      name: 'Oceania',
      countries: ['Australia', 'New Zealand'],
      topMood: 'peaceful',
      coordinates: { top: '70%', left: '80%' },
      size: 'small'
    }
  ];

  const mockLocations = [
    { 
      id: 'nyc', 
      name: 'New York City', 
      mood: 'motivated', 
      count: 234, 
      description: 'Morning energy surge',
      country: 'United States',
      continent: 'North America',
      coordinates: { top: '28%', left: '25%' }
    },
    { 
      id: 'london', 
      name: 'London', 
      mood: 'curious', 
      count: 189, 
      description: 'Afternoon contemplation',
      country: 'United Kingdom',
      continent: 'Europe',
      coordinates: { top: '27%', left: '50%' }
    },
    { 
      id: 'tokyo', 
      name: 'Tokyo', 
      mood: 'calm', 
      count: 156, 
      description: 'Evening tranquility',
      country: 'Japan',
      continent: 'Asia',
      coordinates: { top: '32%', left: '85%' }
    },
    { 
      id: 'sydney', 
      name: 'Sydney', 
      mood: 'peaceful', 
      count: 92, 
      description: 'Dawn serenity',
      country: 'Australia',
      continent: 'Oceania',
      coordinates: { top: '75%', left: '85%' }
    },
    { 
      id: 'sao-paulo', 
      name: 'São Paulo', 
      mood: 'excited', 
      count: 167, 
      description: 'Vibrant nightlife',
      country: 'Brazil',
      continent: 'South America',
      coordinates: { top: '55%', left: '32%' }
    },
    { 
      id: 'cairo', 
      name: 'Cairo', 
      mood: 'grateful', 
      count: 98, 
      description: 'Ancient wisdom',
      country: 'Egypt',
      continent: 'Africa',
      coordinates: { top: '35%', left: '55%' }
    }
  ];

  const getMoodEmoji = (mood: string) => {
    const moodOption = MOOD_OPTIONS.find(m => m.id === mood);
    return moodOption?.emoji || '😊';
  };

  const getTopMoods = () => {
    if (!globalStats) {
      // Mock data if no real stats
      return [
        { mood: 'happy', count: 1234, percentage: 28 },
        { mood: 'calm', count: 987, percentage: 22 },
        { mood: 'motivated', count: 856, percentage: 19 },
        { mood: 'grateful', count: 643, percentage: 15 },
        { mood: 'excited', count: 567, percentage: 13 }
      ];
    }
    
    return globalStats
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5)
      .map((stat: any) => ({
        ...stat,
        percentage: Math.round((stat.count / 1000) * 100),
      }));
  };

  const filteredLocations = mockLocations.filter(location =>
    (!searchCountry || location.country.toLowerCase().includes(searchCountry.toLowerCase())) &&
    (!selectedContinent || location.continent === selectedContinent)
  );

  const filteredContinents = continents.filter(continent =>
    !searchCountry || continent.countries.some(country => 
      country.toLowerCase().includes(searchCountry.toLowerCase())
    )
  );

  const handleShareGlobalMap = () => {
    const topMood = getTopMoods()[0];
    return {
      postId: 'global-map',
      content: `The world is feeling ${topMood?.mood || 'happy'} right now! Check out the global mood map to see how people around the world are sharing their auras.`,
      mood: topMood?.mood || 'happy',
      userName: 'Aura Global Community'
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Global Mood Map</h2>
        <ShareButton 
          {...handleShareGlobalMap()}
          variant="outline"
          className="ml-auto"
        />
      </div>
      
      {/* Search and Filters */}
      <div className="space-y-3">
        <Input
          placeholder="Search by country..."
          value={searchCountry}
          onChange={(e) => setSearchCountry(e.target.value)}
          className="bg-input border-border"
          data-testid="input-search-country"
        />
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedContinent === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedContinent(null)}
          >
            All Continents
          </Button>
          {continents.map((continent) => (
            <Button
              key={continent.name}
              variant={selectedContinent === continent.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedContinent(continent.name)}
              className={`bg-mood-${continent.topMood}/20`}
            >
              {continent.name}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Interactive 3D-style Globe */}
      <Card className="glassmorphism border-0 shadow-xl">
        <CardContent className="pt-6">
          <div className="h-96 relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-blue-900/20 to-indigo-900/30">
            {/* Globe background with grid */}
            <div className="absolute inset-0">
              <div className="w-full h-full relative bg-gradient-radial from-blue-500/10 via-transparent to-slate-900/50">
                {/* Grid lines for globe effect */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={`lat-${i}`}
                    className="absolute w-full border-t border-blue-400/20"
                    style={{ top: `${12.5 * i}%` }}
                  />
                ))}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`lng-${i}`}
                    className="absolute h-full border-l border-blue-400/20"
                    style={{ left: `${8.33 * i}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Continent mood indicators */}
            {filteredContinents.map((continent) => (
              <div
                key={continent.name}
                className={`absolute cursor-pointer transition-all duration-300 hover:scale-125 ${
                  continent.size === 'large' ? 'w-16 h-16' : 
                  continent.size === 'medium' ? 'w-12 h-12' : 'w-8 h-8'
                }`}
                style={continent.coordinates}
                onClick={() => setSelectedContinent(continent.name)}
              >
                <div className={`w-full h-full rounded-full bg-mood-${continent.topMood} opacity-70 animate-pulse-slow flex items-center justify-center`}>
                  <span className="text-white font-bold text-xs">
                    {getMoodEmoji(continent.topMood)}
                  </span>
                </div>
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white bg-black/50 px-2 py-1 rounded whitespace-nowrap">
                  {continent.name}
                </div>
              </div>
            ))}
            
            {/* City mood hotspots */}
            {filteredLocations.map((location) => (
              <Button
                key={location.id}
                variant="ghost"
                size="icon"
                className={`absolute w-3 h-3 p-0 bg-mood-${location.mood} rounded-full animate-pulse hover:scale-150 transition-all duration-300 hover:z-10`}
                style={location.coordinates}
                onClick={() => setSelectedRegion(location.country)}
                data-testid={`mood-hotspot-${location.id}`}
                title={`${location.name}: ${location.count} ${location.mood} posts`}
              >
                <span className="sr-only">{location.name}</span>
              </Button>
            ))}
            
            {/* Center glow effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-radial from-blue-400/30 to-transparent rounded-full animate-pulse-slow"></div>
          </div>
        </CardContent>
      </Card>

      {/* Live Mood Check-ins */}
      <Card className="glassmorphism border-0">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Mood Check-ins</span>
            <Badge variant="secondary">
              {filteredLocations.reduce((sum, loc) => sum + loc.count, 0)} active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {filteredLocations.map((location) => (
              <div key={location.id} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors">
                <div className={`w-4 h-4 bg-mood-${location.mood} rounded-full animate-pulse`}></div>
                <div className="flex-1">
                  <div className="font-medium">{location.name}, {location.country}</div>
                  <div className="text-sm text-muted-foreground">
                    {location.count} people feeling {location.mood} • {location.description}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <ShareButton
                    postId={location.id}
                    content={`People in ${location.name} are feeling ${location.mood}! ${location.description}`}
                    mood={location.mood}
                    userName={`${location.name} Community`}
                    variant="ghost"
                    size="sm"
                  />
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Mood Pulse */}
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
