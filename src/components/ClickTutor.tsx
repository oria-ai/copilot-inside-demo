import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfettiOverlay from '@/components/ConfettiOverlay';

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

interface ClickTutorProps {
  lessonId: string;
  handleActivityComplete: (lessonId: string, progress: number, understandingRating?: number, lastActivity?: string, lastStep?: number) => void;
}

const ClickTutor = ({ lessonId, handleActivityComplete }: ClickTutorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Progress logic
  const totalSteps = 6;
  const baseProgress = 50; // After video
  const stepIncrement = 40 / totalSteps; // ≈6.67 per step

  // ===== STEP CONFIGURATION - EDIT HERE =====
  const stepConfigs: StepConfig[] = [
    {
      stepNumber: 1,
      imageName: `1-3.png`,
      instructions: 'נכנסנו לקופיילוט, בחר ב"עבודה"',
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
      imageName: `1-4-e.png`,
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

  // Helper to parse percentage string to number
  const percentToNumber = (percent: string) => parseFloat(percent.replace('%', '')) / 100;

  // For step 2, determine which image to show based on input focus or value
  const step2Image = currentStep === 2 && (isInputFocused || inputValue.trim() !== '') ? '1-4-1-e.png' : currentStepConfig.imageName;

  // Handle escape key to close confetti
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showConfetti) {
        console.log('Escape pressed, closing confetti');
        setShowConfetti(false);
        if (currentStep === 2) {
          proceedToStep3();
        } else if (currentStep === totalSteps) {
          handleFinalCompletion();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfetti, currentStep]);

  const proceedToStep3 = () => {
    console.log('Proceeding to step 3');
    const newProgress = baseProgress + stepIncrement * currentStep;
    handleActivityComplete(lessonId, newProgress, undefined, 'tutor', currentStep);
    setCurrentStep(3);
    setShowInput(false);
    setInputValue('');
  };

  const handleFinalCompletion = () => {
    console.log('Final completion');
    handleActivityComplete(lessonId, 90, undefined, 'tutor', currentStep);
    // Move to conclusion activity
    const event = new CustomEvent('goToConclusion', { detail: { lessonId } });
    window.dispatchEvent(event);
  };

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
      return;
    }

    // Move to conclusion if on last step
    if (currentStep === totalSteps) {
      console.log('Final step completed, showing confetti');
      setShowConfetti(true);
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
      // Show confetti popup after step 2
      if (currentStep === 2) {
        console.log('Step 2 completed, showing confetti');
        setShowConfetti(true);
        return;
      }
      const newProgress = baseProgress + stepIncrement * currentStep;
      handleActivityComplete(lessonId, newProgress, undefined, 'tutor', currentStep);
      setCurrentStep(currentStep + 1);
      setShowInput(false);
      setInputValue('');
    }
  };

  const handleSkip = () => {
    console.log('Skipping tutor');
  };

  const handleSendButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inputValue.trim() === '') return;
    console.log('Send button clicked in step 2, showing confetti');
    setShowConfetti(true);
  };

  console.log('Current step:', currentStep, 'Show confetti:', showConfetti);

  return (
    <>
      <ConfettiOverlay 
        open={showConfetti} 
        onClose={() => {
          console.log('Confetti overlay closed');
          setShowConfetti(false);
          if (currentStep === 2) {
            proceedToStep3();
          } else if (currentStep === totalSteps) {
            handleFinalCompletion();
          }
        }}
      >
        <div className="text-center" dir="rtl">
          <h2 className="text-2xl font-bold mb-4">
            {currentStep === 2 ? 'מעולה!' : 'כל הכבוד!'}
          </h2>
          <p className="text-lg mb-6">
            {currentStep === 2 
              ? 'עכשיו אתה יודע איך לשוחח עם קופיילוט. בוא נמצא יחד את ספריית הפרומפטים'
              : 'סיימת בהצלחה את כל השלבים! עכשיו אתה מוכן להתחיל להשתמש בקופיילוט'
            }
          </p>
          <Button 
            className="w-full" 
            onClick={() => {
              console.log('Continue button clicked');
              setShowConfetti(false);
              if (currentStep === 2) {
                proceedToStep3();
              } else if (currentStep === totalSteps) {
                handleFinalCompletion();
              }
            }}
          >
            {currentStep === 2 ? 'המשך' : 'סיום'}
          </Button>
        </div>
      </ConfettiOverlay>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>בוא נעשה זאת יחד</CardTitle>
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
                  <input
                    type="text"
                    dir="ltr"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={currentStepConfig.inputPlaceholder}
                    style={{
                      position: 'absolute',
                      left: '29%',
                      top: '36%',
                      width: '65%',
                      height: '9%',
                      fontFamily: 'ginto',
                      fontSize: '1em',
                      background: 'transparent',
                      border: 'none',
                      color: '#333',
                      caretColor: '#333',
                      outline: 'none',
                      padding: '0 8px',
                      zIndex: 20,
                      cursor: isInputFocused ? 'text' : 'pointer',
                    }}
                    onClick={e => {
                      e.stopPropagation();
                      setIsInputFocused(true);
                    }}
                    onBlur={() => setIsInputFocused(false)}
                    autoFocus={false}
                    onFocus={e => e.stopPropagation()}
                    tabIndex={0}
                  />
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
                    onClick={handleSendButtonClick}
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
    </>
  );
};

export default ClickTutor;
