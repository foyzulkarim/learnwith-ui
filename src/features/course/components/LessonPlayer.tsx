// src/features/course/components/LessonPlayer.tsx
import React from 'react';
import HlsPlayer from './HlsPlayer';

interface LessonPlayerProps {
  lessonId: string;
  title: string;
  thumbnailUrl?: string;
  courseId: string;
  moduleId: string;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ lessonId, title,   courseId, moduleId }) => {
  // Super simple component using iframe-based player
  console.log("LessonPlayer rendering with lessonId:", lessonId);
  
  if (!lessonId) {
    return <div className="text-red-500 p-4">Error: Missing video ID</div>;
  }
  
  return (
    <div className="lesson-video-container">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="video-wrapper rounded-lg overflow-hidden shadow-lg">
        <HlsPlayer 
          lessonId={lessonId} 
          courseId={courseId}
          moduleId={moduleId}
        />
      </div>
    </div>
  );
};

export default LessonPlayer;
