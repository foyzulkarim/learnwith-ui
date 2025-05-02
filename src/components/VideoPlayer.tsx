import { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX, Settings, Maximize, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
}

export default function VideoPlayer({ videoUrl, thumbnailUrl }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const handleVolumeChange = (newVolume: number[]) => {
    if (videoRef.current) {
      const vol = newVolume[0];
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };
  
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };
  
  const handleSeekChange = (newTime: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime[0];
      setCurrentTime(newTime[0]);
    }
  };
  
  const toggleFullScreen = () => {
    if (videoContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoContainerRef.current.requestFullscreen();
      }
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Hide controls after a period of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };
    
    const containerElement = videoContainerRef.current;
    if (containerElement) {
      containerElement.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      clearTimeout(timeout);
      if (containerElement) {
        containerElement.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, [isPlaying]);
  
  return (
    <div 
      ref={videoContainerRef} 
      className="bg-black rounded-lg overflow-hidden mb-6 relative"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="relative pb-[56.25%]">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src={thumbnailUrl} 
              alt="Video thumbnail" 
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="bg-white/90 p-4 rounded-full cursor-pointer"
                onClick={togglePlay}
              >
                <Play className="text-primary h-8 w-8 fill-primary" />
              </div>
            </div>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full"
          src={videoUrl}
          onClick={togglePlay}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
        
        {/* Video controls overlay */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 p-4 transition-opacity">
            <div className="bg-black/70 rounded-lg p-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <button 
                    className="text-white hover:text-gray-300"
                    onClick={togglePlay}
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  <button 
                    className="text-white hover:text-gray-300"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                  </button>
                  <div className="w-20 hidden sm:block">
                    <Slider 
                      value={[isMuted ? 0 : volume]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={handleVolumeChange}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="text-white hover:text-gray-300">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button 
                    className="text-white hover:text-gray-300"
                    onClick={toggleFullScreen}
                  >
                    <Maximize className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-white text-sm">{formatTime(currentTime)}</span>
                <div className="w-full">
                  <Slider
                    value={[currentTime]}
                    min={0}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeekChange}
                    className="cursor-pointer"
                  />
                </div>
                <span className="text-white text-sm">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
