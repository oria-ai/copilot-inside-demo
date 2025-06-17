import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ArrowLeft, BookOpen } from 'lucide-react';
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
  copilotLanguage: string;
}

const api = 'http://localhost:4000';

// 1. Define a type for user progress
interface ActivityProgress {
  [activityId: string]: boolean | number[]; // boolean for simple complete, number[] for steps/cards
}
interface UserProgress {
  lessonId: string;
  percent: number;
  lastActivity?: string;
  lastStep?: number;
  activityProgress?: ActivityProgress;
}

const ModuleView = ({ moduleId, userId, onBack, copilotLanguage }: ModuleViewProps) => {
  const [lessonState, setLessonState] = useState<{ lessonId: string; activityId: string }>({ lessonId: '', activityId: '' });
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const justTransitionedToFile = useRef(false);

  const moduleData = {
    basics: {
      title: 'יסודות השימוש בקופיילוט',
      lessons: [
        {
          id: 'lesson1',
          title: 'היכרות עם קופיילוט',
          sidebarTitle: 'שיעור ראשון - היכרות עם קופיילוט',
          video: 'https://player.vimeo.com/video/1086753235?badge=0&autopause=0&player_id=0&app_id=58479',
          videoTitle: 'Intro To Copilot',
          activities: [
            { id: 'video', title: 'מבוא', completed: true },
            { id: 'tutor', title: 'תרגול טכני', completed: true },
            { id: 'conclusion', title: 'סיכום', completed: false }
          ]
        },
        {
          id: 'lesson2',
          title: 'הנדסת פרומפטים',
          sidebarTitle: 'שיעור שני - הנדסת פרומפטים',
          video: 'https://player.vimeo.com/video/1088062270?badge=0&autopause=0&player_id=0&app_id=58479',
          videoTitle: 'Prompt Enigneering',
          activities: [
            { id: 'video', title: 'הנדסת פרומפטים', completed: false },
            { id: 'prompt', title: 'שיפור פרומפט', completed: false },
            { id: 'conclusion', title: 'סיכום', completed: false }
          ]
        },
        {
          id: 'lesson3',
          title: 'קופיילוט עם Word',
          sidebarTitle: 'שיעור שלישי - קופיילוט עם Word',
          video: 'https://player.vimeo.com/video/1090416363?badge=0&autopause=0&player_id=0&app_id=58479',
          videoTitle: 'Word 1 Restored Final',
          activities: [
            { id: 'video', title: 'קופיילוט עם Word', completed: false },
            { id: 'file', title: 'תרגול משולחן העבודה', completed: false },
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
    // Find current progress for this lesson
    const prev = userProgress.find(p => p.lessonId === lessonId);
    const activityProgress: ActivityProgress = prev?.activityProgress ? { ...prev.activityProgress } : {};
    if (activityId) {
      if (activityId === 'tutor') {
        // Mark step as completed in array
        const steps = Array.isArray(activityProgress[activityId]) ? [...(activityProgress[activityId] as number[])] : [];
        if (step && !steps.includes(step)) steps.push(step);
        activityProgress[activityId] = steps;
      } else if (activityId === 'file') {
        // Mark card as completed in array
        const cards = Array.isArray(activityProgress[activityId]) ? [...(activityProgress[activityId] as number[])] : [];
        if (step && !cards.includes(step)) cards.push(step);
        activityProgress[activityId] = cards;
      } else {
        // Mark as completed
        activityProgress[activityId] = true;
      }
    }
    await fetch(`${api}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, percent: progress, lastActivity: activityId, lastStep: step, activityProgress })
    });
    // Refresh progress
    const res = await fetch(`${api}/progress/${userId}`);
    if (res.ok) {
      const data = await res.json();
      setUserProgress(data);
    }
  }, [userId, userProgress]);

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
    const progressObj = userProgress.find((p) => p.lessonId === lessonId);
    const activityProgress = progressObj?.activityProgress || {};
    if (activityId === 'video') return activityProgress['video'] ? 100 : 0;
    if (activityId === 'tutor') {
      const steps = Array.isArray(activityProgress['tutor']) ? activityProgress['tutor'].length : 0;
      return steps >= 6 ? 100 : Math.round((steps / 6) * 100);
    }
    if (activityId === 'prompt') return activityProgress['prompt'] ? 100 : 0;
    if (activityId === 'file') {
      const cards = Array.isArray(activityProgress['file']) ? activityProgress['file'].length : 0;
      return cards >= 4 ? 100 : Math.round((cards / 4) * 100);
    }
    if (activityId === 'conclusion') return activityProgress['conclusion'] ? 100 : 0;
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
    // Save progress for the current lesson's conclusion
    await fetch(`${api}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, lessonId, percent: 100, lastActivity: 'conclusion', lastStep: 1 })
    });
    
    // Then navigate to next lesson's video (not conclusion)
    const next = getNextActivity(lessonId, 'conclusion');
    if (next) {
      // Refresh progress and navigate
      const res = await fetch(`${api}/progress/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserProgress(data);
      }
      // Always start at the video of the next lesson if moving to a new lesson
      if (next.lessonId !== lessonId) {
        setLessonAndDefaultActivity(next.lessonId);
      } else {
        setLessonAndActivity(next.lessonId, next.activityId);
      }
    }
  }, [userId]);

  const goToNext = () => {
    const next = getNextActivity(lessonState.lessonId, lessonState.activityId);
    if (next) {
      if (next.lessonId !== lessonState.lessonId) {
        setLessonAndDefaultActivity(next.lessonId);
      } else {
        // If transitioning from video to file, set the flag
        const lesson = currentModule.lessons.find(l => l.id === lessonState.lessonId);
        if (lesson) {
          const actIdx = lesson.activities.findIndex(a => a.id === lessonState.activityId);
          const nextAct = lesson.activities[actIdx + 1];
          if (lesson.activities[actIdx].id === 'video' && nextAct && nextAct.id === 'file') {
            justTransitionedToFile.current = true;
          }
        }
        setLessonAndActivity(next.lessonId, next.activityId);
      }
    } else {
      setLessonAndActivity('', '');
    }
  };

  const renderMainContent = () => {
    console.log('renderMainContent:', { lessonState, isLoading });
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96 text-medium-gray">
          <div className="bg-gradient-card rounded-3xl p-8 shadow-card">
            <div className="animate-pulse flex items-center">
              <div className="bg-gradient-turquoise w-8 h-8 rounded-full mr-4"></div>
              <p className="text-lg">טוען...</p>
            </div>
          </div>
        </div>
      );
    }
    
    if (!lessonState.lessonId || !lessonState.activityId) {
      return (
        <div className="flex items-center justify-center h-96 text-medium-gray">
          <div className="bg-gradient-card rounded-3xl p-8 shadow-card text-center">
            <div className="bg-light-gray w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-medium-gray" />
            </div>
            <p className="text-lg">בחר שיעור ופעילות כדי להתחיל</p>
          </div>
        </div>
      );
    }

    const lesson = currentModule.lessons.find(l => l.id === lessonState.lessonId);
    if (!lesson) {
      return <div className="text-red-500">שיעור לא נמצא: {lessonState.lessonId}</div>;
    }

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
            lessonDisplayName={lesson.title}
            showChapters={true}
          />
        );
      case 'tutor':
        return <ClickTutor lessonId={lessonState.lessonId} handleActivityComplete={handleActivityComplete} copilotLanguage={copilotLanguage} />;
      case 'prompt':
        return <PromptTask lessonId={lessonState.lessonId} onNext={goToNext} handleActivityComplete={handleActivityComplete} />;
      case 'file':
        return <FileTask lessonId={lessonState.lessonId} handleActivityComplete={handleActivityComplete} />;
      case 'conclusion':
        return <Conclusion lessonId={lessonState.lessonId} onConclusionComplete={handleConclusionComplete} onBack={onBack} />;
      default:
        return <div>פעילות לא נמצאה</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-light" dir="rtl">
      <header className="bg-gradient-turquoise shadow-soft border-b-0 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="p-3 text-white hover:bg-white/20 rounded-2xl transition-all duration-300"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{currentModule.title}</h1>
          </div>
        </div>
      </header>

      <div className="flex">
        <ModuleSidebar 
          currentModule={currentModule}
          userProgress={userProgress}
          currentLessonId={lessonState.lessonId}
          currentActivityId={lessonState.activityId}
          onActivitySelect={handleActivitySelect}
        />

        <div className="flex-1 p-8">
          <div className="bg-white rounded-3xl shadow-card">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
