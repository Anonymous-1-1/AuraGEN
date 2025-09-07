
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onQuickShare: () => void;
  onQuickVibe: () => void;
}

export function FloatingActionButton({ onQuickShare, onQuickVibe }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-5">
          <Button
            onClick={onQuickShare}
            className="w-12 h-12 rounded-full bg-purple-500 hover:bg-purple-600 shadow-lg transform transition-all duration-200 hover:scale-110"
          >
            <i className="fas fa-share text-white"></i>
          </Button>
          <Button
            onClick={onQuickVibe}
            className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 shadow-lg transform transition-all duration-200 hover:scale-110"
          >
            <i className="fas fa-heart text-white"></i>
          </Button>
        </div>
      )}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl transform transition-all duration-300 ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
        }`}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-plus'} text-white text-xl`}></i>
      </Button>
    </div>
  );
}
