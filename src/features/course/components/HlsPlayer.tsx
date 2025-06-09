import React, { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface HlsPlayerProps {
  lessonId?: string;
}

const HlsPlayer: React.FC<HlsPlayerProps> = ({ lessonId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hls, setHls] = useState<Hls | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [levels, setLevels] = useState<Array<{ height: number; width: number; bitrate: number }>>([]);
  const [isReady, setIsReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const controlsHideTimeout = useRef<NodeJS.Timeout | null>(null);

  // Refs for state values to be used in setTimeout callbacks
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const isHoveringRef = useRef(isHovering);
  useEffect(() => { isHoveringRef.current = isHovering; }, [isHovering]);

  const showVolumeSliderRef = useRef(showVolumeSlider);
  useEffect(() => { showVolumeSliderRef.current = showVolumeSlider; }, [showVolumeSlider]);

  // Function to make controls visible and cancel any pending auto-hide timer.
  const ensureControlsVisibleAndCancelAutoHide = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsHideTimeout.current) {
      clearTimeout(controlsHideTimeout.current);
      controlsHideTimeout.current = null;
    }
  }, []);

  // Function to start (or restart) the auto-hide timer for controls.
  const startAutoHideControlsTimer = useCallback(() => {
    if (controlsHideTimeout.current) { // Clear existing timer
      clearTimeout(controlsHideTimeout.current);
    }
    controlsHideTimeout.current = setTimeout(() => {
      // Only hide if video is playing, user is not hovering, and volume slider isn't active.
      if (isPlayingRef.current && !isHoveringRef.current && !showVolumeSliderRef.current) {
        setIsControlsVisible(false);
      }
    }, 3000); // Hide after 3 seconds
  }, []); // Refs are stable, so no dependencies needed for useCallback itself.

  // Effect to manage control visibility based on player state and interactions.

  // Effect to manage control visibility based on player state and interactions.
  useEffect(() => {
    if (!isPlaying || isHovering || showVolumeSlider) {
      ensureControlsVisibleAndCancelAutoHide();
    } else if (isPlaying) {
      startAutoHideControlsTimer();
    }
  }, [isPlaying, isHovering, showVolumeSlider, ensureControlsVisibleAndCancelAutoHide, startAutoHideControlsTimer]);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (!Hls.isSupported()) {
      console.error('HLS is not supported in this browser');
      setErrorMessage('HLS is not supported in this browser');
      setIsLoading(false);
      return;
    }

    const hlsConfig = {
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      liveSyncDuration: 3,
      enableWorker: true,
      startLevel: -1,
      abrEwmaDefaultEstimate: 1000000,
      abrBandWidthFactor: 0.95,
      abrBandWidthUpFactor: 0.7,
      maxBufferHole: 0.5,
      lowLatencyMode: false,
      backBufferLength: 30
    };

    const hlsInstance = new Hls(hlsConfig);
    setHls(hlsInstance);

    const API_BASE_URL = import.meta.env.VITE_API_URL;
    const manifestUrl = `${API_BASE_URL}/api/hls/stream/${lessonId}`;

    hlsInstance.loadSource(manifestUrl);
    hlsInstance.attachMedia(video);

    hlsInstance.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      console.log('Manifest parsed, video ready to play');
      console.log('Available quality levels:', hlsInstance.levels);
      setLevels(hlsInstance.levels);
      setCurrentLevel(hlsInstance.currentLevel);
      setIsReady(true);
      setIsLoading(false);
      setErrorMessage(null);
    });

    hlsInstance.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      setCurrentLevel(data.level);
      setIsLoading(false); // Stop loading indicator when level switches
    });

    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS error', event, data);
      setErrorMessage(`HLS Error: ${data.details}`);
      setIsLoading(false);
    });

    return () => {
      hlsInstance.destroy();
      setHls(null);
    };
  }, [lessonId]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleDurationChange = () => setDuration(video.duration);

    const handlePlay = () => {
      setIsPlaying(true);
      // Main useEffect will handle control visibility logic.
    };

    const handlePause = () => {
      setIsPlaying(false);
      // Main useEffect will handle control visibility logic.
    };

    const handleVideoVolumeChange = () => { // Renamed to avoid conflict
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleLoadStart = () => setIsLoading(true);

    const handleCanPlay = () => {
      setIsLoading(false);
      // Main useEffect and interaction handlers will manage control visibility.
      
      // Capture the first frame as poster
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Set the poster directly on the video element
          video.poster = canvas.toDataURL('image/jpeg', 0.95);
          console.log('First frame captured as poster');
        }
      } catch (err) {
        console.error('Error capturing first frame:', err);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('volumechange', handleVideoVolumeChange);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);

    // Set initial volume
    video.volume = volume;
    video.muted = isMuted;

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('volumechange', handleVideoVolumeChange);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [volume, isMuted]); // Dependencies updated

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().catch(error => console.error("Error attempting to play video:", error));
    } else {
      video.pause();
    }
    // isPlaying state will be updated by video events ('play', 'pause'), 
    // which in turn triggers the main useEffect for control visibility.
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    const seekTime = (parseFloat(event.target.value) / 100) * duration;
    video.currentTime = seekTime;
    ensureControlsVisibleAndCancelAutoHide();
    if (isPlayingRef.current) {
      startAutoHideControlsTimer();
    }
  };

  const handleVolumeSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => { // Renamed to avoid conflict
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(event.target.value);
    video.volume = newVolume;
    // The video's 'volumechange' event will update the 'volume' and 'isMuted' states.
    ensureControlsVisibleAndCancelAutoHide(); // Keep controls visible while interacting
    // Timer will be restarted by onMouseUp on the slider or by main useEffect if mouse leaves volume area
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    // The video's 'volumechange' event will update 'isMuted' state.
    ensureControlsVisibleAndCancelAutoHide();
    if (isPlayingRef.current) {
      startAutoHideControlsTimer();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Request fullscreen mode
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen()
          .then(() => {
            setIsFullscreen(true);
          })
          .catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
          });
      }
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => {
            setIsFullscreen(false);
          })
          .catch(err => {
            console.error(`Error attempting to exit fullscreen: ${err.message}`);
          });
      }
    }

    ensureControlsVisibleAndCancelAutoHide();
    if (isPlayingRef.current) {
      startAutoHideControlsTimer();
    }
  };

  // Listen for fullscreen change events from browser
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleQualityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const level = parseInt(event.target.value, 10);
    if (hls && isReady) {
      setIsLoading(true); // Show loading indicator while quality switches
      hls.currentLevel = level;
      // setCurrentLevel(level); // HLS LEVEL_SWITCHED event will update this state
    }
    ensureControlsVisibleAndCancelAutoHide();
    if (isPlayingRef.current) {
      startAutoHideControlsTimer();
    }
  };

  const formatBitrate = (bitrate: number) => {
    return `${(bitrate / 1000000).toFixed(1)}M`;
  };

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00';
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 && !isNaN(duration) && !isNaN(currentTime) ? (currentTime / duration) * 100 : 0;

  const sliderStyles = `
    .progress-bar::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #8B5CF6;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
      transition: all 0.2s ease;
    }
    
    .progress-bar::-webkit-slider-thumb:hover {
      transform: scale(1.2);
      box-shadow: 0 6px 12px rgba(139, 92, 246, 0.6);
    }
    
    .volume-slider::-webkit-slider-thumb {
      appearance: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #8B5CF6;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(139, 92, 246, 0.4);
    }
    
    .progress-bar::-moz-range-thumb,
    .volume-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #8B5CF6;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 4px 8px rgba(139, 92, 246, 0.4);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sliderStyles }} />
      <div
        ref={containerRef}
        className={`relative rounded-2xl overflow-hidden transition-all duration-500 ease-out ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full'
          }`}
        onMouseEnter={() => {
          isHoveringRef.current = true;
          setIsHovering(true);
        }}
        onMouseLeave={() => {
          isHoveringRef.current = false;
          setIsHovering(false);
          if (showVolumeSlider) {
            showVolumeSliderRef.current = false;
            setShowVolumeSlider(false);
          }
        }}
        onMouseMove={() => {
          if (!isControlsVisible) {
            ensureControlsVisibleAndCancelAutoHide();
          }
          if (isPlayingRef.current) {
            startAutoHideControlsTimer();
          }
        }}
      >
        {/* Video Container - Completely Clean */}
        <div className="relative w-full aspect-video">
          {/* Video Element - No overlays or background interference */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover cursor-pointer"
            onClick={(e) => {
              if (!isReady) return;
              togglePlayPause();
              ensureControlsVisibleAndCancelAutoHide();
              if (isPlayingRef.current) {
                startAutoHideControlsTimer();
              }
            }}
            onTouchStart={() => {
              if (!isReady) return;
              ensureControlsVisibleAndCancelAutoHide();
              if (isPlayingRef.current) {
                startAutoHideControlsTimer();
              }
            }}
            autoPlay={false}
            poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjZmZmZmZmIi8+CjxjaXJjbGUgY3g9IjQwMCIgY3k9IjIyNSIgcj0iNDAiIGZpbGw9IiM2MzY2RjEiLz4KPHN2ZyB4PSIzODUiIHk9IjIxMCIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik08IDV2MTRsMTEtN3oiLz4KPC9zdmc+Cjwvc3ZnPgo="
          >
            Your browser does not support the video tag.
          </video>

          {/* Loading Indicator - Clean, no overlay */}
          {isLoading && (
            <div className="absolute top-4 right-4 z-20">
              <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-xl shadow-lg border border-white/20">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                    <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm">
                    {isReady ? 'Switching quality...' : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message - Clean, no overlay */}
          {errorMessage && (
            <div className="absolute top-4 left-4 right-4 z-20">
              <div className="bg-red-600/90 backdrop-blur-md text-white p-4 rounded-xl shadow-lg border border-red-400/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Video Error</h3>
                    <p className="text-sm opacity-90">{errorMessage}</p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-700 hover:bg-red-800 px-3 py-1.5 rounded-lg text-sm transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Play Button - Clean, positioned only when needed */}
          {!isPlaying && isReady && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <button
                onClick={togglePlayPause}
                className="bg-white/90 hover:bg-white text-gray-800 p-6 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20 pointer-events-auto"
                aria-label="Play video"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          )}

          {/* Controls - Only when visible, no overlays */}
          {isControlsVisible && (
            <>
              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 z-15">
                <div className="flex items-center justify-end">
                  <div className="bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                    {currentLevel === -1 || !levels[currentLevel] ? 'AUTO' : `${levels[currentLevel]?.height}P`}
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-15">
                <div className="bg-black/80 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/10">
                  {/* Progress Bar */}
                  <div className="px-6 pt-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressPercentage}
                      onChange={handleSeek}
                      onMouseDown={() => ensureControlsVisibleAndCancelAutoHide()}
                      onMouseUp={() => { if (isPlayingRef.current) startAutoHideControlsTimer(); }}
                      disabled={!isReady || isLoading}
                      className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer hover:h-2 transition-all duration-200"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progressPercentage}%, rgba(255,255,255,0.2) ${progressPercentage}%, rgba(255,255,255,0.2) 100%)`
                      }}
                      aria-label="Video progress"
                    />
                  </div>
                  
                  {/* Control Buttons */}
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={togglePlayPause}
                        disabled={!isReady}
                        className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 disabled:opacity-50 group"
                        aria-label={isPlaying ? "Pause" : "Play"}
                      >
                        {isPlaying ? (
                          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>

                      <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium border border-white/20">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Volume */}
                      <div className="relative">
                        <button
                          onClick={toggleMute}
                          disabled={!isReady}
                          className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 group"
                          onMouseEnter={() => {
                            showVolumeSliderRef.current = true;
                            setShowVolumeSlider(true);
                          }}
                          aria-label={isMuted || volume === 0 ? "Unmute" : "Mute"}
                        >
                          {isMuted || volume === 0 ? (
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.1 15.48 20.5 13.88 20.5 12c0-4.37-2.93-8.05-7-9v2.02c3.22.85 5.5 3.86 5.5 6.98zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-9.27L10.27 6.73zM12 4.81v.75l-2.02-2.02L12 2.81z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                          )}
                        </button>

                        {showVolumeSlider && (
                          <div 
                            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3"
                            onMouseLeave={() => {
                              showVolumeSliderRef.current = false;
                              setShowVolumeSlider(false);
                            }}
                          >
                            <div className="bg-black/90 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-white/20">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={handleVolumeSliderChange}
                                onMouseDown={() => ensureControlsVisibleAndCancelAutoHide()}
                                onMouseUp={() => { if (isPlayingRef.current) startAutoHideControlsTimer() }}
                                disabled={!isReady}
                                className="w-20 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                                }}
                                aria-label="Volume"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quality Selector */}
                      {levels.length > 1 && (
                        <select
                          value={currentLevel}
                          onChange={handleQualityChange}
                          disabled={!isReady || isLoading}
                          className="bg-white/10 backdrop-blur-sm border border-white/20 text-white py-1.5 px-3 rounded-lg cursor-pointer text-sm hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          aria-label="Select video quality"
                        >
                          <option value="-1" className="bg-gray-800">Auto</option>
                          {levels.map((level, index) => (
                            <option key={index} value={index} className="bg-gray-800">
                              {level.height}p • {formatBitrate(level.bitrate)}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        disabled={!isReady}
                        className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 group"
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      >
                        {isFullscreen ? (
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Minimal Progress Bar - Always Visible When Not Showing Controls */}
          {!isControlsVisible && (
            <div className="absolute bottom-3 left-4 right-4 z-15">
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={handleSeek}
                onMouseDown={() => ensureControlsVisibleAndCancelAutoHide()}
                onMouseUp={() => { if (isPlayingRef.current) startAutoHideControlsTimer(); }}
                disabled={!isReady || isLoading}
                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer hover:h-1.5 transition-all duration-200"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${progressPercentage}%, rgba(255,255,255,0.3) ${progressPercentage}%, rgba(255,255,255,0.3) 100%)`
                }}
                aria-label="Video progress"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HlsPlayer;
