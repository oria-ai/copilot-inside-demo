import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Player from '@vimeo/player';

interface VideoLessonProps {
  videoUrl: string;
  videoTitle: string;
  onNext?: () => void;
}

const VideoLesson = ({ videoUrl, videoTitle, onNext }: VideoLessonProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!frameRef.current) return;
    const player = new Player(frameRef.current);
    const handleEnded = () => alert('Video finished!');
    player.on('ended', handleEnded);
    return () => {
      player.off('ended', handleEnded);
      player.destroy();
    };
  }, [videoUrl]);

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
          </div>
          {/* Next button below video */}
          <div className="flex justify-center mt-4">
            <Button onClick={onNext} className="px-8">
              הבא
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoLesson;
