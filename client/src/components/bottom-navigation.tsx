import { Button } from "@/components/ui/button";
import { TAB_OPTIONS } from "@/types";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="glassmorphism fixed bottom-0 w-full p-4 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {TAB_OPTIONS.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={() => onTabChange(tab.id)}
            data-testid={`tab-${tab.id}`}
          >
            <i className={`${tab.icon} text-lg`}></i>
            <span className="text-xs">{tab.name}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
