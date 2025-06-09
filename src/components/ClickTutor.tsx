
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ClickTutorProps {
  lessonId: string;
}

const ClickTutor = ({ lessonId }: ClickTutorProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [inputValue, setInputValue] = useState('');
  const [showInput, setShowInput] = useState(false);

  const totalSteps = 8;
  const inputStep = 4; // Step where input is required

  const handleImageClick = () => {
    if (currentStep === inputStep && !showInput) {
      setShowInput(true);
      return;
    }
    
    if (currentStep === inputStep && showInput && inputValue.trim() === '') {
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
    // Handle skip logic
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
            <p className="text-lg mb-4">הוראות למדריך - placeholder</p>
            <p className="text-sm text-gray-600">שלב {currentStep} מתוך {totalSteps}</p>
          </div>

          <div className="relative">
            <div 
              className="relative cursor-pointer border-2 border-red-500 min-h-96 bg-gray-100 rounded-lg flex items-center justify-center"
              onClick={handleImageClick}
            >
              <img 
                src={`/lovable-uploads/${lessonId}-${currentStep}${currentStep >= 4 ? '-e' : ''}.png`}
                alt={`Step ${currentStep}`}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-red-500 bg-opacity-20 rounded-lg pointer-events-none" />
            </div>
            
            {showInput && currentStep === inputStep && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="הכנס ערך כאן"
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
