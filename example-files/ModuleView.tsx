import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { StepContainer } from '@/components/StepContainer';
import ModuleSidebar from '@/components/ModuleSidebar';
import { useModuleData } from '@/hooks/useModuleData';
import { authHelpers } from '@/lib/api';

const ModuleView = () => {
  const { moduleId, stepId } = useParams<{ moduleId: string; stepId: string }>();
  const navigate = useNavigate();
  const { currentModule, loading, error } = useModuleData(moduleId ? parseInt(moduleId) : undefined);
  const { user } = authHelpers.getAuthData();

  const handleStepComplete = () => {
    // Navigate to next step or back to dashboard
    if (currentModule && currentModule.steps) {
      const currentStepIndex = currentModule.steps.findIndex(step => step.id === parseInt(stepId || '0'));
      const nextStep = currentModule.steps[currentStepIndex + 1];
      
      if (nextStep) {
        navigate(`/modules/${moduleId}/step/${nextStep.id}`);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleSkip = () => {
    handleStepComplete();
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleStepSelect = (selectedStepId: number) => {
    navigate(`/modules/${moduleId}/step/${selectedStepId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">טוען מודול...</span>
      </div>
    );
  }

  if (error || !currentModule || !moduleId || !stepId) {
    return (
      <div className="min-h-screen bg-gradient-light flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 font-medium mb-2">שגיאה בטעינת המודול</h3>
          <p className="text-red-600">{error || 'מודול לא נמצא'}</p>
          <Button onClick={handleBack} className="mt-4">
            חזור לדשבורד
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light" dir="rtl">
      {/* Header with module title */}
      <header className="bg-gradient-turquoise shadow-soft border-b-0 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
            className="p-3 text-white hover:bg-white/20 rounded-2xl transition-all duration-300"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{currentModule.title}</h1>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <ModuleSidebar 
          currentModule={currentModule}
          currentStepId={parseInt(stepId)}
          onStepSelect={handleStepSelect}
        />

        {/* Main Content - No wrapper card, let activities handle their own cards */}
        <div className="flex-1 p-8">
          <StepContainer
            stepId={parseInt(stepId)}
            moduleId={parseInt(moduleId)}
            onStepComplete={handleStepComplete}
            onSkip={handleSkip}
          />
        </div>
      </div>
    </div>
  );
};

export default ModuleView;
