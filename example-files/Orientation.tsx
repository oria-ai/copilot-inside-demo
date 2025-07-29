import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ConfettiOverlay from '@/components/ConfettiOverlay';

interface StepConfig {
  stepNumber: number;
  imageName?: string; // Optional, for backward compatibility
  imageUrl?: string; // The full URL from the server
  instructions: string;
  clickArea?: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
  inputArea?: { // For positioning input fields
    top: string;
    left: string;
    width: string;
    height: string;
  };
  hasInput?: boolean;
  inputPlaceholder?: string;
  bg?: 'y' | 'n';
  stepHeader: string;
  stepInstruction: string;
}

interface OrientationProps {
  lessonId: string;
  handleActivityComplete: () => void;
  copilotLanguage: string;
  steps: StepConfig[];
}

const Orientation = ({ lessonId, handleActivityComplete, copilotLanguage, steps }: OrientationProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(true);

  const totalSteps = steps?.length || 0;
  const currentStepConfig = steps[currentStep - 1];

  const handleFinalCompletion = useCallback(() => {
    handleActivityComplete();
  }, [handleActivityComplete]);

  const proceedToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setInputValue('');
    } else {
      handleFinalCompletion();
    }
  }, [currentStep, totalSteps, handleFinalCompletion]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showConfetti) {
        setShowConfetti(false);
        proceedToNextStep();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfetti, proceedToNextStep]);
  
  const handleSkip = useCallback(() => {
    handleFinalCompletion();
  }, [handleFinalCompletion]);

  if (!steps || steps.length === 0) {
    return <div>Loading interactive steps...</div>;
  }

  // Ensure we have valid configuration
  const clickArea = currentStepConfig?.clickArea || {
    top: '0%',
    left: '0%',
    width: '100%',
    height: '100%',
  };

  const inputArea = currentStepConfig?.inputArea || {
    top: '40%',
    left: '30%',
    width: '40%',
    height: '20%',
  };

  const percentToNumber = (percent: string) => parseFloat(percent.replace('%', '')) / 100;

  // Debug: log what we're receiving
  console.log('Current step config:', currentStepConfig);
  console.log('Has imageUrl?', currentStepConfig?.imageUrl);

  // Get the image URL - prefer imageUrl from server, fallback to imageName
  const imageUrl = currentStepConfig.imageUrl || 
    (currentStepConfig.imageName ? `/${currentStepConfig.imageName}` : '/placeholder.svg');

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const wrapper = e.currentTarget;
    const rect = wrapper.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width;
    const relY = (e.clientY - rect.top) / rect.height;

    const areaLeft = percentToNumber(clickArea.left);
    const areaTop = percentToNumber(clickArea.top);
    const areaWidth = percentToNumber(clickArea.width);
    const areaHeight = percentToNumber(clickArea.height);

    const inArea =
      relX >= areaLeft &&
      relX <= areaLeft + areaWidth &&
      relY >= areaTop &&
      relY <= areaTop + areaHeight;

    if (!inArea) return;

    // Handle input steps
    if (currentStepConfig.hasInput && inputValue.trim() !== '') {
      setShowConfetti(true);
    } 
    // Handle non-input steps
    else if (!currentStepConfig.hasInput) {
      if (currentStep === totalSteps) {
        setShowConfetti(true);
      } else {
        proceedToNextStep();
      }
    }
  };

  const handleInputSubmit = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (inputValue.trim() === '') return;
    setShowConfetti(true);
  };

  return (
    <>
      {/* Start Task Popup */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent className="text-right max-w-md" dir="rtl">
          <DialogHeader className="items-center text-center">
            <DialogTitle className="w-full text-center">הנחיות למשימה</DialogTitle>
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
          setShowConfetti(false);
          proceedToNextStep();
        }}
      >
        <div className="text-center" dir="rtl">
          <h2 className="text-2xl font-bold mb-4">
            {currentStep === totalSteps ? 'כל הכבוד!' : 'מעולה!'}
          </h2>
          <p className="text-lg mb-6">
            {currentStep === totalSteps 
              ? 'סיימת בהצלחה את כל השלבים! נעבור לסיכום השיעור.'
              : 'המשך לשלב הבא'
            }
          </p>
          <Button 
            className="mt-6 w-40 mx-auto block" 
            onClick={() => {
              setShowConfetti(false);
              proceedToNextStep();
            }}
          >
            {currentStep === totalSteps ? 'סיום' : 'המשך'}
          </Button>
        </div>
      </ConfettiOverlay>

      <div className="p-8 max-w-4xl mx-auto">
        {/* Step Counter and Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-12 h-12" />
          <h1 className="flex-1 text-center text-2xl font-bold text-dark-gray mb-0">{currentStepConfig.stepHeader}</h1>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-lg font-bold text-gray-700">
            {currentStep}/{totalSteps}
          </div>
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
              src={imageUrl}
              alt={`Step ${currentStep}`}
              className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
              }}
              draggable={false}
            />
            
            {/* Show the click area if enabled */}
            {currentStepConfig.bg === 'y' && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: clickArea.top,
                  left: clickArea.left,
                  width: clickArea.width,
                  height: clickArea.height,
                  background: 'rgba(255,0,0,0.3)',
                  borderRadius: '8px',
                  border: '2px solid red',
                  zIndex: 10
                }}
              />
            )}
            
            {/* Input field for steps that require input */}
            {currentStepConfig.hasInput && (
              <input
                type="text"
                dir={copilotLanguage === 'hebrew' ? 'rtl' : 'ltr'}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder={currentStepConfig.inputPlaceholder}
                style={{
                  position: 'absolute',
                  left: inputArea.left,
                  top: inputArea.top,
                  width: inputArea.width,
                  height: inputArea.height,
                  fontFamily: 'ginto',
                  fontSize: '1em',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '2px solid #3B82F6',
                  borderRadius: '8px',
                  color: '#333',
                  caretColor: '#333',
                  outline: 'none',
                  padding: '0 12px',
                  zIndex: 20,
                  cursor: 'text',
                }}
                onClick={e => e.stopPropagation()}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleInputSubmit(e);
                  }
                }}
                autoFocus
              />
            )}
          </div>
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

export default Orientation;