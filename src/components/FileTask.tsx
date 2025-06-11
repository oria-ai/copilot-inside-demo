import React, { useState, useEffect, useCallback } from 'react';
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
  const [showHow1, setShowHow1] = useState(false);
  const [showHow2, setShowHow2] = useState(false);

  // Slides content
  const cards = [
    {
      title: 'רקע',
      instructions: 'סיימנו עכשיו פגישת פתיחת שבוע ארוכה ועמוסה.<br />אתה מעוניין להפיק מתמלול השיחה מסמך קצר שמסכם את המשימות של הצוות שלך - צוות הפיתוח.<br />הורד את הקובץ, ולחץ "הבא" להמשך ההנחיות.',
      showDownload: true,
      showUpload: false
    },
    {
      title: 'הוראות עבודה',
      instructions: 'פתח מסמך וורד חדש, ובקש מקופיילוט ליצור עבורך סיכום מהתמלול.<br />עבור ברפרוף על המסמך כדי להבין את ההקשר, והקפד לשלוח לקופיילוט פרומפט מלא ומפורט.',
      showDownload: false,
      showUpload: false
    },
    {
      title: 'הוראות עבודה',
      instructions: 'בדוק את התוצאה, ובמידת הצורך תן לקופיילוט הנחיות לתיקון. <br />אל תשאיר הכל בידי המכונה - תמיד טוב לתת קצת מגע אישי בסוף.',
      showDownload: false,
      showUpload: false
    },
    {
      title: 'העלאת קובץ',
      instructions: 'העלה את הקובץ המסוכם שיצרת לטובת קבלת משוב.',
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
    // Download the file תמלול.docx from the public directory
    const url = '/תמלול.docx';
    const link = document.createElement('a');
    link.href = url;
    link.download = 'תמלול.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleSkip = useCallback(() => {
    // Move to conclusion activity
    const event = new CustomEvent('goToConclusion', { detail: { lessonId } });
    window.dispatchEvent(event);
  }, [lessonId]);

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
                <div className="text-gray-700 mb-6 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_li]:mb-2 [&_strong]:font-bold [&_strong]:text-gray-900" dangerouslySetInnerHTML={{ __html: cards[currentCard].instructions }} />
                {/* How link for card 1 and 2 */}
                {(currentCard === 1 || currentCard === 2) && (
                  <>
                    {/* Extra instructions for card 1 and 2 */}
                    {currentCard === 1 && showHow1 && (
                      <div className="mt-2 text-gray-700 prose prose-sm max-w-none" dir="rtl">
                        הנחיות נוספות:
                        <br />
                        <ul><li>לאחר שתפתח קובץ וורד חדש, תראה שורת שיחה עם קופיילוט בראש הקובץ.</li><li>לחץ על המקש "/", וכך תוכל לבחור קובץ מהמחשב להתייחסות. בחר את קובץ התמלול.</li><li>כתוב פרומפט מפורט שמסביר מה זה קובץ התמלול ומה על קופיילוט לעשות.</li></ul>
                      </div>
                    )}
                    {currentCard === 2 && showHow2 && (
                      <div className="mt-2 text-gray-700 prose prose-sm max-w-none" dir="rtl">
                        הנחיות נוספות:
                        <br />
                        לאחר יצירת הסיכום, קופיילוט יפתח עבורך חלון צ'אט בתחתית המסך לטובת הנחיות לתיקון.
                        <br />
                        תמיד תוכל להמשיך לבקש מקופיילוט עריכות על המסמך, באמצעות לחיצה על סימן הקופיילוט - 
                        <br />
                        הוא מופיע תמיד ליד השורה בה אתה כותב.
                      </div>
                    )}
                    {/* Clickable text below extra instructions or below main instructions */}
                    <div className="mt-2">
                      {((currentCard === 1 && showHow1) || (currentCard === 2 && showHow2)) ? (
                        <span
                          className="text-blue-600 underline cursor-pointer text-md"
                          onClick={() => currentCard === 1 ? setShowHow1(false) : setShowHow2(false)}
                        >
                          הצג פחות
                        </span>
                      ) : (
                        <span
                          className="text-blue-600 underline cursor-pointer text-md"
                          onClick={() => currentCard === 1 ? setShowHow1(true) : setShowHow2(true)}
                        >
                          איך בדיוק?
                        </span>
                      )}
                    </div>
                  </>
                )}
                {cards[currentCard].showDownload && (
                  <Button
                    onClick={handleDownload}
                    className="w-50 mx-auto flex items-center gap-2"
                  >
                    <Download size={20} />
                    הורד את קובץ התמלול
                  </Button>
                )}
              </div>

              {/* Nav buttons + dots */}
              <div className="flex justify-between items-center mt-4">
                {/* Show prev except on first card, next except on last card */}
                {currentCard !== 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCard(Math.max(0, currentCard - 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                    הקודם
                  </Button>
                ) : (
                  <div className="w-[90px] h-10" />
                )}
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
                {currentCard !== cards.length - 1 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentCard(Math.min(cards.length - 1, currentCard + 1))}
                  >
                    הבא
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="w-[90px] h-10" />
                )}
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
          <div className="text-center">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="px-8 py-3 rounded-2xl border-2 border-primary-turquoise text-primary-turquoise hover:bg-primary-turquoise hover:text-white transition-all duration-300 w-40 mx-auto"
        >
          דלג לסיכום
        </Button>
      </div>
        </CardContent>
      </Card>

      {/* Skip Button at the bottom */}


      {/* Feedback popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="text-right max-w-md flex flex-col" dir="rtl" style={{ maxHeight: '80vh' }}>
          <DialogHeader className="items-center text-center">
            <DialogTitle className="w-full text-center">תוצאות בדיקת הקובץ</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col flex-1 min-h-0">
            {isLoading ? (
              <div className="text-center flex-1 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                <p>בודק את הקובץ שלך.</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1 min-h-0 flex flex-col">
                <div
                  className="text-gray-700 prose prose-sm max-w-none flex-1 min-h-0 overflow-auto [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_li]:mb-2 [&_strong]:font-bold [&_strong]:text-gray-900"
                  style={{ maxHeight: '30vh' }}
                  dangerouslySetInnerHTML={{ __html: feedback }}
                />
                <div className="flex gap-3 justify-center pt-4">
                  <Button onClick={handleResubmit} variant="outline">
                    הגש מחדש
                  </Button>
                  <Button onClick={handleSkip} className="w-40">
                    המשך
                  </Button>
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
