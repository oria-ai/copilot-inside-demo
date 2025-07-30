// Simple progress tracking - single source of truth
export interface ModuleProgress {
  [moduleId: string]: {
    [activityKey: string]: boolean; // lesson1_video, lesson1_tutor, lesson2_prompt, etc.
  };
}

export interface Assignment {
  id: string;
  title: string;
  prompt: string;
  feedback: string;
  status: 'completed' | 'pending' | 'graded';
  lessonId: string;
  submittedAt: string;
  grade?: number;
}

const PROGRESS_KEY = 'copilot_demo_progress_v1';
const USER_KEY = 'copilot_current_user';
const ASSIGNMENTS_KEY = 'copilot_user_assignments';

// Define all activities for each module - this is our schema
const MODULE_SCHEMA = {
  basics: [
    'lesson1_video',
    'lesson1_tutor', 
    'lesson2_video',
    'lesson2_prompt',
    'lesson2_conclusion'
  ],
  word: [
    'lesson1_video',
    'lesson1_chat',
    'lesson1_tutor2',
    'lesson2_video', 
    'lesson2_file',
    'lesson2_conclusion'
  ],
  excel: [
    'lesson1_video',
    'lesson1_chat',
    'lesson2_video',
    'lesson2_file',
    'lesson2_conclusion'
  ]
};

export const progressStorage = {
  // Get progress for a user - returns initialized structure if none exists
  getProgress: (userId: string): ModuleProgress => {
    try {
      const stored = localStorage.getItem(`${PROGRESS_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Initialize with all activities as false
      const initialProgress: ModuleProgress = {};
      Object.entries(MODULE_SCHEMA).forEach(([moduleId, activities]) => {
        initialProgress[moduleId] = {};
        activities.forEach(activityKey => {
          initialProgress[moduleId][activityKey] = false;
        });
      });
      
      return initialProgress;
    } catch (error) {
      console.error('Error reading progress from localStorage:', error);
      return {};
    }
  },

  // Mark a single activity as completed
  markCompleted: (userId: string, moduleId: string, activityKey: string): void => {
    try {
      const progress = progressStorage.getProgress(userId);
      if (!progress[moduleId]) {
        progress[moduleId] = {};
      }
      progress[moduleId][activityKey] = true;
      localStorage.setItem(`${PROGRESS_KEY}_${userId}`, JSON.stringify(progress));
      console.log(`✅ Marked completed: ${moduleId}.${activityKey}`);
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  },

  // Get completion status for a specific activity
  isCompleted: (userId: string, moduleId: string, activityKey: string): boolean => {
    const progress = progressStorage.getProgress(userId);
    return progress[moduleId]?.[activityKey] || false;
  },

  // Get module completion percentage
  getModuleProgress: (userId: string, moduleId: string): number => {
    const progress = progressStorage.getProgress(userId);
    const moduleActivities = MODULE_SCHEMA[moduleId as keyof typeof MODULE_SCHEMA] || [];
    if (moduleActivities.length === 0) return 0;
    
    const completedCount = moduleActivities.filter(activityKey => 
      progress[moduleId]?.[activityKey] || false
    ).length;
    
    return Math.round((completedCount / moduleActivities.length) * 100);
  },

  // Get overall progress across all modules
  getOverallProgress: (userId: string): number => {
    const moduleIds = Object.keys(MODULE_SCHEMA);
    const totalProgress = moduleIds.reduce((sum, moduleId) => 
      sum + progressStorage.getModuleProgress(userId, moduleId), 0
    );
    return Math.round(totalProgress / moduleIds.length);
  },

  // Clear all progress for a user
  clearProgress: (userId: string): void => {
    try {
      localStorage.removeItem(`${PROGRESS_KEY}_${userId}`);
    } catch (error) {
      console.error('Error clearing progress from localStorage:', error);
    }
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

export const assignmentStorage = {
  // Get all assignments for a user
  getAssignments: (userId: string): Assignment[] => {
    try {
      const stored = localStorage.getItem(`${ASSIGNMENTS_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading assignments from localStorage:', error);
      return [];
    }
  },

  // Save a new assignment
  saveAssignment: (userId: string, assignment: Assignment): void => {
    try {
      const allAssignments = assignmentStorage.getAssignments(userId);
      const existingIndex = allAssignments.findIndex(a => a.id === assignment.id);
      
      if (existingIndex >= 0) {
        allAssignments[existingIndex] = assignment;
      } else {
        allAssignments.push(assignment);
      }
      
      localStorage.setItem(`${ASSIGNMENTS_KEY}_${userId}`, JSON.stringify(allAssignments));
    } catch (error) {
      console.error('Error saving assignment to localStorage:', error);
    }
  },

  // Clear all assignments for a user
  clearAssignments: (userId: string): void => {
    try {
      localStorage.removeItem(`${ASSIGNMENTS_KEY}_${userId}`);
    } catch (error) {
      console.error('Error clearing assignments from localStorage:', error);
    }
  }
};
