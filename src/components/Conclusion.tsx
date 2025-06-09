import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConclusionProps {
  lessonId: string;
  onConclusionComplete: (lessonId: string, rating: number) => Promise<void>;
}

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
    return isFilled ? 'text-yellow-400' : 'text-gray-300 border border-gray-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>סיכום השיעור</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Conclusion content placeholder */}
          <div className="prose max-w-none text-right">
            <h3>כותרת סיכום - placeholder</h3>
            <p>
              זהו טקסט סיכום לדוגמה. כאן יהיה תוכן HTML עם הסבר על מה שנלמד בשיעור.
              ניתן לכלול כאן רשימות, טקסט מודגש, קישורים ועוד.
            </p>
            <ul>
              <li>נקודה חשובה ראשונה</li>
              <li>נקודה חשובה שנייה</li>
              <li>נקודה חשובה שלישית</li>
            </ul>
          </div>

          {/* Rating section */}
          <div className="border-t pt-6">
            <div className="text-center space-y-4">
              <p className="text-lg font-medium">עד כמה הבנת את הנושא? (אופציונלי)</p>
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
                className="mt-4 w-full"
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
