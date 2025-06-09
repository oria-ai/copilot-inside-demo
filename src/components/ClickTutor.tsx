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

  // Helper to parse percentage string to number
  const percentToNumber = (percent: string) => parseFloat(percent.replace('%', '')) / 100;

  // For step 2, determine which image to show based on inputValue
  const step2Image = currentStep === 2 && inputValue.trim() !== '' ? '1-4-1-e.png' : currentStepConfig.imageName;

  // Handler for clicking anywhere on the image
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // Get bounding rect of the image wrapper
    const wrapper = e.currentTarget;
    const rect = wrapper.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const relX = clickX / rect.width;
    const relY = clickY / rect.height;

    // Get click area as numbers
    const areaLeft = percentToNumber(currentStepConfig.clickArea.left);
    const areaTop = percentToNumber(currentStepConfig.clickArea.top);
    const areaWidth = percentToNumber(currentStepConfig.clickArea.width);
    const areaHeight = percentToNumber(currentStepConfig.clickArea.height);

    const inArea =
      relX >= areaLeft &&
      relX <= areaLeft + areaWidth &&
      relY >= areaTop &&
      relY <= areaTop + areaHeight;

    if (!inArea) {
      // Optionally, shake or give feedback
      return;
    }

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

          {/* Responsive aspect-ratio container for screenshot */}
          <div
            className="relative w-full max-w-2xl mx-auto aspect-[16/9] bg-transparent rounded-lg flex items-center justify-center overflow-hidden"
            style={{ minHeight: '300px' }}
            onClick={handleImageClick}
            role="button"
            aria-label="המשך לשלב הבא על ידי לחיצה על האזור המתאים"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') handleImageClick(e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>);
            }}
          >
            <img
              src={`/${currentStep === 2 ? step2Image : currentStepConfig.imageName}`}
              alt={`Step ${currentStep}`}
              className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
              }}
              draggable={false}
            />
            {/* Show the red hotspot for positioning, except on step 2 */}
            {currentStep !== 2 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: currentStepConfig.clickArea.top,
                  left: currentStepConfig.clickArea.left,
                  width: currentStepConfig.clickArea.width,
                  height: currentStepConfig.clickArea.height
                }}
              />
            )}
            {/* Step 2: Overlay invisible input and send button */}
            {currentStep === 2 && (
              <>
                {/* Invisible input overlay */}
                <input
                  type="text"
                  dir="ltr"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={currentStepConfig.inputPlaceholder}
                  style={{
                    position: 'absolute',
                    left: '28.5%',
                    top: '36%',
                    width: '65%',
                    height: '9%',
                    fontFamily: 'monospace',
                    fontSize: '1.2em',
                    background: 'transparent',
                    border: 'none',
                    color: 'transparent',
                    caretColor: '#333',
                    outline: 'none',
                    padding: '0 8px',
                    zIndex: 20,
                  }}
                  onClick={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  autoFocus
                  onBlur={e => e.stopPropagation()}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && inputValue.trim() !== '') {
                      setCurrentStep(currentStep + 1);
                      setShowInput(false);
                      setInputValue('');
                    }
                  }}
                />
                {/* Send button overlay (invisible, but still clickable if input is not empty) */}
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    left: '88.5%',
                    top: '45%',
                    width: '4%',
                    height: '6%',
                    background: 'transparent',
                    border: 'none',
                    color: 'transparent',
                    fontWeight: 600,
                    fontSize: '1em',
                    cursor: inputValue.trim() !== '' ? 'pointer' : 'not-allowed',
                    opacity: 0,
                    zIndex: 21,
                  }}
                  disabled={inputValue.trim() === ''}
                  onClick={e => {
                    e.stopPropagation();
                    if (inputValue.trim() === '') return;
                    setCurrentStep(currentStep + 1);
                    setShowInput(false);
                    setInputValue('');
                  }}
                >
                  {/* No text */}
                </button>
              </>
            )}
            {showInput && currentStepConfig.hasInput && currentStep !== 2 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ClickTutor;
