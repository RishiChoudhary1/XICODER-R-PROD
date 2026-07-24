import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Video } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Format seconds to MM:SS safely
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update current time during playback and listen for end of video
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0); // Optional: reset to beginning when done
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      }
    }
  }, []);

  // Fallback if no video URL is provided yet
  if (!secureUrl) {
    return (
      <div className="w-full aspect-video border border-gray-300 bg-[#f5f5f5] flex flex-col items-center justify-center text-gray-500">
        <Video size={32} className="mb-2 opacity-30" />
        <p className="text-sm">No editorial video available.</p>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full border border-gray-300 bg-black group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={secureUrl}
        poster={thumbnailUrl}
        onClick={togglePlayPause}
        className="w-full aspect-video object-contain cursor-pointer"
      />
      
      {/* Video Controls Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-t border-gray-800 p-3 transition-opacity duration-300 ${
          isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="text-white hover:text-gray-300 transition-colors focus:outline-none flex items-center justify-center"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
          </button>
          
          {/* Progress Bar Container */}
          <div className="flex items-center gap-3 w-full">
            <span className="text-white font-mono text-xs w-9 text-right">
              {formatTime(currentTime)}
            </span>
            
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Number(e.target.value);
                  setCurrentTime(Number(e.target.value));
                }
              }}
              className="flex-1 h-1 bg-gray-600 appearance-none rounded-none outline-none cursor-pointer accent-white hover:accent-gray-200 transition-all"
            />
            
            <span className="text-gray-400 font-mono text-xs w-9 text-left">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editorial;