import React, { useState, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Loader2
} from 'lucide-react';

interface HandsonScreen {
  screenId: number;
  order: number;
  components: Array<{
    componentId: number;
    type: string;
    slot: string;
    content: {
      hasFile: boolean;
      fileUrl?: string;
      hasUpload: boolean;
      uploadConfig?: any;
      body: string; // Markdown instructions from handson_variants
    };
  }>;
}

interface HandsonProps {
  lessonId: string;
  screens?: HandsonScreen[];
  handleActivityComplete?: (lessonId: string, progress: number) => void;
}

const Handson = ({ lessonId, screens = [], handleActivityComplete }: HandsonProps) => {
  console.log('🤲 Handson Component - Received screens:', screens);
  console.log('🤲 Handson Component - Screens length:', screens?.length);
  
  const [currentCard, setCurrentCard] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: number]: File }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showContinue, setShowContinue] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Convert markdown to HTML
  const markdownToHtml = (markdown: string) => {
    try {
      return marked.parse(markdown);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return markdown; // Fallback to raw markdown
    }
  };

  // Get current screen/card data
  const getCurrentCard = () => {
    if (!screens || screens.length === 0 || currentCard >= screens.length) {
      return null;
    }
    return screens[currentCard];
  };

  const getCurrentCardContent = () => {
    const card = getCurrentCard();
    return card?.components[0]?.content;
  };

  const handleDownload = () => {
    const content = getCurrentCardContent();
    if (content?.fileUrl) {
      // Download the file from the provided URL
      const link = document.createElement('a');
      link.href = content.fileUrl;
      link.download = content.fileUrl.split('/').pop() || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles(prev => ({
        ...prev,
        [currentCard]: file
      }));
      setHasSubmitted(false);
    }
  };

  const handleSubmit = async () => {
    const uploadedFile = uploadedFiles[currentCard];
    if (!uploadedFile) return;

    setIsLoading(true);
    setFeedback('');
    
    // Simulate processing - in real implementation this would call an API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generic feedback - in real implementation this would come from API
    setFeedback(`תודה על הגשת הקובץ "${uploadedFile.name}". הקובץ התקבל בהצלחה.`);
    
    setShowContinue(true);
    setIsLoading(false);
    setHasSubmitted(true);
  };

  const handleContinue = useCallback(() => {
    if (currentCard < screens.length - 1) {
      setCurrentCard(currentCard + 1);
      setFeedback('');
      setShowContinue(false);
      setHasSubmitted(false);
    } else {
      // Mark as complete and finish
      if (handleActivityComplete) {
        handleActivityComplete(lessonId, 90);
      }
    }
  }, [currentCard, screens.length, handleActivityComplete, lessonId]);

  // Handle navigation
  const canNavigateNext = () => {
    const content = getCurrentCardContent();
    // If it's an upload step, check if file is uploaded
    if (content?.hasUpload && !uploadedFiles[currentCard]) {
      return false;
    }
    return currentCard < screens.length - 1;
  };

  const canNavigatePrev = () => {
    return currentCard > 0;
  };

  // If no screens provided, show loading or error state
  if (!screens || screens.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>משימה מעשית</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            לא נמצאו שלבי משימה במסד הנתונים
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentCardData = getCurrentCard();
  const currentContent = getCurrentCardContent();

  if (!currentCardData || !currentContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>שגיאה</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            נתוני השלב חסרים במסד הנתונים
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>משימה מעשית</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Carousel */}
          <div className="relative">
            <div className="bg-gray-50 rounded-lg p-6 min-h-[200px]">
              <h3 className="text-xl font-semibold mb-4">שלב {currentCard + 1}</h3>
              {currentContent.body && (
                <div 
                  className="text-gray-700 mb-6 prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pr-6 [&_ol]:list-decimal [&_ol]:pr-6 [&_li]:mb-2 [&_strong]:font-bold [&_strong]:text-gray-900" 
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(currentContent.body) }} 
                />
              )}

              {/* Download button */}
              {currentContent.hasFile && (
                <div className="flex justify-center mb-4">
                  <Button
                    onClick={handleDownload}
                    className="w-50 mx-auto flex items-center gap-2"
                  >
                    <Download size={20} />
                    הורד קובץ
                  </Button>
                </div>
              )}

              {/* Upload functionality */}
              {currentContent.hasUpload && (
                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center">
                    <div className="flex items-center gap-2 justify-center">
                      <label
                        htmlFor={`file-upload-${currentCard}`}
                        className="cursor-pointer px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md font-medium text-sm flex items-center gap-2"
                      >
                        <Upload size={16} />
                        בחר קובץ
                        <input
                          id={`file-upload-${currentCard}`}
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".txt,.doc,.docx,.pdf"
                          disabled={isLoading}
                        />
                      </label>
                      {uploadedFiles[currentCard] && (
                        <p className="text-sm text-green-600">נבחר: {uploadedFiles[currentCard].name}</p>
                      )}
                    </div>
                  </div>
                  
                  {uploadedFiles[currentCard] && (
                    <Button
                      onClick={handleSubmit}
                      className="w-fit px-4 mx-auto"
                      disabled={isLoading}
                    >
                      {isLoading ? 'שולח...' : hasSubmitted ? 'שלח מחדש' : 'שלח קובץ'}
                    </Button>
                  )}
                  
                  {isLoading && (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={20} />
                      <span>מעבד את הקובץ...</span>
                    </div>
                  )}
                  
                  {feedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                      <h4 className="font-semibold mb-3 text-lg">משוב:</h4>
                      <div className="text-gray-700 prose prose-sm max-w-none">
                        {feedback}
                      </div>
                      {showContinue && (
                        <div className="flex justify-center mt-6">
                          <Button 
                            onClick={handleContinue} 
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8"
                          >
                            {currentCard === screens.length - 1 ? 'סיום' : 'המשך'}
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
              {canNavigatePrev() ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentCard(currentCard - 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                  הקודם
                </Button>
              ) : (
                <div className="w-[90px] h-10" />
              )}
              <div className="flex gap-2">
                {screens.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentCard ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              {canNavigateNext() ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentCard(currentCard + 1)}
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
      </CardContent>
    </Card>
  );
};

export default Handson;