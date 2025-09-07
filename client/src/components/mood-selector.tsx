import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOOD_OPTIONS } from "@/types";

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
  selectedMood: string | null;
}

export function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  return (
    <Card className="glassmorphism border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          How are you feeling?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {MOOD_OPTIONS.slice(0, 6).map((mood) => (
            <button
              key={mood.id}
              className={`mood-card group relative p-5 rounded-2xl text-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 btn-interactive ${
                selectedMood === mood.id 
                  ? `${mood.bgClass} ring-4 ring-white/50 shadow-2xl animate-pulse` 
                  : 'glassmorphism hover:shadow-xl hover:ring-2 hover:ring-white/30'
              }`}
              onClick={() => onMoodSelect(mood.id)}
              data-testid={`mood-${mood.id}`}
            >
              {selectedMood !== mood.id && (
                <div className={`absolute inset-0 ${mood.bgClass} opacity-20 rounded-2xl transition-opacity group-hover:opacity-40`}></div>
              )}
              <div className="relative z-10">
                <div className={`text-3xl mb-3 drop-shadow-lg transition-all duration-300 ${
                  selectedMood === mood.id ? 'animate-bounce' : 'group-hover:scale-125'
                }`}>
                  {mood.emoji}
                </div>
                <div className={`text-sm font-semibold transition-all duration-300 ${
                  selectedMood === mood.id ? 'text-white font-bold' : `${mood.color} group-hover:font-bold`
                } drop-shadow-sm`}>
                  {mood.name}
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
