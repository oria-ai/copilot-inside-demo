import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VideoLessonProps {
  videoUrl: string;
  videoTitle: string;
}

const VideoLesson = ({ videoUrl, videoTitle }: VideoLessonProps) => {
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setShowRating(true);
  };

  const handleRatingSubmit = () => {
    console.log('Video rating submitted:', rating);
    setShowRating(false);
  };

  const handleNext = () => {
    console.log('Next button clicked');
    // This will be handled by parent component
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>סרטון השיעור</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
            <iframe
              src={videoUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              title={videoTitle}
              onLoad={() => {
                // Listen for video end event from iframe
                // Note: This is a simplified approach - real implementation would need postMessage communication
              }}
            />
          </div>
          
          {/* Next button below video */}
          <div className="flex justify-center mt-4">
            <Button onClick={handleNext} className="px-8">
              הבא
            </Button>
          </div>
        </CardContent>
      </Card>

      {showRating && videoEnded && (
        <Card>
          <CardHeader>
            <CardTitle>דירוג הבנה</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-lg">עד כמה הבנת את הנושא?</p>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideoLesson;
