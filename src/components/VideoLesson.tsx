
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Player from '@vimeo/player';

interface VideoLessonProps {
  videoUrl: string;
  videoTitle: string;
  lessonId: string;
  handleActivityComplete: (lessonId: string, progress: number, understandingRating?: number, activityType?: string, activityId?: number) => void;
  onNext?: () => void;
}

const VideoLesson = ({ videoUrl, videoTitle, lessonId, handleActivityComplete, onNext }: VideoLessonProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [progressSaved, setProgressSaved] = useState(false);

  useEffect(() => {
    console.log('VideoLesson effect running for:', { videoUrl, lessonId });
    if (!frameRef.current) return;
    const player = new Player(frameRef.current);
    const handleEnded = () => {
      console.log('Video ended, showing rating');
      setShowRating(true);
      if (!progressSaved) {
        console.log('Saving video progress');
        handleActivityComplete(lessonId, 50, undefined, 'video', 1);
        setProgressSaved(true);
      }
    };
    player.on('ended', handleEnded);
    return () => {
      console.log('VideoLesson cleanup for:', lessonId);
      player.off('ended', handleEnded);
      player.destroy();
    };
  }, [videoUrl, lessonId, handleActivityComplete, progressSaved]);

  const handleNextClick = () => {
    console.log('Video next button clicked');
    if (!progressSaved) {
      handleActivityComplete(lessonId, 50, undefined, 'video', 1);
      setProgressSaved(true);
    }
    if (onNext) onNext();
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
              ref={frameRef}
              src={videoUrl}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              title={videoTitle}
            />
            {/* Understanding rate popup overlay */}
            {showRating && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}>
                <div className="bg-white rounded-lg p-8 shadow-lg text-center">
                  <p className="text-lg mb-4">עד כמה הבנת את הנושא?</p>
                  <div className="flex justify-center gap-2 mb-4">
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
                  <Button onClick={() => setShowRating(false)} className="mt-4">
                    שלח דירוג
                  </Button>
                </div>
              </div>
            )}
          </div>
          {/* Next button below video */}
          <div className="flex justify-center mt-4">
            <Button onClick={handleNextClick} className="px-8">
              הבא
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoLesson;
