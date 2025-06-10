import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import VideoLesson from '@/components/VideoLesson';
import ClickTutor from '@/components/ClickTutor';
import PromptTask from '@/components/PromptTask';
import FileTask from '@/components/FileTask';
import Conclusion from '@/components/Conclusion';

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
  const [expandedLesson, setExpandedLesson] = useState('');
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user progress and resume position from backend
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
          setExpandedLesson(progressWithActivity.lessonId);
        } else {
          // No saved position, start at first lesson's video
          const firstLesson = currentModule.lessons[0];
          const videoActivity = firstLesson.activities.find(a => a.id === 'video');
          if (videoActivity) {
            setLessonState({ lessonId: firstLesson.id, activityId: 'video' });
          } else {
            setLessonState({ lessonId: firstLesson.id, activityId: firstLesson.activities[0].id });
          }
          setExpandedLesson(firstLesson.id);
        }
      }
      setIsLoading(false);
    };
    fetchProgress();
  }, [userId]);

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

  // Helper to get lesson/activity completion and progress
  const getActivityProgress = (lessonId: string, activityId: string) => {
    const progress = userProgress.find((p) => p.lessonId === lessonId)?.percent ?? 0;
    if (activityId === 'video') return progress >= 50 ? 100 : progress;
    if (activityId === 'tutor') {
      if (progress >= 90) return 100;
      if (progress > 50) return ((progress - 50) / 40) * 100;
      return 0;
    }
    if (activityId === 'conclusion') return progress === 100 ? 100 : 0;
    return 0;
  };

  const isActivityCompleted = (lessonId: string, activityId: string) => getActivityProgress(lessonId, activityId) === 100;

  // Helper to get module progress
  const getModuleProgress = () => {
    if (!userProgress.length) return 0;
    const totalLessons = currentModule.lessons.length;
    const total = userProgress.reduce((sum, p) => sum + (p.percent || 0), 0);
    return Math.round((total / (totalLessons * 100)) * 100);
  };

  // Update handleActivityComplete to save lastActivity and lastStep
  const handleActivityComplete = async (
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
  };

  // Listen for goToConclusion event from ClickTutor
  useEffect(() => {
    const goToConclusionHandler = (_e: Event) => {
      setLessonState(prev => ({ ...prev, activityId: 'conclusion' }));
    };
    window.addEventListener('goToConclusion', goToConclusionHandler);
    return () => window.removeEventListener('goToConclusion', goToConclusionHandler);
  }, []);

  // Helper to get the next activity in order
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

  // Helper to set lesson and activity, always preferring video as entry point
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

  // Helper to set lesson and activity together (for non-default cases)
  const setLessonAndActivity = (lessonId: string, activityId: string) => {
    setLessonState({ lessonId, activityId });
  };

  // Save current position whenever user navigates
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

  // Sidebar click handler (no hasUserSelected)
  const handleActivityClick = (lessonId: string, activityId: string) => {
    setLessonAndActivity(lessonId, activityId);
  };

  // Fixed handler for lesson header toggle (ONLY toggles dropdown, no navigation)
  const handleLessonHeaderClick = (lessonId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setExpandedLesson(expandedLesson === lessonId ? '' : lessonId);
  };

  // Handle conclusion completion and navigation atomically
  const handleConclusionComplete = async (lessonId: string, rating: number) => {
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
  };

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
        return <PromptTask lessonId={lessonState.lessonId} />;
      case 'file':
        return <FileTask lessonId={lessonState.lessonId} />;
      case 'conclusion':
        return <Conclusion lessonId={lessonState.lessonId} onConclusionComplete={handleConclusionComplete} />;
      default:
        return <div>פעילות לא נמצאה</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">{currentModule.title}</h1>
        </div>
      </header>

      <div className="flex">
        {/* Progress sidebar - LEFT side */}
        <div className="w-80 bg-white border-r p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{currentModule.title}</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{Math.round(getModuleProgress())}% הושלם</span>
              </div>
              <Progress value={Math.round(getModuleProgress())} className="h-2" />
            </div>

            <div className="space-y-2">
              {currentModule.lessons.map((lesson) => (
                <div key={lesson.id} className="border rounded-lg">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                    onClick={(event) => handleLessonHeaderClick(lesson.id, event)}
                  >
                    <div className="text-right">
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-sm text-gray-500">{Math.round(userProgress.find(p => p.lessonId === lesson.id)?.percent ?? 0)}%</div>
                    </div>
                    {expandedLesson === lesson.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  
                  {expandedLesson === lesson.id && (
                    <div className="px-3 pb-3 space-y-1">
                      {lesson.activities.map((activity) => (
                        <Button
                          key={activity.id}
                          variant="ghost"
                          className="w-full justify-between p-2 h-auto text-sm"
                          onClick={() => {
                            handleActivityClick(lesson.id, activity.id);
                          }}
                        >
                          <span>{activity.title}</span>
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 relative overflow-hidden">
                            <div style={{ height: '100%', width: `${Math.round(getActivityProgress(lesson.id, activity.id))}%`, background: 'rgba(34,197,94,0.7)' }} className="absolute left-0 top-0 rounded-full transition-all duration-300" />
                          </div>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content - RIGHT side */}
        <div className="flex-1 p-6">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
