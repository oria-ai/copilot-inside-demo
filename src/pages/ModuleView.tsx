import React, { useState } from 'react';
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
  onBack: () => void;
}

const ModuleView = ({ moduleId, onBack }: ModuleViewProps) => {
  const [currentLesson, setCurrentLesson] = useState<string>('');
  const [currentActivity, setCurrentActivity] = useState<string>('');
  const [expandedLesson, setExpandedLesson] = useState<string>('');

  const moduleData = {
    basics: {
      title: 'יסודות',
      progress: 30,
      lessons: [
        {
          id: 'lesson1',
          title: 'שיעור ראשון',
          progress: 75,
          activities: [
            { id: 'video', title: 'סרטון', completed: true },
            { id: 'tutor', title: 'מדריך אינטראקטיבי', completed: true },
            { id: 'conclusion', title: 'סיכום', completed: false }
          ]
        },
        {
          id: 'lesson2',
          title: 'שיעור שני',
          progress: 0,
          activities: [
            { id: 'video', title: 'סרטון', completed: false },
            { id: 'prompt', title: 'משימת הקלדה', completed: false },
            { id: 'conclusion', title: 'סיכום', completed: false }
          ]
        },
        {
          id: 'lesson3',
          title: 'שיעור שלישי',
          progress: 0,
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

  const handleActivityClick = (lessonId: string, activityId: string) => {
    setCurrentLesson(lessonId);
    setCurrentActivity(activityId);
  };

  const renderMainContent = () => {
    if (!currentLesson || !currentActivity) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500">
          <p>בחר שיעור ופעילות כדי להתחיל</p>
        </div>
      );
    }

    const lessonData = {
      lesson1: {
        video: 'https://player.vimeo.com/video/1086753235?badge=0&autopause=0&player_id=0&app_id=58479',
        videoTitle: 'Intro To Copilot'
      },
      lesson2: {
        video: 'https://player.vimeo.com/video/1088062270?badge=0&autopause=0&player_id=0&app_id=58479',
        videoTitle: 'Prompt Enigneering'
      },
      lesson3: {
        video: 'https://player.vimeo.com/video/1090416363?badge=0&autopause=0&player_id=0&app_id=58479',
        videoTitle: 'Word 1 Restored Final'
      }
    };

    const lesson = lessonData[currentLesson as keyof typeof lessonData];

    switch (currentActivity) {
      case 'video':
        return <VideoLesson videoUrl={lesson.video} videoTitle={lesson.videoTitle} />;
      case 'tutor':
        return <ClickTutor lessonId={currentLesson} />;
      case 'prompt':
        return <PromptTask lessonId={currentLesson} />;
      case 'file':
        return <FileTask lessonId={currentLesson} />;
      case 'conclusion':
        return <Conclusion lessonId={currentLesson} />;
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
        {/* Main content - 80% */}
        <div className="flex-1 p-6">
          {renderMainContent()}
        </div>

        {/* Progress sidebar - 20% */}
        <div className="w-80 bg-white border-l p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{currentModule.title}</h3>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{currentModule.progress}% הושלם</span>
              </div>
              <Progress value={currentModule.progress} className="h-2" />
            </div>

            <div className="space-y-2">
              {currentModule.lessons.map((lesson) => (
                <div key={lesson.id} className="border rounded-lg">
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-3 h-auto"
                    onClick={() => setExpandedLesson(expandedLesson === lesson.id ? '' : lesson.id)}
                  >
                    <div className="text-right">
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-sm text-gray-500">{lesson.progress}%</div>
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
                          onClick={() => handleActivityClick(lesson.id, activity.id)}
                        >
                          <span>{activity.title}</span>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            activity.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                          }`} />
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
