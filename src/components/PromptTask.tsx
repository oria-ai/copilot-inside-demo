import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface PromptTaskProps {
  lessonId: string;
  onNext?: () => void;
  handleActivityComplete?: (lessonId: string, progress: number) => void;
}

const AMERICAN_ANSWERS = [
  'הקשר',
  'מטרה',
  'תפקיד',
  'מוטיבציה',
  'תוצר רצוי',
];
const CORRECT_ANSWERS = ['הקשר', 'תפקיד', 'תוצר רצוי'];
const INITIAL_PROMPT = 'תסכם לי בבקשה את הפגישה שאוכל לשלוח מייל לכולם';

// Your Cloudflare Worker URL
const WORKER_URL = 'https://copilot-text.oria-masas-ai.workers.dev/';

const PromptTask = ({ lessonId, onNext, handleActivityComplete }: PromptTaskProps) => {
  const [step, setStep] = useState<'american' | 'improve'>('american');
  const [selected, setSelected] = useState<string[]>([]);
  const [americanError, setAmericanError] = useState('');
  const [prompt, setPrompt] = useState(INITIAL_PROMPT);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showContinue, setShowContinue] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showHow, setShowHow] = useState(false);

  // Load system prompt from file
  useEffect(() => {
    const loadSystemPrompt = async () => {
      try {
        const response = await fetch('/task1.txt');
        if (!response.ok) {
          throw new Error('Failed to load system prompt');
        }
        const text = await response.text();
        setSystemPrompt(text);
      } catch (error) {
        console.error('Error loading system prompt:', error);
        // Fallback prompt
        setSystemPrompt('You are a helpful assistant that reviews and provides feedback on prompts. Analyze the user\'s prompt and suggest improvements in Hebrew.');
      }
    };
    
    loadSystemPrompt();
  }, []);

  // Reset to american question when component mounts
  useEffect(() => {
    setStep('american');
    setSelected([]);
    setAmericanError('');
    setPrompt(INITIAL_PROMPT);
    setFeedback('');
    setShowContinue(false);
    setHasSubmitted(false);
    setShowHow(false);
  }, [lessonId]);

  // American question logic
  const handleCheckbox = (answer: string) => {
    setSelected((prev) =>
      prev.includes(answer)
        ? prev.filter((a) => a !== answer)
        : [...prev, answer]
    );
    setAmericanError('');
  };

  const handleAmericanSubmit = () => {
    // Check if user selected between 1 and 5 answers
    if (selected.length < 1 || selected.length > 5) {
      setAmericanError('נסה שנית');
      return;
    }
    
    // Count how many correct answers were selected
    const correctSelections = selected.filter(answer => 
      CORRECT_ANSWERS.includes(answer)
    ).length;
    
    // Pass if user selected 2 or 3 of the correct answers
    const isCorrect = correctSelections >= 2 && correctSelections <= 3;
    
    if (isCorrect) {
      setStep('improve');
      setAmericanError('');
    } else {
      setAmericanError('נסה שנית');
    }
  };

  // Prompt improvement logic
  const handlePromptSubmit = async () => {
    if (!prompt.trim()) {
      setFeedback('אנא הכנס פרומפט משופר.');
      return;
    }
    
    if (!systemPrompt) {
      setFeedback('שגיאה בטעינת מערכת. אנא רענן את העמוד.');
      return;
    }
    
    setIsLoading(true);
    setFeedback('');
    
    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          systemPrompt: systemPrompt,
          userInput: prompt 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Request failed');
      }
      
      const data = await response.json();
      
      // Extra safety: clean up any remaining markdown artifacts
      let cleanedResponse = data.response || 'תשובה התקבלה בהצלחה';
      
      // Remove any remaining asterisks that shouldn't be there
      cleanedResponse = cleanedResponse
        .replace(/(?<!<strong>)\*(?!<\/strong>)/g, '') // Remove orphaned asterisks
        .replace(/\*{2,}/g, '') // Remove multiple asterisks
        .replace(/<strong>\s*<\/strong>/g, ''); // Remove empty strong tags
      
      // The response is already HTML formatted from the worker
      setFeedback(cleanedResponse);
      setShowContinue(true);
      setHasSubmitted(true);
    } catch (error) {
      setFeedback('אירעה שגיאה בשליחת התשובה');
      console.error('Error submitting prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // Mark the prompt task as complete (90% progress for prompt activities)
    if (handleActivityComplete) {
      handleActivityComplete(lessonId, 90);
    }
    
    if (onNext) {
      onNext();
    }
  };

  return (
    <Card className="!mb-0 !pb-0">
      <CardHeader>
        <CardTitle>שיפור פרומפט</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {step === 'american' && (
            <div className="space-y-4">
              <div className="block text-sm font-medium text-gray-700 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: `
                <strong>רקע</strong><br />
                בדיוק סיימת פגישה, ואתה רוצה לשלוח מייל סיכום למשתתפים עם פירוט המשימות של כל אחד.<br />
                כתבת לקופיילוט את הפרומפט הבא, אבל קיבלת תוצאה כללית ומאכזבת:<br />
                `}} />
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-2 w-3/5 text-right">
                <div className="mt-2 text-gray-800">{INITIAL_PROMPT}</div>
              </div>
              <div className="mb-2 font-medium text-gray-700">סמן את האלמנטים החסרים בפרומפט</div>
              <form className="space-y-2" onSubmit={e => { e.preventDefault(); handleAmericanSubmit(); }}>
                {AMERICAN_ANSWERS.map((answer) => (
                  <label key={answer} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(answer)}
                      onChange={() => handleCheckbox(answer)}
                    />
                    <span>{answer}</span>
                  </label>
                ))}
                {americanError && <div className="text-red-500 text-sm mt-2">{americanError}</div>}
                <div style={{ height: '0.5rem' }} />
                <Button type="submit" className="mt-4">שלח</Button>
              </form>
            </div>
          )}

          {step === 'improve' && (
            <div className="space-y-4">
              <div className="mb-2 font-medium text-gray-700 flex items-center gap-2">
                <span>כתוב מחדש את הפרומפט, כך שישיג תוצאה מיטבית.</span>
              </div>
              {showHow && (
                <div className="mt-2 text-gray-700 prose prose-sm max-w-none" dir="rtl">
                  <b>פרומפט מוצלח מורכב מ:</b>
                  <ul>
                    <li>הגדרת מטרה ברורה</li>
                    <li>הגדרת תפקיד לAI</li>
                    <li>מתן הקשר</li>
                    <li>פירוט התוצר הרצוי</li>
                    <li>מקורות - אם יש צורך</li>
                  </ul>
                </div>
              )}
              <div className="mt-2">
                {showHow ? (
                  <span
                    className="text-blue-600 underline cursor-pointer text-sm"
                    onClick={() => setShowHow(false)}
                  >
                    הצג פחות
                  </span>
                ) : (
                  <span
                    className="text-blue-600 underline cursor-pointer text-md"
                    onClick={() => setShowHow(true)}
                  >
                    איך?
                  </span>
                )}
              </div>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                rows={4}
                className="text-right w-3/5"
              />
              <Button onClick={handlePromptSubmit} disabled={isLoading}>
                {isLoading ? 'שולח...' : hasSubmitted ? 'שלח מחדש' : 'שלח'}
              </Button>
              {feedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                  <h4 className="font-semibold mb-3 text-lg">משוב:</h4>
                  <div 
                    className="text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_li]:mb-2 [&_strong]:font-bold [&_strong]:text-gray-900"
                    dangerouslySetInnerHTML={{ __html: feedback }}
                  />
                  {showContinue && (
                    <Button onClick={handleContinue} variant="outline" className="mt-4">המשך</Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PromptTask;
