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
              className={`mood-card group relative p-5 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                selectedMood === mood.id 
                  ? `${mood.bgClass} ring-4 ring-white/50 shadow-2xl` 
                  : 'glassmorphism hover:shadow-xl'
              }`}
              onClick={() => onMoodSelect(mood.id)}
              data-testid={`mood-${mood.id}`}
            >
              {selectedMood !== mood.id && (
                <div className={`absolute inset-0 ${mood.bgClass} opacity-20 rounded-2xl transition-opacity group-hover:opacity-40`}></div>
              )}
              <div className="relative z-10">
                <div className="text-3xl mb-3 drop-shadow-lg">{mood.emoji}</div>
                <div className={`text-sm font-semibold ${selectedMood === mood.id ? 'text-white' : mood.color} drop-shadow-sm`}>
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
