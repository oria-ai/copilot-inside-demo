import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Player from '@vimeo/player';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface VideoLessonProps {
  videoUrl: string;
  videoTitle: string;
  lessonId: string;
  handleActivityComplete: (lessonId: string, progress: number, understandingRating?: number, activityType?: string, activityId?: number) => void;
  onNext?: () => void;
  lessonDisplayName: string;
  showChapters?: boolean;
}

interface Chapter {
  startTime: number;
  title: string;
  index: number;
}

const VideoLesson = ({ videoUrl, videoTitle, lessonId, handleActivityComplete, onNext, lessonDisplayName, showChapters = true }: VideoLessonProps) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [progressSaved, setProgressSaved] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);
  const [showChapterNav, setShowChapterNav] = useState(false);
  const [chaptersLoaded, setChaptersLoaded] = useState(false);
  const [playerInstance, setPlayerInstance] = useState<Player | null>(null);

  const loadChapters = async (player: Player) => {
    try {
      const videoChapters = await player.getChapters();
      console.log('Loaded chapters:', videoChapters);
      
      if (videoChapters && videoChapters.length > 0) {
        setChapters(videoChapters);
        setShowChapterNav(true);
        setChaptersLoaded(true);
      } else {
        console.log('No chapters found for this video');
        setChaptersLoaded(true);
      }
    } catch (error) {
      console.error('Error loading chapters:', error);
      setChaptersLoaded(true);
    }
  };

  const seekToChapter = async (chapter: Chapter) => {
    if (!playerInstance) return;
    
    try {
      await playerInstance.setCurrentTime(chapter.startTime);
      setCurrentChapterIndex(chapter.index);
      console.log(`Navigated to chapter: ${chapter.title} at ${chapter.startTime}s`);
    } catch (error) {
      console.error('Error seeking to chapter:', error);
    }
  };

  const updateChapterHighlight = (currentTime: number) => {
    if (chapters.length === 0) return;
    
    let activeChapterIndex = null;
    
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].startTime) {
        activeChapterIndex = chapters[i].index;
        break;
      }
    }
    
    if (activeChapterIndex !== currentChapterIndex) {
      setCurrentChapterIndex(activeChapterIndex);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!frameRef.current) return;
    
    const player = new Player(frameRef.current);
    setPlayerInstance(player);

    const setupPlayer = async () => {
      try {
        await player.ready();
        
        if (showChapters) {
          await loadChapters(player);
        }
        
        const handleEnded = () => {
          setShowRating(true);
          if (!progressSaved) {
            handleActivityComplete(lessonId, 50, undefined, 'video', 1);
            setProgressSaved(true);
          }
        };
        
        const handleChapterChange = (data: { startTime: number; title: string; index: number }) => {
          console.log('Chapter changed:', data);
          setCurrentChapterIndex(data.index);
        };
        
        const handleTimeUpdate = (data: { seconds: number }) => {
          updateChapterHighlight(data.seconds);
        };
        
        player.on('ended', handleEnded);
        player.on('chapterchange', handleChapterChange);
        player.on('timeupdate', handleTimeUpdate);
        
      } catch (error) {
        console.error('Error setting up player:', error);
      }
    };
    
    setupPlayer();
    
    return () => {
      if (player) {
        player.off('ended');
        player.off('chapterchange');
        player.off('timeupdate');
        player.destroy();
      }
    };
  }, [videoUrl, lessonId, handleActivityComplete, progressSaved, showChapters]);

  const handleNextClick = () => {
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
          <CardTitle>{lessonDisplayName}</CardTitle>
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
                  <div 
                    className="flex justify-center gap-2 mb-4"
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        className={`text-3xl transition-colors ${((hoveredRating || rating) >= star) ? 'text-yellow-400' : 'text-gray-300'}`}
                        style={{ 
                          filter: ((hoveredRating || rating) >= star) ? 'drop-shadow(0 0 2px rgba(0,0,0,0.3))' : 'none'
                        }}
                      >
                        {((hoveredRating || rating) >= star) ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-gray-600">דירוג נבחר: {rating} כוכבים</p>
                  )}
                  <Button onClick={handleNextClick} className="mt-4 w-full">
                    שלח דירוג
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Chapter Navigation */}
          {showChapterNav && chapters.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">פרקים ({chapters.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChapterNav(!showChapterNav)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {showChapterNav ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-start">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.index}
                    onClick={() => seekToChapter(chapter)}
                    className={`
                      px-4 py-2 rounded-md transition-all duration-200 border text-right
                      ${currentChapterIndex === chapter.index 
                        ? 'bg-blue-100 border-blue-300 text-blue-800' 
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${currentChapterIndex === chapter.index 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                        }
                      `}>
                        {chapter.index}
                      </span>
                      <span className="font-medium">{chapter.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

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
