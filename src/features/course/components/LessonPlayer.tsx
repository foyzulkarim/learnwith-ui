// src/features/course/components/LessonPlayer.tsx
import React from 'react';
import DirectSasVideoPlayer from './DirectSasVideoPlayer';

interface LessonPlayerProps {
  lessonId: string;
  title: string;
  thumbnailUrl?: string;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ lessonId, title, thumbnailUrl }) => {
  // Super simple component using iframe-based player
  console.log("LessonPlayer rendering with lessonId:", lessonId);
  
  if (!lessonId) {
    return <div className="text-red-500 p-4">Error: Missing video ID</div>;
  }
  
  return (
    <div className="lesson-video-container">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="video-wrapper rounded-lg overflow-hidden shadow-lg">
        <DirectSasVideoPlayer 
          lessonId={lessonId} 
          thumbnailUrl={thumbnailUrl}
        />
      </div>
    </div>
  );
};

export default LessonPlayer;
