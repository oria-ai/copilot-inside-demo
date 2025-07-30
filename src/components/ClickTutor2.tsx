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

interface ClickTutor2Props {
  lessonId: string;
  handleActivityComplete: (lessonId: string, progress: number, understandingRating?: number, lastActivity?: string, lastStep?: number) => void;
  copilotLanguage: string;
  onNavigateToLesson?: (lessonId: string, activityId: string) => void;
}

const configH: StepConfig[] = [
  {
    stepNumber: 1,
    imageName: `2-1-h.png`,
    instructions: 'נכנסנו לקופיילוט, בחר ב"עבודה"',
    clickArea: { top: '34.8%', left: '44%', width: '26%', height: '7%' },
    bg: 'y',
    stepHeader: 'מצא היכן כותבים לקופיילוט פרומפט, וכתוב לו משהו',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 2,
    imageName: `2-2-h.png`,
    instructions: 'כתוב לקופיילוט פרומפט קצר ושלח',
    clickArea: { top: '37%', left: '26%', width: '3%', height: '3%' },
    hasInput: true,
    inputPlaceholder: '',
    bg: 'y',
    stepHeader: 'מצא היכן כותבים לקופיילוט פרומפט, וכתוב לו משהו',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 3,
    imageName: `2-1-h.png`,
    instructions: 'נכנסנו לקופיילוט, בחר ב"עבודה"',
    clickArea: { top: '34.8%', left: '44%', width: '26%', height: '7%' },
    bg: 'y',
    stepHeader: 'כעת לחץ על שורת החיפוש והקלד /',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 4,
    imageName: `2-2-h.png`,
    instructions: 'כתוב לקופיילוט פרומפט קצר ושלח',
    clickArea: { top: '37%', left: '26%', width: '3%', height: '3%' },
    hasInput: true,
    inputPlaceholder: '',
    bg: 'y',
    stepHeader: 'כעת לחץ על שורת החיפוש והקלד /',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
   {
    stepNumber: 5,
    imageName: `2-3-h.png`,
    instructions: 'בחר בקובץ "דרישות משרה מנהל שיווק דיגיטלי"',
    clickArea: { top: '67%', left: '54%', width: '20%', height: '6%' },
    bg: 'y',
    stepHeader: 'בחר בקובץ "דרישות משרה מנהל שיווק דיגיטלי"',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 6,
    imageName: `2-4-h.png`,
    instructions: 'לחץ "Prompt Gallery"',
    clickArea: { top: '82.5%', left: '16%', width: '10%', height: '6%' },
    hasInput: true,
    inputPlaceholder: '',
    bg: 'y',
    stepHeader: 'בקש מקופיילוט לסכם עבורך את הקובץ',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
  {
    stepNumber: 7,
    imageName: `2-6-h.png`,
    instructions: 'פתח את התפקיד ובחר מכירות',
    clickArea: { top: '72%', left: '23%', width: '50%', height: '5%' },
    bg: 'y',
    stepHeader: 'תן לקופיילוט הערה לתיקון',
    stepInstruction: 'לחץ על האזור הנכון בתמונה',
  },
     {
     stepNumber: 8,
     imageName: `2-6-h.png`,
     instructions: 'פתח את התפקיד ובחר מכירות',
     clickArea: { top: '59%', left: '48%', width: '18%', height: '5%' },
     hasInput: true,
     inputPlaceholder: '',
     bg: 'y',
     stepHeader: 'תן לקופיילוט הערה לתיקון',
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

const ClickTutor2 = ({ lessonId, handleActivityComplete, copilotLanguage, onNavigateToLesson }: ClickTutor2Props) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(true);
  const [devMode, setDevMode] = useState(false); // Development mode to show click areas

     // Progress logic
   const totalSteps = 8; // Updated to match the actual number of steps
  const baseProgress = 50; // After video
  const stepIncrement = 40 / totalSteps; // ≈4.44 per step

  // Select config based on copilotLanguage
  const stepConfigs = copilotLanguage === 'hebrew' ? configH : configE;
  const currentStepConfig = stepConfigs[currentStep - 1];

  // Helper to parse percentage string to number
  const percentToNumber = (percent: string) => parseFloat(percent.replace('%', '')) / 100;

  // For step 2, keep showing the correct image (don't switch to 1-4-1)
  const step2Image = (() => {
    return currentStepConfig.imageName;
  })();

  // Handle escape key to close confetti
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showConfetti) {
                                                                                                                                               console.log('Escape pressed, closing confetti');
            setShowConfetti(false);
            if (currentStep === totalSteps) {
              handleFinalCompletion();
            } else if (currentStep === 2 || currentStep === 4 || currentStep === 6) {
              proceedToNextStep();
            }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showConfetti, currentStep]);

           // Auto-focus input when entering step 2, 4, 6, or 8
    useEffect(() => {
      if (currentStep === 2 || currentStep === 4 || currentStep === 6 || currentStep === 8) {
        // Small delay to ensure the input is rendered
        setTimeout(() => {
          setIsInputFocused(true);
        }, 100);
      }
    }, [currentStep]);

  const proceedToNextStep = () => {
    console.log(`Proceeding to step ${currentStep + 1}`);
    const newProgress = baseProgress + stepIncrement * currentStep;
    handleActivityComplete(lessonId, newProgress, undefined, 'tutor2', currentStep);
    setCurrentStep(currentStep + 1);
    setShowInput(false);
    setInputValue('');
  };

  const handleFinalCompletion = () => {
    console.log('Final completion');
    handleActivityComplete(lessonId, 90, undefined, 'tutor2', currentStep);
    // Move to lesson2 video
    if (onNavigateToLesson) {
      onNavigateToLesson('lesson2', 'video');
    }
  };

     // Handler for clicking anywhere on the image
   const handleImageClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                       // In steps 2, 4, 6, or 8, if input is focused or has text, do nothing (except for the send button, which is handled separately)
       if (
         (currentStep === 2 || currentStep === 4 || currentStep === 6 || currentStep === 8) &&
         (isInputFocused || inputValue.trim() !== '')
       ) {
         return;
       }
       // In steps 2, 4, 6, or 8, if input is empty, do nothing
       if ((currentStep === 2 || currentStep === 4 || currentStep === 6 || currentStep === 8) && inputValue.trim() === '') {
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
                // Show confetti popup after step 2, 4, 6, or 8
         if (currentStep === 2 || currentStep === 4 || currentStep === 6 || currentStep === 8) {
           console.log(`Step ${currentStep} completed, showing confetti`);
           setShowConfetti(true);
           return;
         }
       const newProgress = baseProgress + stepIncrement * currentStep;
       handleActivityComplete(lessonId, newProgress, undefined, 'tutor2', currentStep);
       setCurrentStep(currentStep + 1);
       setShowInput(false);
       setInputValue('');
     }
  };

  const handleSkip = () => {
    console.log('Skipping tutor, going to conclusion');
    // Complete the tutor activity and go to conclusion
    handleActivityComplete(lessonId, 90, undefined, 'tutor2', currentStep);
    const event = new CustomEvent('goToConclusion', { detail: { lessonId } });
    window.dispatchEvent(event);
  };

     const handleSendButtonClick = (e: React.MouseEvent) => {
     e.stopPropagation();
     // Only proceed if input is not empty
     if (inputValue.trim() === '') return;
     console.log(`Send button clicked in step ${currentStep}, showing confetti`);
     setShowConfetti(true);
   };

  console.log('Current step:', currentStep, 'Show confetti:', showConfetti);

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
                                                                                                                                                                               console.log('Confetti overlay closed');
              setShowConfetti(false);
              if (currentStep === totalSteps) {
                handleFinalCompletion();
              } else if (currentStep === 2 || currentStep === 4 || currentStep === 6) {
                proceedToNextStep();
              }
        }}
      >
        <div className="text-center" dir="rtl">
                                                                                                                                                                               <h2 className="text-2xl font-bold mb-4">
                {currentStep === totalSteps ? 'כל הכבוד!' : 'מעולה!'}
              </h2>
              <p className="text-lg mb-6">
                {currentStep === 2 
                  ? 'עכשיו נלמד לצרף לקופיילוט קבצים.'
                  : currentStep === 4
                  ? 'נהדר! עכשיו נלמד לבחור קבצים.'
                  : currentStep === 6
                  ? 'מצוין! עכשיו נמשיך לשלב הבא.'
                  : currentStep === totalSteps
                  ? 'כל הכבוד! השלמת את המשימה בהצלחה.'
                  : 'סיימת בהצלחה את כל השלבים! נעבור לסיכום השיעור.'
                }
              </p>
          <Button 
            className="mt-6 w-40 mx-auto block" 
            onClick={() => {
                                                                                                                                                                                                                                               console.log('Continue button clicked');
                  setShowConfetti(false);
                  if (currentStep === totalSteps) {
                    handleFinalCompletion();
                  } else if (currentStep === 2 || currentStep === 4 || currentStep === 6) {
                    proceedToNextStep();
                  }
            }}
          >
                                                                                                                                                                                                               {currentStep === totalSteps ? 'סיום' : 'המשך'}
          </Button>
        </div>
      </ConfettiOverlay>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Step Counter and Centered Header in a Row */}
        <div className="flex items-center justify-between mb-8">
          {/* Right: Step Circle */}
          <div className="w-12 h-12" />
          {/* Center: Header */}
          <h1 className="flex-1 text-center text-2xl font-bold text-dark-gray mb-0">{currentStepConfig.stepHeader}</h1>
          {/* Left: Placeholder for centering */}
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
              src={step2Image}
              alt={`Step ${currentStep}`}
              className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
              onError={e => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
              }}
              draggable={false}
            />
            {/* Show the red hotspot for positioning */}
            {(currentStep !== 2 || devMode) && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: currentStepConfig.clickArea.top,
                  left: currentStepConfig.clickArea.left,
                  width: currentStepConfig.clickArea.width,
                  height: currentStepConfig.clickArea.height,
                  background: (currentStepConfig.bg === 'y' || devMode) ? 'rgba(255,0,0,0.3)' : 'transparent',
                  borderRadius: '8px',
                  border: (currentStepConfig.bg === 'y' || devMode) ? '2px solid red' : 'none',
                  zIndex: 10
                }}
              />
            )}
                                                                                                       {/* Step 2 & 4: Input for 2-2-h image */}
              {(currentStep === 2 || currentStep === 4) && (
              <>
                {copilotLanguage === 'hebrew' ? (
                                                                            // ---- HEBREW INPUT POSITION for 2-2-h: Edit style here ----
                    <input
                      type="text"
                      dir="rtl"
                      value={inputValue}
                      onChange={e => {
                        const newValue = e.target.value;
                        setInputValue(newValue);
                        // Step 4: Auto-proceed when user types "/" or "\"
                        if (currentStep === 4 && (newValue.includes('/') || newValue.includes('\\'))) {
                          setTimeout(() => {
                            console.log('Auto-proceeding from step 4 due to / or \\ input');
                            const newProgress = baseProgress + stepIncrement * currentStep;
                            handleActivityComplete(lessonId, newProgress, undefined, 'tutor2', currentStep);
                            setCurrentStep(currentStep + 1);
                            setInputValue('');
                          }, 500); // Small delay to show the input
                        }
                      }}
                    placeholder={currentStepConfig.inputPlaceholder}
                    style={{
                      position: 'absolute',
                      left: '30%',
                      top: '36%',
                      width: '46.5%',
                      height: '5%',
                      fontFamily: 'ginto',
                      fontSize: '0.8em',
                      background: devMode ? 'rgba(0,255,0,0.4)' : 'transparent',
                      border: devMode ? '3px solid green' : 'none',
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
                    autoFocus={true}
                    onFocus={e => e.stopPropagation()}
                    tabIndex={0}
                  />
                ) : (
                                                                            // ---- ENGLISH INPUT POSITION for 2-2-h: Edit style here ----
                    <input
                      type="text"
                      dir="ltr"
                      value={inputValue}
                      onChange={e => {
                        const newValue = e.target.value;
                        setInputValue(newValue);
                        // Step 4: Auto-proceed when user types "/" or "\"
                        if (currentStep === 4 && (newValue.includes('/') || newValue.includes('\\'))) {
                          setTimeout(() => {
                            console.log('Auto-proceeding from step 4 due to / or \\ input');
                            const newProgress = baseProgress + stepIncrement * currentStep;
                            handleActivityComplete(lessonId, newProgress, undefined, 'tutor2', currentStep);
                            setCurrentStep(currentStep + 1);
                            setInputValue('');
                          }, 500); // Small delay to show the input
                        }
                      }}
                    placeholder={currentStepConfig.inputPlaceholder}
                    style={{
                      position: 'absolute',
                      left: '29%',
                      top: '36%',
                      width: '65%',
                      height: '9%',
                      fontFamily: 'ginto',
                      fontSize: '1em',
                      background: devMode ? 'rgba(0,255,0,0.2)' : 'transparent',
                      border: devMode ? '2px solid green' : 'none',
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
                    autoFocus={true}
                    onFocus={e => e.stopPropagation()}
                    tabIndex={0}
                  />
                )}
                {copilotLanguage === 'hebrew' ? (
                  // ---- HEBREW BUTTON POSITION for 2-2-h: Edit style here ----
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      left: '26%',
                      top: '37%',
                      width: '3%',
                      height: '3%',
                      background: devMode ? 'rgba(255,0,255,0.5)' : 'red',
                      border: devMode ? '2px solid magenta' : 'none',
                      color: devMode ? 'magenta' : 'red',
                      fontWeight: 600,
                      fontSize: '1em',
                      cursor: 'pointer',
                      opacity: devMode ? 0.8 : 0,
                      zIndex: 21,
                    }}
                    onClick={handleSendButtonClick}
                  >
                    {devMode ? 'SEND' : ''}
                  </button>
                ) : (
                  // ---- ENGLISH BUTTON POSITION for 2-2-h: Edit style here ----
                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '26%',
                      width: '4%',
                      height: '6%',
                      background: devMode ? 'rgba(255,0,255,0.5)' : 'transparent',
                      border: devMode ? '2px solid magenta' : 'none',
                      color: devMode ? 'magenta' : 'transparent',
                      fontWeight: 600,
                      fontSize: '1em',
                      cursor: 'pointer',
                      opacity: devMode ? 0.8 : 0,
                      zIndex: 21,
                    }}
                    onClick={handleSendButtonClick}
                  >
                    {devMode ? 'SEND' : ''}
                  </button>
                )}
              </>
            )}
            
            {/* Step 6: Input for 2-4-h image */}
            {currentStep === 6 && (
              <>
                                 {copilotLanguage === 'hebrew' ? (
                                                                             // ---- HEBREW INPUT POSITION for 2-4-h: Edit style here ----
                     <input
                       type="text"
                       dir="rtl"
                       value={inputValue}
                       onChange={e => {
                         const newValue = e.target.value;
                         setInputValue(newValue);
                                                // Step 6: Just update the input value, no auto-progression
                       }}
                                                                                     placeholder="הכנס טקסט"
                                           title="שדה קלט להכנסת טקסט הכולל את האותיות: ס, כ, ם"
                     style={{
                      position: 'absolute',
                      left: '35%',
                      top: '35%',
                      width: '22%',
                      height: '6%',
                      fontFamily: 'ginto',
                      fontSize: '0.9em',
                      background: devMode ? 'rgba(0,100,255,0.4)' : 'transparent',
                      border: devMode ? '3px solid blue' : 'none',
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
                    autoFocus={true}
                    onFocus={e => e.stopPropagation()}
                    tabIndex={0}
                  />
                                 ) : (
                                                                             // ---- ENGLISH INPUT POSITION for 2-4-h: Edit style here ----
                     <input
                       type="text"
                       dir="ltr"
                       value={inputValue}
                       onChange={e => {
                         const newValue = e.target.value;
                         setInputValue(newValue);
                         // Step 6: Just update the input value, no auto-progression
                       }}
                                         placeholder="Enter text"
                     style={{
                      position: 'absolute',
                      left: '15%',
                      top: '25%',
                      width: '60%',
                      height: '8%',
                      fontFamily: 'ginto',
                      fontSize: '1em',
                      background: devMode ? 'rgba(0,100,255,0.2)' : 'transparent',
                      border: devMode ? '2px solid blue' : 'none',
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
                    autoFocus={true}
                    onFocus={e => e.stopPropagation()}
                    tabIndex={0}
                  />
                )}
                {copilotLanguage === 'hebrew' ? (
                                     // ---- HEBREW BUTTON POSITION for 2-4-h: Edit style here ----
                   <button
                     type="button"
                     style={{
                       position: 'absolute',
                       left: '26%',
                       top: '37%',
                       width: '2%',
                       height: '3%',
                       background: devMode ? 'rgba(255,0,255,0.5)' : 'red',
                       border: devMode ? '2px solid magenta' : 'none',
                       color: devMode ? 'magenta' : 'red',
                       fontWeight: 600,
                       fontSize: '1em',
                       cursor: 'pointer',
                       opacity: devMode ? 0.8 : 0,
                       zIndex: 21,
                     }}
                                          onClick={(e) => {
                        e.stopPropagation();
                        // Check if required characters are present
                        const hasRequiredChars = ['ס', 'כ', 'ם'].every(char => inputValue.includes(char));
                        if (!hasRequiredChars || inputValue.trim() === '') return;
                        console.log(`Send button clicked in step ${currentStep}, proceeding to next step`);
                        proceedToNextStep();
                      }}
                  >
                    {devMode ? 'SEND' : ''}
                  </button>
                ) : (
                                     // ---- ENGLISH BUTTON POSITION for 2-4-h: Edit style here ----
                   <button
                     type="button"
                     style={{
                       position: 'absolute',
                       left: '12%',
                       top: '26%',
                       width: '4%',
                       height: '6%',
                       background: devMode ? 'rgba(255,0,255,0.5)' : 'transparent',
                       border: devMode ? '2px solid magenta' : 'none',
                       color: devMode ? 'magenta' : 'transparent',
                       fontWeight: 600,
                       fontSize: '1em',
                       cursor: 'pointer',
                       opacity: devMode ? 0.8 : 0,
                       zIndex: 21,
                     }}
                                          onClick={(e) => {
                        e.stopPropagation();
                        // Check if required characters are present
                        const hasRequiredChars = ['ס', 'כ', 'ם'].every(char => inputValue.includes(char));
                        if (!hasRequiredChars || inputValue.trim() === '') return;
                        console.log(`Send button clicked in step ${currentStep}, proceeding to next step`);
                        proceedToNextStep();
                      }}
                  >
                    {devMode ? 'SEND' : ''}
                  </button>
                )}
                             </>
             )}
             
             {/* Step 8: Input for 2-6-h image */}
             {currentStep === 8 && (
               <>
                 {copilotLanguage === 'hebrew' ? (
                                                                             // ---- HEBREW INPUT POSITION for 2-6-h: Edit style here ----
                                           <input
                        type="text"
                        dir="rtl"
                        value={inputValue}
                        onChange={e => {
                          const newValue = e.target.value;
                          setInputValue(newValue);
                          // Step 8: Just update the input value, no auto-progression
                        }}
                      placeholder=""
                      title="שדה קלט להכנסת טקסט"
                     style={{
                       position: 'absolute',
                       left: '26%',
                       top: '72.3%',
                       width: '47%',
                       height: '5%',
                       fontFamily: 'ginto',
                       fontSize: '0.9em',
                       background: devMode ? 'rgba(255,165,0,0.4)' : 'transparent',
                       border: devMode ? '3px solid orange' : 'none',
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
                     autoFocus={true}
                     onFocus={e => e.stopPropagation()}
                     tabIndex={0}
                   />
                 ) : (
                                                                             // ---- ENGLISH INPUT POSITION for 2-6-h: Edit style here ----
                                           <input
                        type="text"
                        dir="ltr"
                        value={inputValue}
                        onChange={e => {
                          const newValue = e.target.value;
                          setInputValue(newValue);
                          // Step 8: Just update the input value, no auto-progression
                        }}
                      placeholder=""
                      title="Input field for entering text"
                     style={{
                       position: 'absolute',
                       left: '20%',
                       top: '40%',
                       width: '50%',
                       height: '5%',
                       fontFamily: 'ginto',
                       fontSize: '1em',
                       background: devMode ? 'rgba(255,165,0,0.2)' : 'transparent',
                       border: devMode ? '2px solid orange' : 'none',
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
                     autoFocus={true}
                     onFocus={e => e.stopPropagation()}
                     tabIndex={0}
                   />
                 )}
                 {copilotLanguage === 'hebrew' ? (
                   // ---- HEBREW BUTTON POSITION for 2-6-h: Edit style here ----
                   <button
                     type="button"
                     style={{
                       position: 'absolute',
                       left: '23%',
                       top: '72%',
                       width: '3%',
                       height: '5%',
                       background: devMode ? 'rgba(255,0,255,0.5)' : 'red',
                       border: devMode ? '2px solid magenta' : 'none',
                       color: devMode ? 'magenta' : 'red',
                       fontWeight: 600,
                       fontSize: '1em',
                       cursor: 'pointer',
                       opacity: devMode ? 0.8 : 0,
                       zIndex: 21,
                     }}
                     onClick={(e) => {
                       e.stopPropagation();
                       if (inputValue.trim() === '') return;
                       console.log(`Send button clicked in step ${currentStep}, showing confetti`);
                       setShowConfetti(true);
                     }}
                   >
                     {devMode ? 'SEND' : ''}
                   </button>
                 ) : (
                   // ---- ENGLISH BUTTON POSITION for 2-6-h: Edit style here ----
                   <button
                     type="button"
                     style={{
                       position: 'absolute',
                       left: '18S%',
                       top: '40%',
                       width: '3%',
                       height: '5%',
                       background: devMode ? 'rgba(255,0,255,0.5)' : 'transparent',
                       border: devMode ? '2px solid magenta' : 'none',
                       color: devMode ? 'magenta' : 'transparent',
                       fontWeight: 600,
                       fontSize: '1em',
                       cursor: 'pointer',
                       opacity: devMode ? 0.8 : 0,
                       zIndex: 21,
                     }}
                     onClick={(e) => {
                       e.stopPropagation();
                       if (inputValue.trim() === '') return;
                       console.log(`Send button clicked in step ${currentStep}, showing confetti`);
                       setShowConfetti(true);
                     }}
                   >
                     {devMode ? 'SEND' : ''}
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

        {/* Instructions */}
        <div className="text-center mb-8">
          <p className="text-xl font-medium text-dark-gray">{currentStepConfig.stepInstruction}</p>
        </div>

        {/* Dev Mode Toggle Button */}
        <div className="text-center mb-4">
          <Button 
            variant={devMode ? "default" : "outline"}
            onClick={() => setDevMode(!devMode)}
            className={`px-6 py-2 rounded-xl text-sm ${
              devMode 
                ? 'bg-purple-500 text-white hover:bg-purple-600' 
                : 'border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white'
            } transition-all duration-300`}
          >
            {devMode ? '🔧 Dev Mode ON' : '🔧 Dev Mode OFF'}
          </Button>
                     {devMode && (
                           <div className="text-xs text-gray-500 mt-1">
                                 <p>Red = Click Areas | Green = Input for 2-2-h | Blue = Input for 2-4-h | Orange = Input for 2-6-h | Magenta = Send Buttons</p>
                <p>Current Language: <span className="font-bold">{copilotLanguage}</span></p>
                <p>Step: {currentStep} | Image: {currentStepConfig.imageName}</p>
              </div>
           )}
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

export default ClickTutor2; 