import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOOD_OPTIONS } from "@/types";

interface MoodSelectorProps {
  onMoodSelect: (mood: string) => void;
  selectedMood: string | null;
}

export function MoodSelector({ onMoodSelect, selectedMood }: MoodSelectorProps) {
  return (
    <Card className="glassmorphism border-0">
      <CardHeader>
        <CardTitle>How are you feeling?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {MOOD_OPTIONS.slice(0, 6).map((mood) => (
            <button
              key={mood.id}
              className={`mood-card glassmorphism p-4 rounded-xl text-center transition-all ${
                selectedMood === mood.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onMoodSelect(mood.id)}
              data-testid={`mood-${mood.id}`}
            >
              <div className="text-2xl mb-2">{mood.emoji}</div>
              <div className={`text-sm font-medium ${mood.color}`}>{mood.name}</div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
