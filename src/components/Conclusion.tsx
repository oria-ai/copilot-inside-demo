import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConfettiOverlay from '@/components/ConfettiOverlay';

interface ConclusionProps {
  lessonId: string;
  moduleId?: string;
  onConclusionComplete: (lessonId: string, rating: number) => Promise<void>;
  onBack?: () => void;
}

const conclusions = {
  'lesson1': {
    title: 'היכרות עם קופיילוט',
    content: [
      '* למדנו איפה למצוא את קופיילוט, ואיך אנחנו "מפעילים" אותו באמצעות פרומפט.',
      '* למדנו מה זה בכלל פרומפט.',
      '* תרגלנו איך למצוא את ספריית הפרומפטים, עם המון פרומפטים מוכנים לשימוש לפי תפקיד.',
      '* ראינו שימושים נוספים לקופיילוט כמו יצירת תמונות, ניתוח תמונות ועבודה עם מסמכים.'
    ]
  },
  'lesson2': {
    title: 'הנדסת פרומפטים',
    content: [
      '* למדנו איפה למצוא את קופיילוט, ואיך אנחנו "מפעילים" אותו באמצעות פרומפט.',
      '* למדנו מה זה בכלל פרומפט.',
      '* למדנו מה הם 5 המרכיבים של פרומפט איכותי.',
      '* למדנו להשתמש בבינה מלאכותית ליצירה ושיפור של פרומפט.',
      '* למדנו להשתמש במאמן הפרומפטים של קופיילוט.'
    ]
  },
  'lesson3': {
    title: 'סיכום הקורס',
    content: [
      '* הכרנו את ממשק העבודה עם קופיילוט.',
      '* למדנו איך להרכיב פרומפט איכותי כדי לקבל תוצאה מיטבית.',
      '* ראינו איך לגשת לקופיילוט מתוך Word.',
      '* למדנו איך קופיילוט יכול לשמש אותנו ליצירת טיוטה מאפס.',
      '* למדנו איך לתת לקופיילוט קבצים אחרים להתייחסות או לסיכום.'
    ]
  },
  'word_lesson2': {
    title: 'סיכום מודול - קופיילוט בוורד',
    content: [
      '* למדנו להשתמש בקופיילוט לכתיבה מקצועית ויעילה.',
      '* הבנו איך לשלב קבצים וקישורים בעבודה עם קופיילוט.',
      '* תרגלנו שימוש בכלים המתקדמים של Word יחד עם קופיילוט.',
      '* למדנו להפיק מסמכים איכותיים ומעוצבים בקלות.',
      '* הבנו איך קופיילוט יכול לחסוך זמן משמעותי בעבודה היומיומית.'
    ]
  }
};

const Conclusion = ({ lessonId, moduleId, onConclusionComplete, onBack }: ConclusionProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const isLastLesson = lessonId === 'lesson3';

  const handleRatingSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConclusionComplete(lessonId, rating);
      if (isLastLesson) {
        setShowConfetti(true);
      } else {
        // For non-last lessons, navigate back immediately
        if (onBack) onBack();
      }
    } catch (error) {
      console.error('Error completing conclusion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStarStyle = (starIndex: number) => {
    const displayRating = hoveredRating || rating;
    const isFilled = starIndex <= displayRating;
    return isFilled ? 'text-yellow-400' : 'text-gray-300';
  };

  const getConclusionKey = () => {
    if (moduleId === 'word' && lessonId === 'lesson2') {
      return 'word_lesson2';
    }
    return lessonId;
  };

  const currentConclusion = conclusions[getConclusionKey() as keyof typeof conclusions] || conclusions['lesson1'];

  return (
    <>
      <ConfettiOverlay 
        open={showConfetti} 
        onClose={() => {
          setShowConfetti(false);
          if (onBack) onBack();
        }}
      >
        <div className="text-center" dir="rtl">
          <h2 className="text-2xl font-bold mb-4">כל הכבוד!</h2>
          <p className="text-lg mb-6">סיימת את הקורס בהצלחה!</p>
          <Button 
            className="mt-6 px-8"
            onClick={() => {
              setShowConfetti(false);
              if (onBack) onBack();
            }}
          >
            סיים את המודול
          </Button>
        </div>
      </ConfettiOverlay>

      <Card className="!mb-0 !pb-0">
        <CardHeader>
          <CardTitle>{currentConclusion.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="prose max-w-none text-right">
              <ul className="list-none space-y-2">
                {currentConclusion.content.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>{item.replace('* ', '')}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-6">
              <div className="text-center space-y-4">
                <p className="text-lg font-medium">עד כמה הבנת את הנושא?</p>
                <div 
                  className="flex justify-center gap-2"
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      className={`text-3xl transition-colors ${getStarStyle(star)}`}
                      style={{ 
                        filter: getStarStyle(star).includes('text-gray-300') ? 'none' : 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                      }}
                    >
                      {getStarStyle(star).includes('text-gray-300') ? '☆' : '★'}
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600">דירוג נבחר: {rating} כוכבים</p>
                )}
                <Button 
                  onClick={handleRatingSubmit} 
                  className="px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'שולח...' : 'סיים את המודול'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Conclusion;
