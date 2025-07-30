import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ArrowLeft, BookOpen } from 'lucide-react';
import VideoLesson from '@/components/VideoLesson';
import ClickTutor from '@/components/ClickTutor';
import ClickTutor2 from '@/components/ClickTutor2';
import PromptTask from '@/components/PromptTask';
import FileTask from '@/components/FileTask';
import ChatTask from '@/components/ChatTask';
import Conclusion from '@/components/Conclusion';
import ModuleSidebar from '@/components/ModuleSidebar';
import { progressStorage, type UserProgress, type ActivityProgress } from '@/lib/localStorage';

interface ModuleViewProps {
  moduleId: string;
  userId: string;
  onBack: () => void;
  copilotLanguage: string;
}

const api = 'http://localhost:4000';

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
          sidebarTitle: 'היכרות עם קופיילוט',
          video: 'https://player.vimeo.com/video/1086753235?h=dcea357886&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
          videoTitle: 'Intro To Copilot',
          activities: [
            { id: 'video', title: 'מבוא', completed: true },
            { id: 'tutor', title: 'תרגול טכני', completed: true }
          ]
        },
        {
          id: 'lesson2',
          title: 'הנדסת פרומפטים',
          sidebarTitle: 'הנדסת פרומפטים',
          video: 'https://player.vimeo.com/video/1088062270?h=16b48a61a6&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
          videoTitle: 'Prompt Enigneering',
          activities: [
            { id: 'video', title: 'הנדסת פרומפטים', completed: false },
            { id: 'prompt', title: 'שיפור פרומפט', completed: false },
            { id: 'conclusion', title: 'סיכום', completed: false }
          ]
        }
      ]
    },
    word: {
      title: 'קופיילוט בוורד',
      lessons: [
        {
          id: 'lesson1',
          title: 'קופיילוט עם Word',
          sidebarTitle: 'קופיילוט עם Word',
          video: 'https://player.vimeo.com/video/1090416363?h=2eb88496e3&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
          videoTitle: 'Word 1 Restored Final',
          activities: [
            { id: 'video', title: 'קופיילוט עם Word', completed: false },
            { id: 'chat', title: 'שיחה עם קופיילוט', completed: false },
            { id: 'tutor2', title: 'מדריך טכני', completed: false, hidden: true }
          ]
        },
        {
          id: 'lesson2',
          title: 'העמקה בוורד',
          sidebarTitle: 'העמקה בוורד',
          video: 'https://player.vimeo.com/video/1101462883?h=dc8cff28d7&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
          videoTitle: 'Word Advanced',
          activities: [
            { id: 'video', title: 'יוז קייס', completed: false },
            { id: 'file', title: 'תרגול משולחן העבודה', completed: false },
            { id: 'conclusion', title: 'סיכום מודול', completed: false }
          ]
        }
      ]
    },
    excel: {
      title: 'קופיילוט באקסל',
      lessons: [
        {
          id: 'lesson1',
          title: 'היכרות עם קופיילוט',
          sidebarTitle: 'ראשון - היכרות עם קופיילוט',
          video: 'https://player.vimeo.com/video/1086753235?h=dcea357886&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
          videoTitle: 'Intro To Copilot',
          activities: [
            { id: 'video', title: 'מבוא', completed: true },
            { id: 'tutor', title: 'תרגול טכני', completed: true }
          ]
        },
        {
          id: 'lesson2',
          title: 'הנדסת פרומפטים',
          sidebarTitle: 'שני - הנדסת פרומפטים',
          video: 'https://player.vimeo.com/video/1088062270?h=16b48a61a6&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479',
          videoTitle: 'Prompt Enigneering',
          activities: [
            { id: 'video', title: 'הנדסת פרומפטים', completed: false },
            { id: 'prompt', title: 'שיפור פרומפט', completed: false },
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
      if (activityId === 'tutor' || activityId === 'tutor2') {
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
    
    // Save to localStorage instead of API
    const lessonProgress: UserProgress = {
      lessonId,
      percent: progress,
      lastActivity: activityId,
      lastStep: step,
      activityProgress
    };
    
    progressStorage.saveProgress(userId, lessonProgress);
    
    // Update local state
    const updatedProgress = progressStorage.getProgress(userId);
    setUserProgress(updatedProgress);
  }, [userId, userProgress]);

  useEffect(() => {
    const fetchProgress = async () => {
      setIsLoading(true);
      
      // Get progress from localStorage instead of API
      const data = progressStorage.getProgress(userId);
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
      
      setIsLoading(false);
    };
    fetchProgress();
  }, [userId]);

  const getActivityProgress = (lessonId: string, activityId: string) => {
    const progressObj = userProgress.find((p) => p.lessonId === lessonId);
    const activityProgress = progressObj?.activityProgress || {};
    if (activityId === 'video') return activityProgress['video'] ? 100 : 0;
    if (activityId === 'tutor' || activityId === 'tutor2') {
      const steps = Array.isArray(activityProgress[activityId]) ? activityProgress[activityId].length : 0;
      return steps >= 6 ? 100 : Math.round((steps / 6) * 100);
    }
    if (activityId === 'prompt') return activityProgress['prompt'] ? 100 : 0;
    if (activityId === 'file') {
      const cards = Array.isArray(activityProgress['file']) ? activityProgress['file'].length : 0;
      return cards >= 4 ? 100 : Math.round((cards / 4) * 100);
    }
    if (activityId === 'chat') return activityProgress['chat'] ? 100 : 0;
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
    
    const savePosition = () => {
      const currentProgress = userProgress.find(p => p.lessonId === lessonState.lessonId);
      const lessonProgress: UserProgress = {
        lessonId: lessonState.lessonId,
        percent: currentProgress?.percent || 0,
        lastActivity: lessonState.activityId,
        lastStep: 1,
        activityProgress: currentProgress?.activityProgress || {}
      };
      
      progressStorage.saveProgress(userId, lessonProgress);
    };
    
    savePosition();
  }, [lessonState.lessonId, lessonState.activityId, isLoading, userId, userProgress]);

  // Activity selection handler for sidebar
  const handleActivitySelect = (lessonId: string, activityId: string) => {
    setLessonAndActivity(lessonId, activityId);
  };

  const handleConclusionComplete = useCallback(async (lessonId: string, rating: number) => {
    // Save progress for the current lesson's conclusion to localStorage
    const currentProgress = userProgress.find(p => p.lessonId === lessonId);
    const activityProgress = currentProgress?.activityProgress || {};
    activityProgress['conclusion'] = true;
    
    const lessonProgress: UserProgress = {
      lessonId,
      percent: 100,
      lastActivity: 'conclusion',
      lastStep: 1,
      activityProgress
    };
    
    progressStorage.saveProgress(userId, lessonProgress);
    
    // Then navigate to next lesson's video (not conclusion)
    const next = getNextActivity(lessonId, 'conclusion');
    if (next) {
      // Get existing progress for the next lesson
      const nextProgress = userProgress.find(p => p.lessonId === next.lessonId);
      const nextActivityProgress = nextProgress?.activityProgress || {};
      
      // Merge activity progress from current lesson into next lesson
      const mergedActivityProgress = { ...activityProgress, ...nextActivityProgress };
      
      const updatedProgress: UserProgress = {
        lessonId: next.lessonId,
        percent: 0, // Reset percent for new lesson
        lastActivity: next.activityId,
        lastStep: 1,
        activityProgress: mergedActivityProgress
      };
      
      // Save merged progress and navigate
      progressStorage.saveProgress(userId, updatedProgress);
      const data = progressStorage.getProgress(userId);
      setUserProgress(data);
      
      setLessonAndActivity(next.lessonId, next.activityId);
    }
  }, [userId, userProgress]);

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
      case 'tutor2':
        return <ClickTutor2 
          lessonId={lessonState.lessonId} 
          handleActivityComplete={handleActivityComplete} 
          copilotLanguage={copilotLanguage}
          onNavigateToLesson={(lessonId: string, activityId: string) => {
            console.log(`🔧 ModuleView: ClickTutor2 navigating to ${lessonId} -> ${activityId}`);
            setLessonState({ lessonId, activityId });
          }}
        />;
      case 'prompt':
        return <PromptTask lessonId={lessonState.lessonId} onNext={goToNext} handleActivityComplete={handleActivityComplete} />;
      case 'file':
        return <FileTask lessonId={lessonState.lessonId} handleActivityComplete={handleActivityComplete} />;
      case 'chat':
        return <ChatTask 
          lessonId={lessonState.lessonId} 
          moduleId={moduleId}
          onNext={goToNext} 
                      onNavigateToActivity={(activityId: string) => {
              console.log('🚨🚨🚨 ModuleView.onNavigateToActivity called!!! ActivityId:', activityId);
              console.trace('🚨🚨🚨 Stack trace to see who called navigation:');
              setLessonState(prev => ({ ...prev, activityId }));
            }}
          onNavigateToLesson={(lessonId: string, activityId: string) => {
            console.log(`🔧 ModuleView: Navigating to ${lessonId} -> ${activityId}`);
            setLessonState({ lessonId, activityId });
          }}
          handleActivityComplete={handleActivityComplete} 
        />;
      case 'conclusion':
        return <Conclusion lessonId={lessonState.lessonId} moduleId={moduleId} onConclusionComplete={handleConclusionComplete} onBack={onBack} />;
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
