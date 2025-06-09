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
      imageName: `1-3.png`,
      instructions: 'בחר ב"עבודה"',
      clickArea: { top: '42%', left: '52%', width: '26%', height: '31%' }
    },
    {
      stepNumber: 2,
      imageName: `1-4-e.png`,
      instructions: 'כתוב לקופיילוט פרומפט קצר ושלח',
      clickArea: { top: '36%', left: '28.5%', width: '65%', height: '9%' },
      hasInput: true,
      inputPlaceholder: ''
    },
    {
      stepNumber: 3,
      imageName: `1-5-e.png`,
      instructions: 'לחץ "See more"',
      clickArea: { top: '73%', left: '83%', width: '9%', height: '6%' }
    },
    {
      stepNumber: 4,
      imageName: `1-6-e.png`,
      instructions: 'לחץ "Prompt Gallery"',
      clickArea: { top: '82%', left: '75%', width: '10%', height: '6%' }
    },
    {
      stepNumber: 5,
      imageName: `1-7-e.png`,
      instructions: 'פתח את התפקיד ובחר מכירות',
      clickArea: { top: '30%', left: '34%', width: '19%', height: '5%' }
    },
    {
      stepNumber: 6,
      imageName: `1-8-e.png`,
      instructions: 'פתח את התפקיד ובחר מכירות',
      clickArea: { top: '54%', left: '34%', width: '6%', height: '5%' }
    }
  ];
  // ===== END STEP CONFIGURATION =====

  const currentStepConfig = stepConfigs[currentStep - 1];
  const totalSteps = stepConfigs.length;

  const handleClickAreaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
    if (currentStep === 6) {
      // Move to conclusion activity (handled in parent)
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('clickTutorDone'));
      }
      return;
    }
  };

  const handleSkip = () => {
    console.log('Skipping tutor');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>בואו נעשה זאת יחד</CardTitle>
        <Button variant="outline" onClick={handleSkip}>
          דלג
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg mb-4">{currentStepConfig.instructions}</p>
            <p className="text-sm text-gray-600">שלב {currentStep} מתוך {totalSteps}</p>
          </div>

          <div className="relative">
            <div className="relative min-h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <img 
                src={`/${currentStepConfig.imageName}`}
                alt={`Step ${currentStep}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              
              {/* 
                CLICKABLE AREA - TO MAKE TRANSPARENT:
                Remove these classes: border-2 border-red-500 bg-red-500 bg-opacity-20
                Keep only: absolute pointer-events-auto cursor-pointer
              */}
              <div 
                className="absolute border-2 border-red-500 bg-red-500 bg-opacity-20 cursor-pointer"
                style={{
                  top: currentStepConfig.clickArea.top,
                  left: currentStepConfig.clickArea.left,
                  width: currentStepConfig.clickArea.width,
                  height: currentStepConfig.clickArea.height
                }}
                onClick={handleClickAreaClick}
              />
            </div>
            
            {showInput && currentStepConfig.hasInput && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={currentStepConfig.inputPlaceholder}
                  className="bg-white border-2 border-blue-500"
                  autoFocus
                />
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            לחץ על האזור הנכון בתמונה כדי להמשיך
          </div>

          {/* TO MAKE THE RED AREA TRANSPARENT, FOLLOW THESE STEPS:
              1. Find the div with className that includes "border-2 border-red-500 bg-red-500 bg-opacity-20"
              2. Remove these classes: border-2 border-red-500 bg-red-500 bg-opacity-20  
              3. Keep these classes: absolute cursor-pointer
              4. The final className should be: "absolute cursor-pointer"
          */}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClickTutor;
