import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, PlayCircle, CheckCircle2 } from 'lucide-react';

interface UserProgress {
  lessonId: string;
  percent: number;
  lastActivity?: string;
  lastStep?: number;
}

interface SidebarProps {
  currentModule: any;
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
            <h3 className="text-xl font-bold mb-3">{currentModule.title}</h3>
            <div className="flex justify-between text-sm text-white/90 mb-3">
              <span>{Math.round(getModuleProgress())}% הושלם</span>
              <span>התקדמות כללית</span>
            </div>
            <Progress 
              value={Math.round(getModuleProgress())} 
              className="h-3 bg-white/20 rounded-full" 
            />
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
                  <div className="font-semibold text-dark-gray">{lesson.title}</div>
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
                        <div className="flex items-center gap-2">
                          <span className={isCurrent ? 'text-white' : 'text-dark-gray'}>
                            {activity.title}
                          </span>
                          {isCompleted && !isCurrent && (
                            <CheckCircle2 className="h-4 w-4 text-green" />
                          )}
                        </div>
                        
                        <div className={`w-6 h-6 rounded-full border-2 relative overflow-hidden ${
                          isCurrent ? 'border-white' : 'border-light-gray'
                        }`}>
                          <div 
                            style={{ 
                              height: '100%', 
                              width: `${Math.round(progress)}%`, 
                              background: isCurrent ? 'rgba(255,255,255,0.3)' : 'hsl(var(--green))' 
                            }} 
                            className="absolute left-0 top-0 rounded-full transition-all duration-500" 
                          />
                          {isCurrent && (
                            <PlayCircle className="absolute inset-0.5 text-white" />
                          )}
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
