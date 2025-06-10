import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

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

  // Update expanded lesson when current lesson changes
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

  // ONLY toggles dropdown - no navigation
  const handleLessonHeaderClick = (lessonId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setExpandedLesson(expandedLesson === lessonId ? '' : lessonId);
  };

  // ONLY handles activity selection
  const handleActivityClick = (lessonId: string, activityId: string) => {
    onActivitySelect(lessonId, activityId);
  };

  return (
    <div className="w-80 bg-card border-l border-border">
      <div className="p-6 space-y-6">
        {/* Module Header */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{currentModule.title}</h3>
            <div className="flex justify-between items-center text-secondary mb-3">
              <span className="font-medium">{Math.round(getModuleProgress())}% הושלם</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {userProgress.filter(p => p.percent === 100).length}/{currentModule.lessons.length} שיעורים
              </span>
            </div>
            <Progress value={Math.round(getModuleProgress())} className="h-3" />
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-3">
          {currentModule.lessons.map((lesson) => (
            <div key={lesson.id} className="card-elevated overflow-hidden">
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto hover:bg-primary/5 transition-colors"
                onClick={(event) => handleLessonHeaderClick(lesson.id, event)}
              >
                <div className="text-right flex-1">
                  <div className="font-semibold text-foreground text-base">{lesson.title}</div>
                  <div className="text-secondary mt-1">
                    {Math.round(userProgress.find(p => p.lessonId === lesson.id)?.percent ?? 0)}% הושלם
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    userProgress.find(p => p.lessonId === lesson.id)?.percent === 100
                      ? 'bg-accent'
                      : userProgress.find(p => p.lessonId === lesson.id)?.percent > 0
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`} />
                  {expandedLesson === lesson.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </Button>
              
              {expandedLesson === lesson.id && (
                <div className="px-4 pb-4 space-y-2 border-t border-border/50 bg-secondary/30">
                  {lesson.activities.map((activity) => (
                    <Button
                      key={activity.id}
                      variant="ghost"
                      className={`w-full justify-between p-3 h-auto text-sm rounded-md transition-all ${
                        currentLessonId === lesson.id && currentActivityId === activity.id 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'hover:bg-card'
                      }`}
                      onClick={() => handleActivityClick(lesson.id, activity.id)}
                    >
                      <span className="font-medium">{activity.title}</span>
                      <div className="w-5 h-5 rounded-full border-2 border-border bg-card relative overflow-hidden">
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${Math.round(getActivityProgress(lesson.id, activity.id))}%`, 
                            background: getActivityProgress(lesson.id, activity.id) === 100 
                              ? 'hsl(var(--accent))' 
                              : 'hsl(var(--primary))'
                          }} 
                          className="absolute left-0 top-0 transition-all duration-300" 
                        />
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
  );
};

export default ModuleSidebar;
