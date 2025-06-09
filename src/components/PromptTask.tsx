
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface PromptTaskProps {
  lessonId: string;
}

const PromptTask = ({ lessonId }: PromptTaskProps) => {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  const systemPrompt = "זהו placeholder לsystem prompt מקובץ task1.txt";

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      alert('אנא הכנס תשובה');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('https://digital-israel.oria-masas-ai.workers.dev/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemprompt: systemPrompt,
          userinput: userInput
        })
      });

      const data = await response.json();
      setFeedback(data.response || 'תשובה התקבלה בהצלחה');
      setShowContinue(true);
    } catch (error) {
      console.error('Error submitting prompt:', error);
      setFeedback('אירעה שגיאה בשליחת התשובה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    console.log('Continue to next activity');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>משימת כתיבה</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {feedback && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2">משיבה מה-AI:</h4>
              <p className="text-gray-700">{feedback}</p>
            </div>
          )}

          <div className="space-y-4">
            <label htmlFor="user-input" className="block text-sm font-medium text-gray-700">
              כתוב את התשובה שלך:
            </label>
            <Textarea
              id="user-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="הכנס את התשובה שלך כאן..."
              rows={6}
              className="text-right"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'שולח...' : 'שלח'}
            </Button>
            
            {showContinue && (
              <Button 
                onClick={handleContinue}
                variant="outline"
                className="flex-1"
              >
                המשך
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptTask;
