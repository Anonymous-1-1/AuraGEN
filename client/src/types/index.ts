export interface MoodOption {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgClass: string;
}

export const MOOD_OPTIONS: MoodOption[] = [
  { id: 'happy', name: 'Happy', emoji: '✨', color: 'text-mood-happy', bgClass: 'mood-happy-bg' },
  { id: 'stressed', name: 'Stressed', emoji: '🌪️', color: 'text-mood-stressed', bgClass: 'mood-stressed-bg' },
  { id: 'calm', name: 'Calm', emoji: '🌙', color: 'text-mood-calm', bgClass: 'mood-calm-bg' },
  { id: 'motivated', name: 'Motivated', emoji: '🚀', color: 'text-mood-motivated', bgClass: 'mood-motivated-bg' },
  { id: 'curious', name: 'Curious', emoji: '🔍', color: 'text-mood-curious', bgClass: 'mood-curious-bg' },
  { id: 'grateful', name: 'Grateful', emoji: '🌸', color: 'text-mood-grateful', bgClass: 'mood-grateful-bg' },
  { id: 'excited', name: 'Excited', emoji: '🎉', color: 'text-mood-excited', bgClass: 'mood-excited-bg' },
  { id: 'peaceful', name: 'Peaceful', emoji: '🕊️', color: 'text-mood-peaceful', bgClass: 'mood-peaceful-bg' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡', color: 'text-mood-energetic', bgClass: 'mood-energetic-bg' },
  { id: 'reflective', name: 'Reflective', emoji: '🌅', color: 'text-mood-reflective', bgClass: 'mood-reflective-bg' },
];

export interface TabOption {
  id: string;
  name: string;
  icon: string;
}

export const TAB_OPTIONS: TabOption[] = [
  { id: 'home', name: 'Home', icon: 'fas fa-home' },
  { id: 'capsules', name: 'Capsules', icon: 'fas fa-archive' },
  { id: 'map', name: 'Map', icon: 'fas fa-globe' },
  { id: 'tree', name: 'Tree', icon: 'fas fa-tree' },
  { id: 'whisper', name: 'Whisper', icon: 'fas fa-user-secret' },
];

export interface PostWithUser {
  id: string;
  content: string;
  mood: string;
  imageUrl?: string;
  musicUrl?: string;
  musicTitle?: string;
  location?: string;
  isAnonymous: boolean;
  createdAt: string;
  user?: {
    id: string;
    displayName?: string;
    profileImageUrl?: string;
  };
  vibes?: Array<{
    id: string;
    type: string;
    userId: string;
  }>;
}

export interface TimeCapsuleWithUser {
  id: string;
  content: string;
  mood: string;
  imageUrl?: string;
  musicUrl?: string;
  musicTitle?: string;
  unlockDate: string;
  isPublic: boolean;
  isOpened: boolean;
  openedAt?: string;
  createdAt: string;
  user?: {
    id: string;
    displayName?: string;
  };
}

export interface GlobalMoodStat {
  id: string;
  mood: string;
  country?: string;
  region?: string;
  count: number;
  percentage?: number;
  date: string;
}

export interface AuraActivity {
  id: string;
  type: string;
  points: number;
  description?: string;
  createdAt: string;
}
