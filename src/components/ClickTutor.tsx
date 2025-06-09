
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ClickTutorProps {
  lessonId: string;
}

interface StepConfig {
  stepNumber: number;
  imageName: string;
  instructions: string;
  clickArea: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
  hasInput?: boolean;
  inputPlaceholder?: string;
}

const ClickTutor = ({ lessonId }: ClickTutorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  // ===== STEP CONFIGURATION - EDIT HERE =====
  const stepConfigs: StepConfig[] = [
    {
      stepNumber: 1,
      imageName: `${lessonId}-1.png`,
      instructions: 'לחץ על כפתור ההתחלה',
      clickArea: { top: '20%', left: '30%', width: '40%', height: '20%' }
    },
    {
      stepNumber: 2,
      imageName: `${lessonId}-2.png`,
      instructions: 'בחר את האפשרות הנכונה',
      clickArea: { top: '40%', left: '20%', width: '60%', height: '15%' }
    },
    {
      stepNumber: 3,
      imageName: `${lessonId}-3.png`,
      instructions: 'לחץ על התפריט',
      clickArea: { top: '10%', left: '50%', width: '30%', height: '25%' }
    },
    {
      stepNumber: 4,
      imageName: `${lessonId}-4-e.png`,
      instructions: 'הכנס טקסט בשדה ואז לחץ להמשך',
      clickArea: { top: '50%', left: '25%', width: '50%', height: '30%' },
      hasInput: true,
      inputPlaceholder: 'הכנס ערך כאן'
    },
    {
      stepNumber: 5,
      imageName: `${lessonId}-5-e.png`,
      instructions: 'לחץ על כפתור השמירה',
      clickArea: { top: '70%', left: '40%', width: '20%', height: '15%' }
    },
    {
      stepNumber: 6,
      imageName: `${lessonId}-6-e.png`,
      instructions: 'אשר את הפעולה',
      clickArea: { top: '30%', left: '35%', width: '30%', height: '20%' }
    },
    {
      stepNumber: 7,
      imageName: `${lessonId}-7-e.png`,
      instructions: 'בדוק את התוצאה',
      clickArea: { top: '15%', left: '10%', width: '80%', height: '25%' }
    },
    {
      stepNumber: 8,
      imageName: `${lessonId}-8-e.png`,
      instructions: 'סיים את התהליך',
      clickArea: { top: '60%', left: '30%', width: '40%', height: '20%' }
    }
  ];
  // ===== END STEP CONFIGURATION =====

  const currentStepConfig = stepConfigs[currentStep - 1];
  const totalSteps = stepConfigs.length;

  const handleImageClick = () => {
    if (currentStepConfig.hasInput && !showInput) {
      setShowInput(true);
      return;
    }
    
    if (currentStepConfig.hasInput && showInput && inputValue.trim() === '') {
      alert('אנא הכנס ערך בשדה');
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setShowInput(false);
      setInputValue('');
    }
  };

  const handleSkip = () => {
    console.log('Skipping tutor');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>מדריך אינטראקטיבי</CardTitle>
        <Button variant="outline" onClick={handleSkip}>
          דלג
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <img 
              src="/placeholder.svg" 
              alt="Tutor placeholder"
              className="mx-auto w-32 h-32 rounded-full object-cover"
            />
          </div>
          
          <div className="text-center">
            <p className="text-lg mb-4">{currentStepConfig.instructions}</p>
            <p className="text-sm text-gray-600">שלב {currentStep} מתוך {totalSteps}</p>
          </div>

          <div className="relative">
            <div 
              className="relative cursor-pointer min-h-96 bg-gray-100 rounded-lg flex items-center justify-center"
              onClick={handleImageClick}
            >
              <img 
                src={`/lovable-uploads/${currentStepConfig.imageName}`}
                alt={`Step ${currentStep}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              
              {/* Clickable area with red border - REMOVE border-red-500 to make transparent */}
              <div 
                className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20 pointer-events-none"
                style={{
                  top: currentStepConfig.clickArea.top,
                  left: currentStepConfig.clickArea.left,
                  width: currentStepConfig.clickArea.width,
                  height: currentStepConfig.clickArea.height
                }}
              />
            </div>
            
            {showInput && currentStepConfig.hasInput && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentStepConfig.inputPlaceholder}
                  className="bg-white border-2 border-blue-500"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            לחץ על האזור המסומן באדום כדי להמשיך
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClickTutor;
