import { useState, useEffect, useCallback } from 'react';

interface UserProgress {
  lessonId: string;
  percent: number;
  lastActivity?: string;
  lastStep?: number;
}

interface Lesson {
  id: string;
  title: string;
  video: string;
  videoTitle: string;
  activities: { id: string; title: string }[];
}

interface ModuleData {
  title: string;
  lessons: Lesson[];
}

interface UseModuleProgressProps {
  moduleId: string;
  userId: string;
  moduleData: Record<string, ModuleData>;
}

export function useModuleProgress({ moduleId, userId, moduleData }: UseModuleProgressProps) {
  const [lessonState, setLessonState] = useState<{ lessonId: string; activityId: string }>({ lessonId: '', activityId: '' });
  const [expandedLesson, setExpandedLesson] = useState('');
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentModule = moduleData[moduleId as keyof typeof moduleData];
  const api = 'http://localhost:4000';

  // Fetch user progress and resume position from backend
  const fetchProgress = useCallback(async () => {
    if (!userId || !moduleId) return;
    
    try {
      const response = await fetch(`${api}/progress/${userId}/${moduleId}`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      
      const data = await response.json();
      setUserProgress(data);
      
      // Only set lesson state if we have a last activity and it's different from current
      if (data.lastActivity && 
          (data.lastActivity !== currentModule.lessons.find(l => l.id === data.lastActivity)?.id || 
           data.lastStep !== lessonState.activityId)) {
        const lastLesson = currentModule.lessons.find(l => l.id === data.lastActivity);
        if (lastLesson) {
          setLessonState({ lessonId: lastLesson.id, activityId: data.lastStep || 'video' });
          setExpandedLesson(lastLesson.id);
        }
      } else {
        // No saved position, start at first lesson's video
        const firstLesson = currentModule.lessons[0];
        const videoActivity = firstLesson.activities.find(a => a.id === 'video');
        if (videoActivity) {
          setLessonState({ lessonId: firstLesson.id, activityId: 'video' });
          setExpandedLesson(firstLesson.id);
        } else {
          setLessonState({ lessonId: firstLesson.id, activityId: firstLesson.activities[0].id });
          setExpandedLesson(firstLesson.id);
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, moduleId, currentModule.lessons, lessonState.activityId]);

  // Only fetch progress on initial load and when moduleId changes
  useEffect(() => {
    if (moduleId && userId) {
      fetchProgress();
    }
  }, [moduleId, userId, fetchProgress]);

  // Save current position whenever user navigates
  useEffect(() => {
    if (!lessonState.lessonId || !lessonState.activityId || isLoading) return;
    
    const savePosition = async () => {
      try {
        const currentProgress = userProgress.find(p => p.lessonId === lessonState.lessonId)?.percent || 0;
        await fetch(`${api}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            lessonId: lessonState.lessonId,
            percent: currentProgress,
            lastActivity: lessonState.activityId,
            lastStep: 1
          })
        });
        // Do not fetch user progress here to avoid infinite loop
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    };
    
    savePosition();
  }, [lessonState.lessonId, lessonState.activityId, isLoading, userId]);

  // Helpers
  const getActivityProgress = useCallback((lessonId: string, activityId: string) => {
    const progress = userProgress.find((p) => p.lessonId === lessonId)?.percent ?? 0;
    if (activityId === 'video') return progress >= 50 ? 100 : progress;
    if (activityId === 'tutor') {
      if (progress >= 90) return 100;
      if (progress > 50) return ((progress - 50) / 40) * 100;
      return 0;
    }
    if (activityId === 'conclusion') return progress === 100 ? 100 : 0;
    return 0;
  }, [userProgress]);

  const getModuleProgress = useCallback(() => {
    if (!userProgress.length) return 0;
    const totalLessons = currentModule.lessons.length;
    const total = userProgress.reduce((sum, p) => sum + (p.percent || 0), 0);
    return Math.round((total / (totalLessons * 100)) * 100);
  }, [userProgress, currentModule]);

  const setLessonAndDefaultActivity = useCallback((lessonId: string) => {
    const lesson = currentModule.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    const videoActivity = lesson.activities.find(a => a.id === 'video');
    if (videoActivity) {
      setLessonState({ lessonId, activityId: 'video' });
    } else {
      setLessonState({ lessonId, activityId: lesson.activities[0].id });
    }
  }, [currentModule.lessons]);

  const setLessonAndActivity = useCallback((lessonId: string, activityId: string) => {
    setLessonState({ lessonId, activityId });
  }, []);

  const getNextActivity = useCallback((lessonId: string, activityId: string) => {
    const lessonIdx = currentModule.lessons.findIndex(l => l.id === lessonId);
    const lesson = currentModule.lessons[lessonIdx];
    const actIdx = lesson.activities.findIndex(a => a.id === activityId);
    if (actIdx < lesson.activities.length - 1) {
      return { lessonId, activityId: lesson.activities[actIdx + 1].id };
    }
    if (lessonIdx < currentModule.lessons.length - 1) {
      const nextLesson = currentModule.lessons[lessonIdx + 1];
      return { lessonId: nextLesson.id, activityId: nextLesson.activities[0].id };
    }
    return null;
  }, [currentModule.lessons]);

  return {
    lessonState,
    setLessonState,
    expandedLesson,
    setExpandedLesson,
    userProgress,
    isLoading,
    getActivityProgress,
    getModuleProgress,
    setLessonAndDefaultActivity,
    setLessonAndActivity,
    getNextActivity,
    currentModule,
  };
} 