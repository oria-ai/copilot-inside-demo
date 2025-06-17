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

// Hardcoded feedback for the initial file upload (first card)
const INITIAL_UPLOAD_FEEDBACK = `
<p class="mb-4"><b>פידבק ראשוני על הקובץ:</b></p>
<ul class="list-disc list-inside mb-4 space-y-1">
  <li class="mb-1">✅ הקובץ בפורמט וורד תקין.</li>
  <li class="mb-1">✅ תוכל להתקדם לשלב הבא ולקבל הנחיות כיצד לסכם אותו בעזרת קופיילוט.</li>
  <li class="mb-1">✅ שים לב! הקובץ שלך כולל מידע בנושאים שונים, הקפד למקד את קופיילוט מה בדיוק לסכם.</li>
</ul>
`;

// Hardcoded feedback for the final submission - LEFT PATH (example file)
const FINAL_SUBMISSION_FEEDBACK_LEFT = `
<p class="mb-4"><b>פידבק על ההגשה – סיכום קובץ באמצעות Copilot:</b></p>
<ul class="list-disc list-inside mb-4 space-y-1">
  <li class="mb-1">✅ <b>חוזקות:</b></li>
  <ul class="list-disc list-inside mb-4 space-y-1">
    <li class="mb-1">שימוש מוצלח ב-Copilot להפקת סיכום תמציתי.</li>
    <li class="mb-1">המבנה ברור והמעבר בין רעיונות הגיוני.</li>
  </ul>
  <li class="mb-1">⚠️ <b>נקודות לשיפור:</b></li>
  <ul class="list-disc list-inside mb-4 space-y-1">
    <li class="mb-1">הסיכום משמיט חלקים חשובים כמו המשימה של עידו, כנראה עקב תלות יתר בכלי.</li>
    <li class="mb-1">חלק מהניסוחים כלליים מדי ולא מפרטים את עיקרי התוכן.</li>
    <li class="mb-1">מופיעה חזרתיות קלה בסיום.</li>
  </ul>
</ul>
<p class="mb-4">🛠️ <b>המלצה:</b><br>השתמש ב-Copilot כבסיס, אך הקפד לעבור ידנית ולוודא דיוק, עומק וייצוג מלא של הרעיונות המרכזיים.</p>
`;

// Hardcoded feedback for the final submission - RIGHT PATH (user's own file)
const FINAL_SUBMISSION_FEEDBACK_RIGHT = `
<p class="mb-4"><b>פידבק על ההגשה – סיכום קובץ באמצעות Copilot:</b></p>
<ul class="list-disc list-inside mb-4 space-y-1">
  <li class="mb-1">✅ <b>חוזקות:</b></li>
  <ul class="list-disc list-inside mb-4 space-y-1">
    <li class="mb-1">שימוש יעיל ב-Copilot ליצירת סיכום מובנה.</li>
    <li class="mb-1">הצלחת לחלץ את הנקודות המרכזיות מהקובץ שלך.</li>
  </ul>
  <li class="mb-1">⚠️ <b>נקודות לשיפור:</b></li>
  <ul class="list-disc list-inside mb-4 space-y-1">
    <li class="mb-1">כדאי לוודא שהסיכום כולל את כל הנושאים הרלוונטיים מהקובץ המקורי.</li>
    <li class="mb-1">מומלץ לעבור על הטקסט ולהוסיף פרטים ספציפיים שחשובים לך.</li>
    <li class="mb-1">שקול להוסיף מבנה ברור יותר עם כותרות לנושאים שונים.</li>
  </ul>
</ul>
<p class="mb-4">🛠️ <b>המלצה:</b><br>המשך להשתמש ב-Copilot כנקודת התחלה, אך תמיד הוסף את המגע האישי שלך לוודא שהסיכום משקף בדיוק את מה שחשוב לך.</p>
`;

interface CardType {
  title: string;
  instructions: string;
  showDownload: boolean;
  showUpload: boolean;
  isInitialUpload?: boolean;
}

interface FileTaskProps {
  lessonId: string;
  handleActivityComplete?: (lessonId: string, progress: number) => void;
}

