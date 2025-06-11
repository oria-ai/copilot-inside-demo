
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Loader2
} from 'lucide-react';

interface FileTaskProps {
  lessonId: string;
}

const FileTask = ({ lessonId }: FileTaskProps) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');

  // Slides content
  const cards = [
    {
      title: 'הורדת קובץ',
      instructions: 'הורד את קובץ התמלול כדי להתחיל במשימה',
      showDownload: true,
      showUpload: false
    },
    {
      title: 'הוראות עבודה',
      instructions: 'קרא את התמלול בעיון וסמן את הנקודות העיקריות',
      showDownload: false,
      showUpload: false
    },
    {
      title: 'טיפים לסיכום',
      instructions: 'זכור להתמקד בהחלטות שהתקבלו ובפעולות המשך',
      showDownload: false,
      showUpload: false
    },
    {
      title: 'העלאת קובץ',
      instructions: 'העלה את הקובץ המסוכם שיצרת',
      showDownload: false,
      showUpload: true
    }
  ];

  /* -------------------------------------------------- */
  /*   Load system instruction from /task2.txt          */
  /* -------------------------------------------------- */
  useEffect(() => {
    const loadSystemPrompt = async () => {
      try {
        const res = await fetch('/task2.txt');
        if (!res.ok) throw new Error('Failed to load system prompt');
        setSystemPrompt(await res.text());
      } catch (err) {
        console.error('Error loading system prompt:', err);
        setSystemPrompt('You are a helpful assistant that reviews document summaries.');
      }
    };

    loadSystemPrompt();
  }, []);

  /* -------------------------------------------------- */
  /*   Helpers                                          */
  /* -------------------------------------------------- */
  const handleDownload = () => {
    const transcriptContent = `תמלול פגישה - דוגמה

תאריך: 15.1.2024
משתתפים: דני, רונית, יוסי, מיכל
נושא: תכנון פרויקט חדש

[כאן יהיה התמלול המלא של הפגישה - 3500 מילים]

דני: בוקר טוב לכולם.
רונית: אני חושבת שכדאי להתמקד קודם ביעדים.

(המשך התמלול.)`;

    const blob = new Blob([transcriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'תמלול.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  /* -------------------------------------------------- */
  /*   Submit to Worker                                 */
  /* -------------------------------------------------- */
  const handleSubmit = async () => {
    if (!uploadedFile) {
      alert('אנא העלה קובץ');
      return;
    }
    if (!systemPrompt) {
      alert('שגיאה בטעינת המערכת. אנא רענן את העמוד.');
      return;
    }

    setIsLoading(true);
    setShowPopup(true);
    setFeedback('');

    try {
      /* fetch the reference transcript as a Blob */
      const referenceRes = await fetch('/task2reference.txt');
      if (!referenceRes.ok) throw new Error('Failed to load reference transcript');
      const referenceText = await referenceRes.text();
      const referenceFile = new File([
        new Blob([referenceText], { type: 'text/plain;charset=utf-8' })
      ], 'task2reference.txt', { type: 'text/plain' });

      /* build form‑data */
      const formData = new FormData();
      formData.append('systemPrompt', systemPrompt);
      formData.append('userFile', uploadedFile);
      formData.append('referenceFile', referenceFile);

      const response = await fetch('https://copilot-file.oria-masas-ai.workers.dev/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      const data = await response.json();
      setFeedback(data.response || 'הקובץ נבדק בהצלחה');
    } catch (err) {
      console.error('Error uploading file:', err);
      setFeedback('אירעה שגיאה בבדיקת הקובץ. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubmit = () => {
    setShowPopup(false);
    setFeedback('');
  };

  const handleContinue = () => {
    setShowPopup(false);
    console.log('Continue to next step');
  };

  /* -------------------------------------------------- */
  /*   Render                                           */
  /* -------------------------------------------------- */
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>משימת סיכום תמלול</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Carousel */}
            <div className="relative">
              <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
                <h3 className="text-xl font-semibold mb-4">{cards[currentCard].title}</h3>
                <p className="text-gray-700 mb-6">{cards[currentCard].instructions}</p>

                {cards[currentCard].showDownload && (
                  <Button
                    onClick={handleDownload}
                    className="w-full max-w-xs mx-auto flex items-center gap-2"
                  >
                    <Download size={20} />
                    הורד קובץ תמלול
                  </Button>
                )}
              </div>

              {/* Nav buttons + dots */}
              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentCard(Math.max(0, currentCard - 1))}
                  disabled={currentCard === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </Button>

                <div className="flex gap-2">
                  {cards.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentCard ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentCard(Math.min(cards.length - 1, currentCard + 1))}
                  disabled={currentCard === cards.length - 1}
                >
                  הבא
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Upload step */}
            {cards[currentCard].showUpload && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    בחר קובץ להעלאה:
                  </label>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium text-sm flex items-center gap-2"
                    >
                      <Upload size={16} />
                      בחר קובץ
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".txt,.doc,.docx"
                      />
                    </label>
                    {uploadedFile && (
                      <p className="text-sm text-green-600">נבחר: {uploadedFile.name}</p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full max-w-xs mx-auto"
                  disabled={!uploadedFile}
                >
                  שלח קובץ
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="text-right max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>תוצאות בדיקת הקובץ</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                <p>בודק את הקובץ שלך.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_li]:mb-2 [&_strong]:font-bold [&_strong]:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: feedback }}
                />
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleResubmit} variant="outline">
                    הגש מחדש
                  </Button>
                  <Button onClick={handleContinue}>המשך</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileTask;
