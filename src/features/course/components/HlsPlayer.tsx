import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  lessonId: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ lessonId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (!Hls.isSupported()) {
      console.error('HLS is not supported in this browser');
      return;
    }

    const hls = new Hls();

    // Use full API URL
    const manifestUrl = `http://localhost:4000/api/hls/stream/${lessonId}`; // 68285091fb9f0dd6940c9db3

    hls.loadSource(manifestUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(err => {
        console.error('Playback failed:', err);
      });
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS error', event, data);
    });

    return () => {
      hls.destroy();
    };
  }, [lessonId]);

  return (
    <div>
      <video
        ref={videoRef}
        controls
        autoPlay
        style={{ width: '100%', maxWidth: '800px' }}
        poster="https://via.placeholder.com/800x450?text=Loading... "
      />
    </div>
  );
};

export default HlsPlayer;
