
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConclusionProps {
  lessonId: string;
}

const Conclusion = ({ lessonId }: ConclusionProps) => {
  const [rating, setRating] = useState(0);

  const handleRatingSubmit = () => {
    console.log('Conclusion rating submitted:', rating);
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
              <p className="text-lg font-medium">עד כמה הבנת את הנושא?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <Button onClick={handleRatingSubmit} className="mt-4">
                שלח דירוג
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Conclusion;
