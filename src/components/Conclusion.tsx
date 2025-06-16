import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConclusionProps {
  lessonId: string;
  onConclusionComplete: (lessonId: string, rating: number) => Promise<void>;
}

const conclusions = {
  'lesson1': {
    title: 'היכרות עם קופיילוט',
    content: [
      '* למדנו איפה למצוא את קופיילוט, ואיך אנחנו "מפעילים" אותו באמצעות פרומפט',
      '* למדנו מה זה בכלל פרומפט',
      '* תרגלנו איך למצוא את ספריית הפרומפטים, עם המון פרומפטים מוכנים לשימוש לפי תפקיד',
      '* ראינו שימושים נוספים לקופיילוט כמו יצירת תמונות, ניתוח תמונות ועבודה עם מסמכים'
    ]
  },
  'lesson2': {
    title: 'הנדסת פרומפטים',
    content: [
      '* למדנו מה הם 5 המרכיבים של פרומפט איכותי.',
      '* למדנו להשתמש בבינה מלאכותית ליצירה ושיפור של פרומפט.',
      '* למדנו להשתמש במאמן הפרומפטים של קופיילוט.'
    ]
  },
  'lesson3': {
    title: 'סיכום הקורס',
    content: [
      '* הכרנו את סביבת העבודה של קופיילוט.',
      '* למדנו איך לכתוב פרומפט איכותי כדי לקבל את התוצאה הרצויה.',
      '* ראינו איך לגשת לקופיילוט מתוך Word.',
      '* למדנו איך קופיילוט יכול לשמש אותנו ליצירת טיוטה מ0.',
      '* למדנו איך לתת לקופיילוט קבצים אחרים להתייחסות או לסיכום.'
    ]
  }
};

const Conclusion = ({ lessonId, onConclusionComplete }: ConclusionProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onConclusionComplete(lessonId, rating);
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

  const currentConclusion = conclusions[lessonId as keyof typeof conclusions] || conclusions['lesson1'];

  return (
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
                className="mt-4 w-80"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'שולח...' : 'המשך לשיעור הבא'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Conclusion;
