import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import VideoLesson from '@/components/VideoLesson';
import ClickTutor from '@/components/ClickTutor';
import PromptTask from '@/components/PromptTask';
import FileTask from '@/components/FileTask';
import Conclusion from '@/components/Conclusion';
import ModuleSidebar from '@/components/ModuleSidebar';

interface ModuleViewProps {
  moduleId: string;
  userId: string;
  onBack: () => void;
}

const api = 'http://localhost:4000';

// 1. Define a type for user progress
interface UserProgress {
  lessonId: string;
  percent: number;
  lastActivity?: string;
  lastStep?: number;
}

const ModuleView = ({ moduleId, userId, onBack }: ModuleViewProps) => {
  const [lessonState, setLessonState] = useState<{ lessonId: string; activityId: string }>({ lessonId: '', activityId: '' });
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const moduleData = {
    basics: {
      title: 'יסודות',
      lessons: [
        {
          id: 'lesson1',
          title: 'שיעור ראשון',
          video: 'https://player.vimeo.com/video/1086753235?badge=0&autopause=0&player_id=0&app_id=58479',
          videoTitle: 'Intro To Copilot',
          activities: [
            { id: 'video', title: 'סרטון', completed: true },
            { id: 'tutor', title: 'מדריך אינטראקטיבי', completed: true },
            { id: 'conclusion', title: 'סיכום', completed: false }
          ]
        },
        {
          id: 'lesson2',
          title: 'שיעור שני',
          video: 'https://player.vimeo.com/video/1088062270?badge=0&autopause=0&player_id=0&app_id=58479',
          videoTitle: 'Prompt Enigneering',
          activities: [
            { id: 'video', title: 'סרטון', completed: false },
            { id: 'prompt', title: 'משימת הקלדה', completed: false },
            { id: 'conclusion', title: 'סיכום', completed: false }
          ]
        },
        {
          id: 'lesson3',
          title: 'שיעור שלישי',
          video: 'https://player.vimeo.com/video/1090416363?badge=0&autopause=0&player_id=0&app_id=58479',
          videoTitle: 'Word 1 Restored Final',
          activities: [
            { id: 'video', title: 'סרטון', completed: false },
            { id: 'file', title: 'משימת קובץ', completed: false },
            { id: 'conclusion', title: 'סיכום', completed: false }
          ]
        }
      ]
    }
  };

  const currentModule = moduleData[moduleId as keyof typeof moduleData];

  const handleActivityComplete = useCallback(async (
    lessonId: string,
    progress: number,
    understandingRating?: number,
    activityId?: string,
    step?: number
  ) => {
    await fetch(`${api}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, percent: progress, lastActivity: activityId, lastStep: step })
    });
    // Refresh progress
    const res = await fetch(`${api}/progress/${userId}`);
    if (res.ok) {
      const data = await res.json();
      setUserProgress(data);
    }
  }, [userId]);

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true);
      const res = await fetch(`${api}/progress/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserProgress(data);
        
        // Find last position from progress data
        const progressWithActivity = data.find(p => p.lastActivity && p.lastActivity !== '');
        if (progressWithActivity) {
          // Resume from last position
          setLessonState({ 
            lessonId: progressWithActivity.lessonId, 
            activityId: progressWithActivity.lastActivity 
          });
        } else {
          // No saved position, start at first lesson's video
          const firstLesson = currentModule.lessons[0];
          const videoActivity = firstLesson.activities.find(a => a.id === 'video');
          if (videoActivity) {
            setLessonState({ lessonId: firstLesson.id, activityId: 'video' });
          } else {
            setLessonState({ lessonId: firstLesson.id, activityId: firstLesson.activities[0].id });
          }
        }
      }
      setIsLoading(false);
    };
    fetchProgress();
  }, [userId]);

  const getActivityProgress = (lessonId: string, activityId: string) => {
    const progress = userProgress.find((p) => p.lessonId === lessonId)?.percent ?? 0;
    if (activityId === 'video') return progress >= 50 ? 100 : progress;
    if (activityId === 'tutor') {
      if (progress >= 90) return 100;
      if (progress > 50) return ((progress - 50) / 40) * 100;
      return 0;
    }
    if (activityId === 'prompt') {
      if (progress >= 90) return 100;
      if (progress > 50) return ((progress - 50) / 40) * 100;
      return 0;
    }
    if (activityId === 'conclusion') return progress === 100 ? 100 : 0;
    return 0;
  };

  const isActivityCompleted = (lessonId: string, activityId: string) => getActivityProgress(lessonId, activityId) === 100;

  const getModuleProgress = () => {
    if (!userProgress.length) return 0;
    const totalLessons = currentModule.lessons.length;
    const total = userProgress.reduce((sum, p) => sum + (p.percent || 0), 0);
    return Math.round((total / (totalLessons * 100)) * 100);
  };

  useEffect(() => {
    const goToConclusionHandler = (_e: Event) => {
      setLessonState(prev => ({ ...prev, activityId: 'conclusion' }));
    };
    window.addEventListener('goToConclusion', goToConclusionHandler);
    return () => window.removeEventListener('goToConclusion', goToConclusionHandler);
  }, []);

  const getNextActivity = (lessonId: string, activityId: string) => {
    const lessonIdx = currentModule.lessons.findIndex(l => l.id === lessonId);
    const lesson = currentModule.lessons[lessonIdx];
    const actIdx = lesson.activities.findIndex(a => a.id === activityId);
    // Next activity in the same lesson
    if (actIdx < lesson.activities.length - 1) {
      return { lessonId, activityId: lesson.activities[actIdx + 1].id };
    }
    // First activity of next lesson
    if (lessonIdx < currentModule.lessons.length - 1) {
      const nextLesson = currentModule.lessons[lessonIdx + 1];
      return { lessonId: nextLesson.id, activityId: nextLesson.activities[0].id };
    }
    // No more activities
    return null;
  };

  const setLessonAndDefaultActivity = (lessonId: string) => {
    const lesson = currentModule.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    const videoActivity = lesson.activities.find(a => a.id === 'video');
    if (videoActivity) {
      setLessonState({ lessonId, activityId: 'video' });
    } else {
      setLessonState({ lessonId, activityId: lesson.activities[0].id });
    }
  };

  const setLessonAndActivity = (lessonId: string, activityId: string) => {
    setLessonState({ lessonId, activityId });
  };

  useEffect(() => {
    if (!lessonState.lessonId || !lessonState.activityId || isLoading) return;
    
    const savePosition = async () => {
      await fetch(`${api}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          lessonId: lessonState.lessonId, 
          percent: userProgress.find(p => p.lessonId === lessonState.lessonId)?.percent || 0,
          lastActivity: lessonState.activityId,
          lastStep: 1 
        })
      });
    };
    
    savePosition();
  }, [lessonState.lessonId, lessonState.activityId, isLoading, userId, userProgress]);

  // Activity selection handler for sidebar
  const handleActivitySelect = (lessonId: string, activityId: string) => {
    setLessonAndActivity(lessonId, activityId);
  };

  const handleConclusionComplete = useCallback(async (lessonId: string, rating: number) => {
    // Save progress first
    await fetch(`${api}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, percent: 100, lastActivity: 'conclusion', lastStep: 1 })
    });
    
    // Then navigate to next lesson
    const next = getNextActivity(lessonId, 'conclusion');
    if (next) {
      // Refresh progress and navigate
      const res = await fetch(`${api}/progress/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserProgress(data);
      }
      
      // Navigate to next lesson's video
      if (next.lessonId !== lessonId) {
        setLessonAndDefaultActivity(next.lessonId);
      } else {
        setLessonAndActivity(next.lessonId, next.activityId);
      }
    }
  }, [userId]);

  const renderMainContent = () => {
    console.log('renderMainContent:', { lessonState, isLoading });
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500">
          <p>טוען...</p>
        </div>
      );
    }
    
    if (!lessonState.lessonId || !lessonState.activityId) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500">
          <p>בחר שיעור ופעילות כדי להתחיל</p>
        </div>
      );
    }

    // Find the current lesson object from currentModule.lessons
    const lesson = currentModule.lessons.find(l => l.id === lessonState.lessonId);
    if (!lesson) {
      return <div className="text-red-500">שיעור לא נמצא: {lessonState.lessonId}</div>;
    }

    const goToNext = () => {
      const next = getNextActivity(lessonState.lessonId, lessonState.activityId);
      if (next) {
        if (next.lessonId !== lessonState.lessonId) {
          setLessonAndDefaultActivity(next.lessonId);
        } else {
          setLessonAndActivity(next.lessonId, next.activityId);
        }
      } else {
        setLessonAndActivity('', '');
      }
    };

    switch (lessonState.activityId) {
      case 'video':
        return (
          <VideoLesson
            key={lesson.id + lesson.video}
            videoUrl={lesson.video}
            videoTitle={lesson.videoTitle}
            lessonId={lessonState.lessonId}
            handleActivityComplete={handleActivityComplete}
            onNext={goToNext}
          />
        );
      case 'tutor':
        return <ClickTutor lessonId={lessonState.lessonId} handleActivityComplete={handleActivityComplete} />;
      case 'prompt':
        return <PromptTask lessonId={lessonState.lessonId} onNext={goToNext} handleActivityComplete={handleActivityComplete} />;
      case 'file':
        return <FileTask lessonId={lessonState.lessonId} />;
      case 'conclusion':
        return <Conclusion lessonId={lessonState.lessonId} onConclusionComplete={handleConclusionComplete} />;
      default:
        return <div>פעילות לא נמצאה</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container-main">
          <div className="flex items-center gap-4 py-4">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="p-2 hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="text-2xl">🤖</div>
              <h1 className="text-xl font-bold text-foreground">Hands-On-AI</h1>
            </div>
            <div className="mx-4 text-muted-foreground">|</div>
            <h2 className="text-xl font-semibold text-foreground">{currentModule.title}</h2>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Progress sidebar - LEFT side */}
        <ModuleSidebar 
          currentModule={currentModule}
          userProgress={userProgress}
          currentLessonId={lessonState.lessonId}
          currentActivityId={lessonState.activityId}
          onActivitySelect={handleActivitySelect}
        />

        {/* Main content - RIGHT side */}
        <div className="flex-1 section">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
