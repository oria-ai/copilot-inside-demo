import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface ClickTutorProps {
  lessonId: string;
  handleActivityComplete: (lessonId: string, progress: number, understandingRating?: number, activityType?: string, step?: number) => void;
}

const ClickTutor = ({ lessonId, handleActivityComplete }: ClickTutorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [startDialogOpen, setStartDialogOpen] = useState(true);

  const tutorialSteps = [
    {
      id: 1,
      instruction: 'לחץ על האזור הנכון בתמונה',
      image: '/1-1.png',
      clickArea: { x: 50, y: 50, width: 100, height: 50 }
    },
    {
      id: 2,
      instruction: 'בחר את הפעולה הנכונה מהתפריט',
      image: '/1-2.png',
      clickArea: { x: 200, y: 100, width: 120, height: 60 }
    },
    {
      id: 3,
      instruction: 'הקלד את הטקסט הנדרש בשדה',
      image: '/1-3.png',
      clickArea: { x: 150, y: 200, width: 200, height: 40 }
    },
    {
      id: 4,
      instruction: 'לחץ על כפתור השמירה',
      image: '/1-4-1-e.png',
      clickArea: { x: 300, y: 250, width: 80, height: 40 }
    },
    {
      id: 5,
      instruction: 'בדוק שהפעולה הושלמה בהצלחה',
      image: '/1-5-e.png',
      clickArea: { x: 180, y: 150, width: 140, height: 80 }
    },
    {
      id: 6,
      instruction: 'סיים את התהליך',
      image: '/1-6-e.png',
      clickArea: { x: 250, y: 300, width: 100, height: 50 }
    }
  ];

  useEffect(() => {
    if (completedSteps.length > 0) {
      const progress = Math.round((completedSteps.length / tutorialSteps.length) * 100);
      handleActivityComplete(lessonId, progress, undefined, 'tutor', completedSteps.length);
    }
  }, [completedSteps, lessonId, handleActivityComplete, tutorialSteps.length]);

  const handleCorrectClick = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }
    
    if (currentStep < tutorialSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    window.dispatchEvent(new Event('goToConclusion'));
  };

  const getCurrentStepData = () => {
    return tutorialSteps.find(step => step.id === currentStep) || tutorialSteps[0];
  };

  const stepData = getCurrentStepData();

  return (
    <>
      {/* Start Task Popup */}
      <Dialog open={startDialogOpen}>
        <DialogContent className="text-right max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>התחלת משימה</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>ברוך הבא למשימה הראשונה! כאן תוכל להוריד את קובץ התמלול, לקרוא הוראות, ולקבל טיפים לסיכום. לחץ על "התחל" כדי להתחיל.</p>
            <Button className="mt-6 w-full" onClick={() => setStartDialogOpen(false)}>
              התחל
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6 p-6">
        <Card className="rounded-3xl shadow-card border-0">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold text-dark-gray">
              לחץ על האזור הנכון בתמונה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative inline-block bg-light-gray rounded-3xl p-4 shadow-soft">
                <img 
                  src={stepData.image} 
                  alt={`Step ${currentStep}`}
                  className="max-w-full h-auto rounded-2xl"
                />
                <div
                  className="absolute cursor-pointer bg-blue-500/20 border-2 border-blue-500 rounded-2xl hover:bg-blue-500/30 transition-colors"
                  style={{
                    left: stepData.clickArea.x,
                    top: stepData.clickArea.y,
                    width: stepData.clickArea.width,
                    height: stepData.clickArea.height
                  }}
                  onClick={handleCorrectClick}
                />
              </div>
            </div>

            {/* Step Counter */}
            <div className="text-center">
              <p className="text-lg font-semibold text-medium-gray">
                שלב {currentStep} מתוך {tutorialSteps.length}
              </p>
            </div>

            {/* Instructions */}
            <div className="text-center bg-gradient-card rounded-3xl p-6 shadow-soft">
              <p className="text-lg text-dark-gray font-medium">
                {stepData.instruction}
              </p>
            </div>

            {/* Skip Button */}
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleSkip}
                className="px-8 py-3 rounded-2xl border-medium-gray/30 text-medium-gray hover:bg-light-gray/50"
              >
                דלג
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ClickTutor;
