import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress, CircularProgress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, PlayCircle, CheckCircle2, Activity, BookOpenCheck, Dumbbell, FileText, Glasses } from 'lucide-react';
import { useUserProgress } from '@/hooks/useModuleData';

interface Step {
  id: number;
  title: string;
  type: string;
  order: number;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  iconPath?: string;
  steps: Step[];
}

interface SidebarProps {
  currentModule: Module;
  currentStepId: number;
  onStepSelect: (stepId: number) => void;
}

const ModuleSidebar = ({ 
  currentModule, 
  currentStepId, 
  onStepSelect 
}: SidebarProps) => {
  const { progress } = useUserProgress();

  const getStepProgress = (stepId: number) => {
    const stepProgress = progress.find(p => p.stepId === stepId);
    return stepProgress?.progressPercent || 0;
  };

  const isStepCompleted = (stepId: number) => {
    const stepProgress = progress.find(p => p.stepId === stepId);
    return stepProgress?.status === 'COMPLETED';
  };

  const getModuleProgress = () => {
    if (!currentModule.steps.length) return 0;
    const totalProgress = currentModule.steps.reduce((sum, step) => {
      return sum + getStepProgress(step.id);
    }, 0);
    return Math.round(totalProgress / currentModule.steps.length);
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'VIDEO':
        return PlayCircle;
      case 'ORIENTATION':
        return Glasses;
      case 'SKILL':
        return Dumbbell;
      case 'HANDSON':
        return FileText;
      case 'CHAT':
        return Activity;
      case 'CONCLUSION':
        return BookOpenCheck;
      default:
        return Activity;
    }
  };

  const getStepTypeLabel = (stepType: string) => {
    switch (stepType) {
      case 'VIDEO':
        return 'וידאו';
      case 'ORIENTATION':
        return 'היכרות';
      case 'SKILL':
        return 'מיומנות';
      case 'HANDSON':
        return 'תרגול';
      case 'CHAT':
        return 'צ\'אט';
      case 'CONCLUSION':
        return 'סיכום';
      default:
        return 'פעילות';
    }
  };

  return (
    <div className="w-80 bg-gradient-card border-r-0 p-6 shadow-soft">
      <div className="space-y-6">
        {/* Module Progress Card */}
        <Card className="bg-gradient-turquoise text-white rounded-3xl border-0 shadow-card">
          <div className="p-6">
            <div className="flex flex-row justify-between items-center">
              {/* Right side: title and % */}
              <div className="flex flex-col items-start text-right">
                <h3 className="text-xl font-bold mb-1 text-white">התקדמות במודול</h3>
                <span className="text-sm text-white/90">{getModuleProgress()}% הושלם</span>
              </div>
              {/* Left side: circle */}
              <div className="flex items-center justify-center">
                <CircularProgress value={getModuleProgress()} size={56} strokeWidth={6} />
              </div>
            </div>
          </div>
        </Card>

        {/* Steps List */}
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-dark-gray mb-4">שלבים</h4>
          <div className="bg-white rounded-2xl shadow-card border-0 overflow-hidden">
            <div className="p-4">
              <div className="font-semibold text-dark-gray mb-3">{currentModule.title}</div>
              <div className="space-y-2">
                {currentModule.steps
                  .sort((a, b) => a.order - b.order)
                  .map((step) => {
                    const progress = getStepProgress(step.id);
                    const isCompleted = isStepCompleted(step.id);
                    const isCurrent = currentStepId === step.id;
                    const IconComponent = getStepIcon(step.type);
                    
                    return (
                      <Button
                        key={step.id}
                        variant="ghost"
                        className={`w-full justify-between p-3 h-auto text-sm rounded-xl transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-gradient-turquoise text-white shadow-soft' 
                            : 'hover:bg-light-gray/70'
                        }`}
                        onClick={() => onStepSelect(step.id)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <span className={isCurrent ? 'text-white' : 'text-dark-gray'}>
                              {step.title}
                            </span>
                            {/* Activity type label - commented out for reusability */}
                            {/* <span className={`text-xs px-2 py-1 rounded-full ${
                              isCurrent 
                                ? 'bg-white/20 text-white' 
                                : 'bg-light-gray text-medium-gray'
                            }`}>
                              {getStepTypeLabel(step.type)}
                            </span> */}
                            {isCompleted && !isCurrent && (
                              <CheckCircle2 className="h-4 w-4 text-green" />
                            )}
                          </div>
                          {/* Icon next to the title group */}
                          <div className="flex-shrink-0">
                            <IconComponent className={`h-5 w-5 ${isCurrent ? 'text-white' : 'text-medium-gray'}`} />
                          </div>
                        </div>
                        {/* Progress bar for incomplete steps */}
                        {!isCompleted && progress > 0 && (
                          <div className="w-full mt-2">
                            <Progress 
                              value={progress} 
                              className={`h-1 ${isCurrent ? 'bg-white/20' : 'bg-light-gray'}`}
                            />
                          </div>
                        )}
                      </Button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleSidebar;
