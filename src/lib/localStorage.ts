// Local storage utility for managing user progress
export interface ActivityProgress {
  [activityId: string]: boolean | number[]; // boolean for simple complete, number[] for steps/cards
}

export interface UserProgress {
  lessonId: string;
  percent: number;
  lastActivity?: string;
  lastStep?: number;
  activityProgress?: ActivityProgress;
}

const PROGRESS_KEY = 'copilot_user_progress';
const USER_KEY = 'copilot_current_user';

export const progressStorage = {
  // Get all progress for a user
  getProgress: (userId: string): UserProgress[] => {
    try {
      const stored = localStorage.getItem(`${PROGRESS_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading progress from localStorage:', error);
      return [];
    }
  },

  // Save progress for a specific lesson
  saveProgress: (userId: string, lessonProgress: UserProgress): void => {
    try {
      const allProgress = progressStorage.getProgress(userId);
      const existingIndex = allProgress.findIndex(p => p.lessonId === lessonProgress.lessonId);
      
      if (existingIndex >= 0) {
        allProgress[existingIndex] = lessonProgress;
      } else {
        allProgress.push(lessonProgress);
      }
      
      localStorage.setItem(`${PROGRESS_KEY}_${userId}`, JSON.stringify(allProgress));
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  },

  // Clear all progress for a user
  clearProgress: (userId: string): void => {
    try {
      localStorage.removeItem(`${PROGRESS_KEY}_${userId}`);
    } catch (error) {
      console.error('Error clearing progress from localStorage:', error);
    }
  },

  // Get progress for a specific lesson
  getLessonProgress: (userId: string, lessonId: string): UserProgress | null => {
    const allProgress = progressStorage.getProgress(userId);
    return allProgress.find(p => p.lessonId === lessonId) || null;
  }
};

export const userStorage = {
  // Save current user data
  saveCurrentUser: (userData: any): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  },

  // Get current user data
  getCurrentUser: (): any | null => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
      return null;
    }
  },

  // Clear current user
  clearCurrentUser: (): void => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing user from localStorage:', error);
    }
  }
};
