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
  bg: 'y' | 'n';
  stepHeader: string;
  stepInstruction: string;
}

interface ClickTutorProps {
  lessonId: string;
  handleActivityComplete: (lessonId: string, progress: number, understandingRating?: number, lastActivity?: string, lastStep?: number) => void;
  copilotLanguage: string;
}

const configH: StepConfig[] = [
  {
    stepNumber: 1,
    imageName: `1-3.png`,
    instructions: 'נכנסנו לקופיילוט, בחר ב"עבודה"',
    clickArea: { top: '42%', left: '52%', width: '26%', height: '31%' },
    bg: 'n',
    stepHeader: 'בצע את ההוראה הבאה',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 2,
    imageName: `1-4-h.png`,
    instructions: 'כתוב לקופיילוט פרומפט קצר ושלח',
    clickArea: { top: '36%', left: '28.5%', width: '65%', height: '9%' },
    hasInput: true,
    inputPlaceholder: '',
    bg: 'n',
    stepHeader: 'כתוב לקופיילוט פרומפט קצר ושלח',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 3,
    imageName: `1-4-h.png`,
    instructions: 'לחץ "הראה עוד"',
    clickArea: { top: '73%', left: '8%', width: '9%', height: '6%' },
    bg: 'n',
    stepHeader: 'לחץ "הראה עוד"',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 4,
    imageName: `1-6-h.png`,
    instructions: 'לחץ "Prompt Gallery"',
    clickArea: { top: '82.5%', left: '16%', width: '10%', height: '6%' },
    bg: 'n',
    stepHeader: 'לחץ "גלריית ההנחיות"',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 5,
    imageName: `1-7-h.png`,
    instructions: 'פתח את התפקיד ובחר מכירות',
    clickArea: { top: '30%', left: '47%', width: '19%', height: '5%' },
    bg: 'n',
    stepHeader: 'פתח את "סוג משימה" ובחר "טכנולוגיית מידע"',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 6,
    imageName: `1-8-h.png`,
    instructions: 'פתח את התפקיד ובחר מכירות',
    clickArea: { top: '59%', left: '48%', width: '18%', height: '5%' },
    bg: 'n',
    stepHeader: 'פתח את "סוג משימה" ובחר "טכנולוגיית מידע"',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  }
];

const configE: StepConfig[] = [
  {
    stepNumber: 1,
    imageName: `1-3.png`,
    instructions: 'Entered Copilot, select "Work"',
    clickArea: { top: '42%', left: '52%', width: '26%', height: '31%' },
    bg: 'y',
    stepHeader: 'Follow the instruction below',
    stepInstruction: 'Click the correct area in the image',
  },
  {
    stepNumber: 2,
    imageName: `1-4-e.png`,
    instructions: 'Write a short prompt to Copilot and send',
    clickArea: { top: '36%', left: '28.5%', width: '65%', height: '9%' },
    hasInput: true,
    inputPlaceholder: '',
    bg: 'n',
    stepHeader: 'Follow the instruction below',
    stepInstruction: 'Click the correct area in the image',
  },
  {
    stepNumber: 3,
    imageName: `1-4-e.png`,
    instructions: 'Click "See more"',
    clickArea: { top: '73%', left: '83%', width: '9%', height: '6%' },
    bg: 'y',
    stepHeader: 'בצע את ההוראה הבאה',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 4,
    imageName: `1-6-e.png`,
    instructions: 'Click "Prompt Gallery"',
    clickArea: { top: '82%', left: '75%', width: '10%', height: '6%' },
    bg: 'y',
    stepHeader: 'בצע את ההוראה הבאה',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 5,
    imageName: `1-7-e.png`,
    instructions: 'Open the role and select Sales',
    clickArea: { top: '30%', left: '34%', width: '19%', height: '5%' },
    bg: 'y',
    stepHeader: 'בצע את ההוראה הבאה',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 6,
    imageName: `1-8-e.png`,
    instructions: 'Open the role and select Sales',
    clickArea: { top: '54%', left: '34%', width: '6%', height: '5%' },
    bg: 'y',
    stepHeader: 'בצע את ההוראה הבאה',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  }
];

