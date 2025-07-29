import React from 'react';
import { Instructions, VideoDisplay, QuestionMultiChoice, QuestionOpen } from './tasks';

interface ScreenComponent {
  componentId: number;
  type: string;
  slot: string;
  content: any;
}

interface ScreenContainerProps {
  screen: {
    screenId: number;
    order: number;
    components: ScreenComponent[];
  };
  moduleId: number;
  stepId: number;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({ 
  screen, 
  moduleId, 
  stepId 
}) => {
  const renderComponent = (component: ScreenComponent) => {
    const commonProps = {
      moduleId,
      stepId,
      screenId: screen.screenId,
      content: component.content
    };

    switch (component.type) {
      case 'INSTRUCTIONS':
        return <Instructions key={component.componentId} {...commonProps} />;
      
      case 'VIDEO_DISPLAY':
        return <VideoDisplay key={component.componentId} {...commonProps} />;
      
      case 'QUESTION_MULTICHOICE':
        return <QuestionMultiChoice key={component.componentId} {...commonProps} />;
      
      case 'QUESTION_OPEN':
        return <QuestionOpen key={component.componentId} {...commonProps} />;
      
      default:
        console.warn(`Unknown component type: ${component.type}`);
        return (
          <div key={component.componentId} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Unknown component type: {component.type}
            </p>
          </div>
        );
    }
  };

  // Group components by slot
  const componentsBySlot = screen.components.reduce((acc, component) => {
    if (!acc[component.slot]) {
      acc[component.slot] = [];
    }
    acc[component.slot].push(component);
    return acc;
  }, {} as Record<string, ScreenComponent[]>);

  return (
    <div className="space-y-6">
      {/* Top panel components */}
      {componentsBySlot.top_panel && (
        <div className="space-y-4">
          {componentsBySlot.top_panel.map(renderComponent)}
        </div>
      )}

      {/* Main content components */}
      {componentsBySlot.main_content && (
        <div className="space-y-4">
          {componentsBySlot.main_content.map(renderComponent)}
        </div>
      )}

      {/* Bottom panel components */}
      {componentsBySlot.bottom_panel && (
        <div className="space-y-4">
          {componentsBySlot.bottom_panel.map(renderComponent)}
        </div>
      )}

      {/* Render any other slots */}
      {Object.entries(componentsBySlot)
        .filter(([slot]) => !['top_panel', 'main_content', 'bottom_panel'].includes(slot))
        .map(([slot, components]) => (
          <div key={slot} className="space-y-4">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {slot}
            </h4>
            {components.map(renderComponent)}
          </div>
        ))}
    </div>
  );
};
