import React, { useEffect } from 'react';
import { useStepData } from '../hooks/useModuleData';
import { useAnalytics } from '../contexts/AnalyticsProvider';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Import high-level activity components
import VideoLesson from '@/components/VideoLesson';
import Orientation from '@/components/Orientation';
import Skill from '@/components/Skill';
import Handson from '@/components/Handson';
import Conclusion from '@/components/Conclusion';
import { Button } from './ui/button';

interface StepContainerProps {
  stepId: number;
  moduleId: number;
  onStepComplete?: () => void;
  onSkip?: () => void;
}

export const StepContainer: React.FC<StepContainerProps> = ({ 
  stepId, 
  moduleId, 
  onStepComplete, // This will be deprecated by our new logic
  onSkip,
}) => {
  const { stepData, loading, error } = useStepData(stepId);
  const { user } = useAuth();
  const { logEvent } = useAnalytics();
  const navigate = useNavigate();

  useEffect(() => {
    if (stepData) {
      logEvent({
        eventType: 'STEP_VIEW',
        moduleId,
        stepId,
        eventData: {
          stepType: stepData.type,
          header: stepData.header,
        },
      });
    }
  }, [stepData, moduleId, stepId, logEvent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">טוען שלב...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-red-800 font-medium mb-2">שגיאה בטעינת התוכן</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stepData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">לא נמצא תוכן עבור שלב זה</p>
      </div>
    );
  }

  const handleActivityComplete = async () => {
    logEvent({
      eventType: 'STEP_COMPLETED',
      moduleId,
      stepId,
    });
    
    // The new navigation logic
    if (stepData?.nextActivityId) {
      navigate(`/modules/${moduleId}/step/${stepData.nextActivityId}`);
    } else {
      // It's the last activity, go to dashboard
      navigate('/dashboard');
    }
  };

  const renderActivity = () => {
    console.log('🔍 StepContainer renderActivity - Activity Type:', stepData.type);
    console.log('🔍 StepContainer renderActivity - Screens data:', stepData.screens);
    
    switch (stepData.type) {
      case 'VIDEO': {
        const videoContent = stepData.screens[0]?.components[0]?.content;
        return (
          <VideoLesson
            videoUrl={videoContent?.url || ''}
            videoTitle={stepData.header}
            lessonId={moduleId.toString()}
            lessonDisplayName={stepData.header}
            handleActivityComplete={handleActivityComplete} // Pass the new handler
            onNext={handleActivityComplete} // Also for the 'Next' button
          />
        );
      }
      case 'ORIENTATION':
        return (
            <Orientation
                lessonId={moduleId.toString()}
                copilotLanguage={user?.language || 'hebrew'}
                steps={stepData.screens.map(s => s.components[0].content)}
                handleActivityComplete={handleActivityComplete}
            />
        );
      case 'SKILL':
        console.log('🎯 SKILL Activity - Screens being passed:', stepData.screens);
        return (
            <Skill
                lessonId={moduleId.toString()}
                screens={stepData.screens}
                onNext={handleActivityComplete}
                handleActivityComplete={(lessonId, progress) => handleActivityComplete()}
            />
        );
      case 'HANDSON':
        console.log('🤲 HANDSON Activity - Screens being passed:', stepData.screens);
        return (
            <Handson
                lessonId={moduleId.toString()}
                screens={stepData.screens}
                handleActivityComplete={(lessonId, progress) => handleActivityComplete()}
            />
        );
      case 'CONCLUSION': {
         const conclusionContent = stepData.screens[0]?.components[0]?.content;
         return (
             <Conclusion
                 lessonId={moduleId.toString()}
                 content={conclusionContent}
                 onConclusionComplete={handleActivityComplete}
                 onBack={onSkip} // onSkip can still be used for "Back"
             />
         );
      }
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Unknown activity type: {stepData.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>{renderActivity()}</div>
      
      {onSkip && stepData.type !== 'CONCLUSION' && (
         <div className="flex justify-center pt-6 border-t border-gray-200 mt-6">
            <Button
              variant="outline"
              onClick={onSkip}
              className="text-gray-600 hover:text-gray-800"
            >
              דלג
            </Button>
        </div>
      )}
    </div>
  );
};
