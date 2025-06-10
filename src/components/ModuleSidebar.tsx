
import React, { useState } from 'react';
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
                  <div className="text-sm text-gray-500">
                    {Math.round(userProgress.find(p => p.lessonId === lesson.id)?.percent ?? 0)}%
                  </div>
                </div>
                {expandedLesson === lesson.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              
              {expandedLesson === lesson.id && (
                <div className="px-3 pb-3 space-y-1">
                  {lesson.activities.map((activity) => (
                    <Button
                      key={activity.id}
                      variant="ghost"
                      className={`w-full justify-between p-2 h-auto text-sm ${
                        currentLessonId === lesson.id && currentActivityId === activity.id 
                          ? 'bg-blue-100 text-blue-800' 
                          : ''
                      }`}
                      onClick={() => handleActivityClick(lesson.id, activity.id)}
                    >
                      <span>{activity.title}</span>
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300 relative overflow-hidden">
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${Math.round(getActivityProgress(lesson.id, activity.id))}%`, 
                            background: 'rgba(34,197,94,0.7)' 
                          }} 
                          className="absolute left-0 top-0 rounded-full transition-all duration-300" 
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
