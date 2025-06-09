
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FileTaskProps {
  lessonId: string;
}

const FileTask = ({ lessonId }: FileTaskProps) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  const cards = [
    {
      title: 'הורדת קובץ',
      instructions: 'הורד את הקובץ הבא כדי להתחיל במשימה',
      showDownload: true
    },
    {
      title: 'ביצוע המשימה',
      instructions: 'עבוד על הקובץ שהורדת לפי ההוראות',
      showDownload: false
    },
    {
      title: 'העלאת קובץ',
      instructions: 'העלה את הקובץ לאחר שסיימת לעבוד עליו',
      showDownload: false
    }
  ];

  const handleDownload = () => {
    // Simulate file download
    console.log('Downloading file...');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      alert('אנא העלה קובץ');
      return;
    }

    setIsLoading(true);
    setShowPopup(true);

    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('prompt', 'זהו placeholder לprompt מקובץ task2.txt');

    try {
      const response = await fetch('https://copilot-file.oria-masas-ai.workers.dev/', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setFeedback(data.feedback || 'הקובץ נבדק בהצלחה');
    } catch (error) {
      console.error('Error uploading file:', error);
      setFeedback('אירעה שגיאה בבדיקת הקובץ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    setShowPopup(false);
    console.log('Continue to conclusion');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>משימת קובץ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Card carousel */}
            <div className="relative">
              <div className="bg-gray-50 rounded-lg p-6 min-h-64">
                <h3 className="text-xl font-semibold mb-4">{cards[currentCard].title}</h3>
                <p className="text-gray-700 mb-6">{cards[currentCard].instructions}</p>
                
                {cards[currentCard].showDownload && (
                  <Button onClick={handleDownload} className="w-full">
                    הורד קובץ
                  </Button>
                )}
              </div>

              {/* Navigation buttons */}
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

                {/* Dots indicator */}
                <div className="flex gap-2">
                  {cards.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentCard ? 'bg-blue-500' : 'bg-gray-300'
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

            {/* File upload section (shown only on last card) */}
            {currentCard === cards.length - 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    בחר קובץ להעלאה:
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                {uploadedFile && (
                  <p className="text-sm text-green-600">
                    קובץ נבחר: {uploadedFile.name}
                  </p>
                )}

                <Button onClick={handleSubmit} className="w-full" disabled={!uploadedFile}>
                  שלח קובץ
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback popup */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="text-right" dir="rtl">
          <DialogHeader>
            <DialogTitle>תוצאות בדיקת הקובץ</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {isLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>בודק את הקובץ...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-700">{feedback}</p>
                <Button onClick={handleContinue} className="w-full">
                  המשך לסיכום
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileTask;
