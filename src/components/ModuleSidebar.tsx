import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress, CircularProgress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, PlayCircle, CheckCircle2, Activity, BookOpenCheck, Dumbbell } from 'lucide-react';

interface UserProgress {
  lessonId: string;
  percent: number;
  lastActivity?: string;
  lastStep?: number;
  activityProgress?: Record<string, boolean | number[]>;
}

interface Activity {
  id: string;
  title: string;
  completed: boolean;
}

interface Lesson {
  id: string;
  title: string;
  video: string;
  videoTitle: string;
  activities: Activity[];
  sidebarTitle?: string;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

interface SidebarProps {
  currentModule: Module;
  userProgress: UserProgress[];
  currentLessonId: string;
  currentActivityId: string;
  onActivitySelect: (lessonId: string, activityId: string) => void;
}

const ModuleSidebar = ({ 
  currentModule, 
  userProgress, 
  currentLessonId, 
  currentActivityId, 
  onActivitySelect 
}: SidebarProps) => {
  const [expandedLesson, setExpandedLesson] = useState(currentLessonId);

  useEffect(() => {
    setExpandedLesson(currentLessonId);
  }, [currentLessonId]);

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

  const getModuleProgress = () => {
    if (!userProgress.length) return 0;
    const totalLessons = currentModule.lessons.length;
    const total = userProgress.reduce((sum, p) => sum + (p.percent || 0), 0);
    return Math.round((total / (totalLessons * 100)) * 100);
  };

  const handleLessonHeaderClick = (lessonId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setExpandedLesson(expandedLesson === lessonId ? '' : lessonId);
  };

  const handleActivityClick = (lessonId: string, activityId: string) => {
    onActivitySelect(lessonId, activityId);
  };

  return (
    <div className="w-80 bg-gradient-card border-r-0 p-6 shadow-soft">
      <div className="space-y-6">
        {/* Module Progress Card */}
        <Card className="bg-gradient-turquoise text-white rounded-3xl border-0 shadow-card">
          <div className="p-6">
            <div className="flex flex-row justify-between items-center">
              {/* Right side: title and % */}
              <div className="flex flex-col items-start text-right">
                <h3 className="text-xl font-bold mb-1 text-white">התקדמות בקורס</h3>
                <span className="text-sm text-white/90">{Math.round(getModuleProgress())}% הושלם</span>
              </div>
              {/* Left side: circle */}
              <div className="flex items-center justify-center">
                <CircularProgress value={getModuleProgress()} size={56} strokeWidth={6} />
              </div>
            </div>
          </div>
        </Card>

        {/* Lessons List */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-dark-gray mb-4">שיעורים</h4>
          {currentModule.lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-2xl shadow-card border-0 overflow-hidden">
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto rounded-2xl hover:bg-light-gray/50 transition-all duration-300"
                onClick={(event) => handleLessonHeaderClick(lesson.id, event)}
              >
                <div className="text-right flex-1">
                  <div className="font-semibold text-dark-gray">{lesson.sidebarTitle || lesson.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-sm text-medium-gray">
                      {Math.round(userProgress.find(p => p.lessonId === lesson.id)?.percent ?? 0)}% הושלם
                    </div>
                    {userProgress.find(p => p.lessonId === lesson.id)?.percent === 100 && (
                      <CheckCircle2 className="h-4 w-4 text-green" />
                    )}
                  </div>
                </div>
                <div className="bg-light-gray rounded-xl p-2">
                  {expandedLesson === lesson.id ? 
                    <ChevronUp className="h-4 w-4 text-medium-gray" /> : 
                    <ChevronDown className="h-4 w-4 text-medium-gray" />
                  }
                </div>
              </Button>
              
              {expandedLesson === lesson.id && (
                <div className="px-4 pb-4 space-y-2">
                  {lesson.activities.map((activity) => {
                    const progress = getActivityProgress(lesson.id, activity.id);
                    const isCompleted = progress === 100;
                    const isCurrent = currentLessonId === lesson.id && currentActivityId === activity.id;
                    // Choose icon based on activity type
                    let IconComponent = null;
                    if (activity.id === 'video') {
                      IconComponent = PlayCircle;
                    } else if (activity.id === 'conclusion') {
                      IconComponent = BookOpenCheck;
                    } else if (['tutor', 'prompt', 'file'].includes(activity.id)) {
                      IconComponent = Dumbbell;
                    } else {
                      IconComponent = Activity;
                    }
                    return (
                      <Button
                        key={activity.id}
                        variant="ghost"
                        className={`w-full justify-between p-3 h-auto text-sm rounded-xl transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-gradient-turquoise text-white shadow-soft' 
                            : 'hover:bg-light-gray/70'
                        }`}
                        onClick={() => handleActivityClick(lesson.id, activity.id)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className={isCurrent ? 'text-white' : 'text-dark-gray'}>
                              {activity.title}
                            </span>
                            {isCompleted && !isCurrent && (
                              <CheckCircle2 className="h-4 w-4 text-green" />
                            )}
                          </div>
                          {/* Icon next to the title group, not at the edge */}
                          <div className="flex-shrink-0">
                            <IconComponent className={`h-5 w-5 ${isCurrent ? 'text-white' : 'text-medium-gray'}`} />
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleSidebar;