const FileTask = ({ lessonId, handleActivityComplete }: FileTaskProps) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [initialUploadFile, setInitialUploadFile] = useState<File | null>(null);
  const [finalUploadFile, setFinalUploadFile] = useState<File | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isFinalLoading, setIsFinalLoading] = useState(false);
  const [initialFeedback, setInitialFeedback] = useState('');
  const [finalFeedback, setFinalFeedback] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showHow1Left, setShowHow1Left] = useState(false);
  const [showHow2Left, setShowHow2Left] = useState(false);
  const [showHow1Right, setShowHow1Right] = useState(false);
  const [showHow2Right, setShowHow2Right] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedPath, setSelectedPath] = useState<'left' | 'right' | null>(null);
  const [initialUploadComplete, setInitialUploadComplete] = useState(false);

  // Slides content for both paths
  const leftPathCards: CardType[] = [
    {
      title: 'רקע',
      instructions: 'סיימנו עכשיו פגישת פתיחת שבוע ארוכה ועמוסה.<br />אתה מעוניין להפיק מתמלול השיחה מסמך קצר שמסכם את המשימות של הצוות שלך - צוות הפיתוח.<br />הורד את הקובץ, ולחץ "הבא" להמשך ההנחיות.',
      showDownload: true,
      showUpload: false,
      isInitialUpload: false
    },
    {
      title: 'הוראות עבודה',
      instructions: 'שמור את הקובץ בענן, כך שקופיילוט יוכל לגשת אליו.<br />פתח מסמך וורד חדש, ובקש מקופיילוט ליצור עבורך סיכום מהתמלול.<br />עבור על המסמך כדי להבין את ההקשר, והקפד לשלוח לקופיילוט פרומפט מלא ומפורט.',
      showDownload: false,
      showUpload: false
    },
    {
      title: 'הוראות עבודה',
      instructions: "בדוק את התוצאה, ובמידת הצורך תן לקופיילוט הנחיות לתיקון. <br />אל תשאיר הכל בידי המכונה! תמיד טוב לעבור על הטקסט, ולתת קצת טאצ' אישי.",
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

  const rightPathCards: CardType[] = [
    {
      title: 'העלה את הקובץ לבדיקה',
      instructions: 'העלה את הקובץ על מנת שנבדוק שאכן ניתן לסכם אותו באמצעות קופיילוט, ומה הדגשים לעבודה.',
      showDownload: false,
      showUpload: true,
      isInitialUpload: true
    },
    {
      title: 'הוראות עבודה',
      instructions: 'שמור את הקובץ בענן, כך שקופיילוט יוכל לגשת אליו.<br />פתח מסמך וורד חדש, ובקש מקופיילוט ליצור עבורך סיכום מהקובץ.<br />עבור על המסמך כדי לוודא מה אתה רוצה לסכם, והקפד לשלוח לקופיילוט פרומפט מלא ומפורט.',
      showDownload: false,
      showUpload: false
    },
    {
      title: 'הוראות עבודה',
      instructions: "בדוק את התוצאה, ובמידת הצורך תן לקופיילוט הנחיות לתיקון. <br />אל תשאיר הכל בידי המכונה! תמיד טוב לעבור על הטקסט, ולתת קצת טאצ' אישי.",
      showDownload: false,
      showUpload: false
    },
    {
      title: 'העלאת קובץ',
      instructions: 'העלה את הקובץ המסוכם שיצרת לטובת קבלת משוב.',
      showDownload: false,
      showUpload: true,
      isInitialUpload: false
    }
  ];

  const cards = selectedPath === 'right' ? rightPathCards : leftPathCards;

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
    if (file) {
      setFinalUploadFile(file);
      setHasSubmitted(false);
    }
  };

  /* -------------------------------------------------- */
  /*   Submit to Worker                                 */
  /* -------------------------------------------------- */
  const handleSubmit = async () => {
    setIsFinalLoading(true);
    setFinalFeedback('');
    // Simulate a 2-second delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Use different feedback based on selected path
    const feedbackToUse = selectedPath === 'left' ? FINAL_SUBMISSION_FEEDBACK_LEFT : FINAL_SUBMISSION_FEEDBACK_RIGHT;
    setFinalFeedback(feedbackToUse);
    
    setShowContinue(true);
    setIsFinalLoading(false);
    setHasSubmitted(true);
    // Mark the file task as complete (90% progress for file activities)
    if (handleActivityComplete) {
      handleActivityComplete(lessonId, 90);
    }
  };

  const handleSkip = useCallback(() => {
    // Move to conclusion activity
    const event = new CustomEvent('goToConclusion', { detail: { lessonId } });
    window.dispatchEvent(event);
  }, [lessonId]);

  // Initial file upload handler
  const handleInitialFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInitialUploadFile(file);
      setIsInitialLoading(true);
      // Simulate a 2-second delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      setInitialFeedback(INITIAL_UPLOAD_FEEDBACK);
      setIsInitialLoading(false);
      setInitialUploadComplete(true);
    }
  };

  // Helper function to get current "how exactly" state
  const getCurrentShowHow = () => {
    if (selectedPath === 'left') {
      return currentCard === 1 ? showHow1Left : showHow2Left;
    } else {
      return currentCard === 1 ? showHow1Right : showHow2Right;
    }
  };

  // Helper function to set current "how exactly" state
  const setCurrentShowHow = (value: boolean) => {
    if (selectedPath === 'left') {
      if (currentCard === 1) setShowHow1Left(value);
      else setShowHow2Left(value);
    } else {
      if (currentCard === 1) setShowHow1Right(value);
      else setShowHow2Right(value);
    }
  };

  // Helper function to get extra instructions for current card
  const getExtraInstructions = () => {
    if (selectedPath === 'left') {
      if (currentCard === 1) {
        return (
          <ul><li>לאחר שתפתח קובץ וורד חדש, תראה שורת שיחה עם קופיילוט בראש הקובץ.</li><li>לחץ על המקש "/", וכך תוכל לבחור קובץ מהמחשב להתייחסות. בחר את קובץ התמלול.</li><li>כתוב פרומפט מפורט שמסביר מה זה קובץ התמלול ומה על קופיילוט לעשות.</li></ul>
        );
      } else if (currentCard === 2) {
        return (
          <>
            לאחר יצירת הסיכום, קופיילוט יפתח עבורך חלון צ'אט בתחתית המסך לטובת הנחיות לתיקון.
            <br />
            תמיד תוכל להמשיך לבקש מקופיילוט עריכות על המסמך, באמצעות לחיצה על סימן הקופיילוט - 
            <br />
            הוא מופיע תמיד ליד השורה בה אתה כותב.
          </>
        );
      }
    } else {
      if (currentCard === 1) {
        return (
          <ul><li>לאחר שתפתח קובץ וורד חדש, תראה שורת שיחה עם קופיילוט בראש הקובץ.</li><li>לחץ על המקש "/", וכך תוכל לבחור קובץ מהמחשב להתייחסות. בחר את הקובץ שלך.</li><li>כתוב פרומפט מפורט שמסביר מה זה הקובץ שלך ומה על קופיילוט לעשות.</li></ul>
        );
      } else if (currentCard === 2) {
        return (
          <>
            לאחר יצירת הסיכום, קופיילוט יפתח עבורך חלון צ'אט בתחתית המסך לטובת הנחיות לתיקון.
            <br />
            תמיד תוכל להמשיך לבקש מקופיילוט עריכות על המסמך, באמצעות לחיצה על סימן הקופיילוט - 
            <br />
            הוא מופיע תמיד ליד השורה בה אתה כותב.
          </>
        );
      }
    }
    return null;
  };

  /* -------------------------------------------------- */
  /*   Render                                           */
  /* -------------------------------------------------- */
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>משימת סיכום קובץ</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedPath ? (
            // Initial selection screen
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">בחר את המסלול שלך</h2>
                <p className="text-gray-600">כעת נתרגל סיכום קובץ בעזרת קופיילוט. בחר אם תרצה לתרגל על קובץ שלך, או על קובץ דוגמא מוכן.</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPath('left')}
                >
                  <CardHeader>
                    <CardTitle>תרגול על קובץ לדוגמא</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>סכם בעזרת קופיילוט קובץ לדוגמא שהכנו עבורך.</p>
                  </CardContent>
                </Card>
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPath('right')}
                >
                  <CardHeader>
                    <CardTitle>תרגול על קובץ שלי</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>בחר קובץ שברצונך לסכם בעזרת קופיילוט, ואנחנו נדריך אותך איך לעשות זאת.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Main task content
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
                      {getCurrentShowHow() && (
                        <div className="mt-2 text-gray-700 prose prose-sm max-w-none" dir="rtl">
                          {getExtraInstructions()}
                        </div>
                      )}
                      {/* Clickable text below extra instructions or below main instructions */}
                      <div className="mt-2">
                        <span
                          className="text-blue-600 underline cursor-pointer text-md"
                          onClick={() => setCurrentShowHow(!getCurrentShowHow())}
                        >
                          {getCurrentShowHow() ? 'הצג פחות' : 'איך בדיוק?'}
                        </span>
                      </div>
                    </>
                  )}

                  {/* First card special handling */}
                  {currentCard === 0 && selectedPath === 'right' && (
                    <div className="space-y-4 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center">
                        <div className="flex items-center gap-2 justify-center">
                          <label
                            htmlFor="initial-file-upload"
                            className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium text-sm flex items-center gap-2"
                          >
                            <Upload size={16} />
                            בחר קובץ
                            <input
                              id="initial-file-upload"
                              type="file"
                              onChange={handleInitialFileUpload}
                              className="hidden"
                              accept=".txt,.doc,.docx"
                              disabled={isInitialLoading}
                            />
                          </label>
                          {initialUploadFile && (
                            <p className="text-sm text-green-600">נבחר: {initialUploadFile.name}</p>
                          )}
                        </div>
                      </div>
                      {isInitialLoading && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={20} />
                          <span>מעבד את הקובץ...</span>
                        </div>
                      )}
                      {initialFeedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                          <div
                            className="text-gray-700 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: initialFeedback }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Regular download button for left path */}
                  {cards[currentCard].showDownload && (
                    <Button
                      onClick={handleDownload}
                      className="w-50 mx-auto flex items-center gap-2"
                    >
                      <Download size={20} />
                      הורד את קובץ התמלול
                    </Button>
                  )}

                  {/* Final upload step */}
                  {cards[currentCard].showUpload && !cards[currentCard].isInitialUpload && (
                    <div className="space-y-4 flex flex-col items-center">
                      <div className="w-full flex flex-col items-center">
                        <div className="flex items-center gap-2 justify-center">
                          <label
                            htmlFor="final-file-upload"
                            className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium text-sm flex items-center gap-2"
                          >
                            <Upload size={16} />
                            בחר קובץ
                            <input
                              id="final-file-upload"
                              type="file"
                              onChange={handleFileUpload}
                              className="hidden"
                              accept=".txt,.doc,.docx"
                            />
                          </label>
                          {finalUploadFile && (
                            <p className="text-sm text-green-600">נבחר: {finalUploadFile.name}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={handleSubmit}
                        className="w-fit px-4 mx-auto"
                        disabled={!finalUploadFile}
                      >
                        {isFinalLoading ? 'שולח...' : hasSubmitted ? 'שלח מחדש' : 'שלח קובץ'}
                      </Button>
                      {finalFeedback && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                          <h4 className="font-semibold mb-3 text-lg">משוב:</h4>
                          <div
                            className="text-gray-700 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_li]:mb-2 [&_strong]:font-bold [&_strong]:text-gray-900"
                            dangerouslySetInnerHTML={{ __html: finalFeedback }}
                          />
                          {showContinue && (
                            <div className="flex justify-center mt-6">
                              <Button 
                                onClick={handleSkip} 
                                className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                              >
                                המשך
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Nav buttons + dots */}
                <div className="flex justify-between items-center mt-4">
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
                      onClick={() => {
                        // Only allow proceeding if initial upload is complete for right path first card
                        if (selectedPath === 'right' && currentCard === 0 && !initialUploadComplete) {
                          return;
                        }
                        setCurrentCard(Math.min(cards.length - 1, currentCard + 1));
                      }}
                      disabled={selectedPath === 'right' && currentCard === 0 && !initialUploadComplete}
                    >
                      הבא
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="w-[90px] h-10" />
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="px-8 py-3 rounded-2xl border-2 border-primary-turquoise text-primary-turquoise hover:bg-primary-turquoise hover:text-white transition-all duration-300 w-fit"
            >
              דלג לסיכום
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default FileTask;