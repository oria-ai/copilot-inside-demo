import React, { useState, useEffect } from 'react';
import { Instructions, QuestionMultiChoice, QuestionOpen } from '@/components/tasks';
import { Button } from './ui/button';
import { useAnalytics } from '../contexts/AnalyticsProvider';

interface ComponentContent {
  text?: string;
  questionText?: string;
  options?: string[];
  correctAnswers?: number[];
  requiredAnswersCount?: number;
  hint?: string;
  helpText?: string;
  systemPrompt?: string;
  placeholder?: string;
}

interface Component {
  componentId: number;
  type: string;
  slot: string;
  content: ComponentContent;
}

interface Screen {
  screenId: number;
  order: number;
  components: Component[];
}

interface SkillProps {
  lessonId: string;
  screens: Screen[];
  onNext: () => void;
  handleActivityComplete: (lessonId: string, progress: number) => void;
}

export const Skill: React.FC<SkillProps> = ({
  lessonId,
  screens,
  onNext,
  handleActivityComplete,
}) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const { logEvent } = useAnalytics();

  const currentScreen = screens[currentScreenIndex];
  const isLastScreen = currentScreenIndex === screens.length - 1;

  // Convert lessonId to numbers for the task components
  const moduleId = parseInt(lessonId) || 0;
  const stepId = currentScreen?.screenId || 0;

  useEffect(() => {
    if (currentScreen) {
      logEvent({
        eventType: 'SKILL_SCREEN_VIEW',
        moduleId,
        stepId,
        screenId: currentScreen.screenId,
        eventData: {
          screenIndex: currentScreenIndex + 1,
          totalScreens: screens.length,
        },
      });
    }
  }, [currentScreen, currentScreenIndex, screens.length, moduleId, stepId, logEvent]);

  const handleAnswer = (screenId: number, answer: unknown) => {
    setAnswers(prev => ({
      ...prev,
      [screenId]: answer
    }));
  };

  const handleNext = () => {
    if (isLastScreen) {
      // Mark as completed and call completion handler
      setIsCompleted(true);
      const progress = 100; // 100% completion for skill activities
      handleActivityComplete(lessonId, progress);
      
      logEvent({
        eventType: 'SKILL_COMPLETED',
        moduleId,
        stepId,
        eventData: {
          totalScreens: screens.length,
          answers: answers,
        },
      });
      
      // Call onNext to trigger navigation
      onNext();
    } else {
      // Move to next screen
      setCurrentScreenIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentScreenIndex > 0) {
      setCurrentScreenIndex(prev => prev - 1);
    }
  };

  const renderComponent = (component: Component) => {
    const { type, content, componentId } = component;

    switch (type) {
      case 'INSTRUCTIONS':
        return (
          <Instructions
            key={componentId}
            content={{
              text: content.text || '',
              ...content
            }}
          />
        );
        
      case 'QUESTION_MULTICHOICE':
        return (
          <QuestionMultiChoice
            key={componentId}
            content={{
              questionText: content.questionText || '',
              options: content.options || [],
              correctAnswers: content.correctAnswers,
              requiredAnswersCount: content.requiredAnswersCount,
              hint: content.hint,
              ...content
            }}
            moduleId={moduleId}
            stepId={stepId}
            screenId={currentScreen.screenId}
            onAnswer={(selectedOptions, isCorrect) => handleAnswer(currentScreen.screenId, { selectedOptions, isCorrect })}
          />
        );
        
      case 'QUESTION_OPEN':
        return (
          <QuestionOpen
            key={componentId}
            content={{
              questionText: content.questionText || '',
              placeholder: content.placeholder,
              hint: content.hint,
              helpText: content.helpText,
              systemPrompt: content.systemPrompt,
              ...content
            }}
            moduleId={moduleId}
            stepId={stepId}
            screenId={currentScreen.screenId}
            onAnswer={(answer) => handleAnswer(currentScreen.screenId, answer)}
          />
        );
        
      default:
        return (
          <div key={componentId} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">Unknown component type: {type}</p>
          </div>
        );
    }
  };

  if (!currentScreen) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">לא נמצא תוכן עבור המשימה</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          שלב {currentScreenIndex + 1} מתוך {screens.length}
        </div>
        <div className="flex-1 mx-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentScreenIndex + 1) / screens.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Current screen content */}
      <div className="space-y-6">
        {currentScreen.components.map(component => renderComponent(component))}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentScreenIndex === 0}
          className="px-6"
        >
          הקודם
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!answers[currentScreen.screenId] && currentScreen.components.some(c => 
            c.type === 'QUESTION_MULTICHOICE' || c.type === 'QUESTION_OPEN'
          )}
          className="px-6"
        >
          {isLastScreen ? 'סיים' : 'הבא'}
        </Button>
      </div>
    </div>
  );
};

export default Skill; 