const ClickTutor = ({ lessonId, handleActivityComplete, copilotLanguage }: ClickTutorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(true);

  // Progress logic
  const totalSteps = 6;
  const baseProgress = 50; // After video
  const stepIncrement = 40 / totalSteps; // ≈6.67 per step

  // Select config based on copilotLanguage
  const stepConfigs = copilotLanguage === 'hebrew' ? configH : configE;
  const currentStepConfig = stepConfigs[currentStep - 1];

  // Helper to parse percentage string to number
  const percentToNumber = (percent: string) => parseFloat(percent.replace('%', '')) / 100;

  // For step 2, determine which image to show based on input focus or value
  const step2Image = (() => {
    if (currentStep === 2 && (isInputFocused || inputValue.trim() !== '')) {
      if (copilotLanguage === 'hebrew') return '1-4-1-h.png';
      return '1-4-1-e.png';
    }
    return currentStepConfig.imageName;
  })();

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
    // In step 2, if input is focused or has text, do nothing (except for the send button, which is handled separately)
    if (
      currentStep === 2 &&
      (isInputFocused || inputValue.trim() !== '')
    ) {
      return;
    }
    // In step 2, if input is empty, do nothing
    if (currentStep === 2 && inputValue.trim() === '') {
      return;
    }
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
    console.log('Skipping tutor, going to conclusion');
    // Complete the tutor activity and go to conclusion
    handleActivityComplete(lessonId, 90, undefined, 'tutor', currentStep);
    const event = new CustomEvent('goToConclusion', { detail: { lessonId } });
    window.dispatchEvent(event);
  };

  const handleSendButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Only proceed if input is not empty
    if (inputValue.trim() === '') return;
    console.log('Send button clicked in step 2, showing confetti');
    setShowConfetti(true);
  };

  console.log('Current step:', currentStep, 'Show confetti:', showConfetti);

  return (
    <>
      {/* Start Task Popup */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent className="text-right max-w-md" dir="rtl">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="w-full text-center">התחלת משימה</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center">
            <p className="text-center">לפניך מדריך טכני שנועד לוודא שאתה יודע איך לבצע את מה שלמדנו בשיעור. כדי להתקדם, עליך ללחוץ על האזור הנכון בתמונה.</p>
            <Button className="mt-6 w-40 mx-auto block" onClick={() => setStartDialogOpen(false)}>
              התחל
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
              ? 'עכשיו אתה יודע איך לשוחח עם קופיילוט. בוא נמצא יחד את ספריית הפרומפטים.'
              : 'סיימת בהצלחה את כל השלבים! נעבור לסיכום השיעור.'
            }
          </p>
          <Button 
            className="mt-6 w-40 mx-auto block" 
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

      <div className="p-8 max-w-4xl mx-auto">
        {/* Centered Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-dark-gray mb-2">{currentStepConfig.stepHeader}</h1>
        </div>

        {/* Photo Section */}
        <div className="mb-6">
          <div
            className="relative w-full max-w-3xl mx-auto aspect-[16/9] bg-transparent rounded-3xl flex items-center justify-center overflow-hidden shadow-soft"
            style={{ minHeight: '400px' }}
            onClick={handleImageClick}
            role="button"
            aria-label="המשך לשלב הבא על ידי לחיצה על האזור המתאים"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') handleImageClick(e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>);
            }}
          >
            <img
              src={step2Image}
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
                  height: currentStepConfig.clickArea.height,
                  background: currentStepConfig.bg === 'y' ? 'rgba(255,0,0,0.3)' : 'transparent',
                  borderRadius: '8px',
                  border: currentStepConfig.bg === 'y' ? '2px solid red' : 'none',
                  zIndex: 10
                }}
              />
            )}
            {/* Step 2: Overlay invisible input and send button */}
            {currentStep === 2 && (
              <>
                {copilotLanguage === 'hebrew' ? (
                  // ---- HEBREW INPUT POSITION: Edit style here for Hebrew ----
                  <input
                    type="text"
                    dir="rtl"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder={currentStepConfig.inputPlaceholder}
                    style={{
                      position: 'absolute',
                      left: '8%',
                      top: '36%',
                      width: '63%',
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
                      cursor: 'pointer',
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
                ) : (
                  // ---- ENGLISH INPUT POSITION: Edit style here for English ----
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
                      cursor: 'pointer',
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
                )}
                {copilotLanguage === 'hebrew' ? (
                  // ---- HEBREW BUTTON POSITION: Edit style here for Hebrew ----
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      left: '8%',
                      top: '45%',
                      width: '4%',
                      height: '6%',
                      background: 'red',
                      border: 'none',
                      color: 'red',
                      fontWeight: 600,
                      fontSize: '1em',
                      cursor: 'pointer',
                      opacity: 0,
                      zIndex: 21,
                    }}
                    onClick={handleSendButtonClick}
                  >
                    {/* No text */}
                  </button>
                ) : (
                  // ---- ENGLISH BUTTON POSITION: Edit style here for English ----
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
                      cursor: 'pointer',
                      opacity: 0,
                      zIndex: 21,
                    }}
                    onClick={handleSendButtonClick}
                  >
                    {/* No text */}
                  </button>
                )}
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
        </div>

        {/* Step Counter */}
        <div className="text-center mb-4">
          <p className="text-lg font-medium text-medium-gray">שלב {currentStep} מתוך {totalSteps}</p>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8">
          <p className="text-xl font-medium text-dark-gray">{currentStepConfig.stepInstruction}</p>
        </div>

        {/* Skip Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="px-8 py-3 rounded-2xl border-2 border-primary-turquoise text-primary-turquoise hover:bg-primary-turquoise hover:text-white transition-all duration-300"
          >
            דלג לסיכום
          </Button>
        </div>
      </div>
    </>
  );
};

export default ClickTutor;