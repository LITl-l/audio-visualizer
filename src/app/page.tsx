'use client';

import React, { useState, useEffect, useRef } from 'react';
import YouTubeInput from '@/components/YouTubeInput';
import ShaderCanvas from '@/components/ShaderCanvas';
import YouTubePlayerFactory, { YouTubePlayer } from 'youtube-player';

export default function HomePage() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [currentVolume, setCurrentVolume] = useState<number>(0.0); // Normalized 0-1
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerInstanceRef = useRef<YouTubePlayer | null>(null);
  const volumePollIntervalRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (playerContainerRef.current && !ytPlayerInstanceRef.current) {
      console.log("Initializing YouTube Player");
      ytPlayerInstanceRef.current = YouTubePlayerFactory(playerContainerRef.current, {
        playerVars: {
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          autoplay: 0, 
          fs: 0, 
          rel: 0, 
        },
      });

      ytPlayerInstanceRef.current.on('ready', () => {
        console.log('Player is ready');
      });

      ytPlayerInstanceRef.current.on('stateChange', (event: { data: number }) => {
        if (event.data === 1) { // Playing
          console.log('Player is playing. Starting volume polling.');
          if (volumePollIntervalRef.current) clearInterval(volumePollIntervalRef.current);
          volumePollIntervalRef.current = setInterval(async () => {
            if (ytPlayerInstanceRef.current) {
              try {
                const volume = await ytPlayerInstanceRef.current.getVolume(); // 0-100
                const isMuted = await ytPlayerInstanceRef.current.isMuted();
                if (isMuted) {
                  setCurrentVolume(0);
                } else {
                  setCurrentVolume(volume / 100); // Normalize to 0-1
                }
              } catch (error) {
                console.error("Error getting volume:", error);
                if (volumePollIntervalRef.current) {
                    clearInterval(volumePollIntervalRef.current);
                    volumePollIntervalRef.current = null;
                }
              }
            }
          }, 200); 
        } else { 
          console.log('Player is not playing. Stopping volume polling.');
          if (volumePollIntervalRef.current) {
            clearInterval(volumePollIntervalRef.current);
            volumePollIntervalRef.current = null;
          }
          setCurrentVolume(0); 
        }
      });
    }

    return () => {
      if (volumePollIntervalRef.current) clearInterval(volumePollIntervalRef.current);
      if (ytPlayerInstanceRef.current) {
        if (typeof ytPlayerInstanceRef.current.destroy === 'function') {
          ytPlayerInstanceRef.current.destroy();
        }
        ytPlayerInstanceRef.current = null;
        console.log("YouTube Player destroyed or prepared for destruction");
      }
    };
  }, []); 

  useEffect(() => {
    if (videoId && ytPlayerInstanceRef.current) {
      console.log(`Loading video: ${videoId}`);
      ytPlayerInstanceRef.current.loadVideoById(videoId);
      ytPlayerInstanceRef.current.playVideo();
    } else if (!videoId && ytPlayerInstanceRef.current) {
      if (typeof ytPlayerInstanceRef.current.stopVideo === 'function') {
        ytPlayerInstanceRef.current.stopVideo();
      }
      setCurrentVolume(0); 
      if (volumePollIntervalRef.current) { 
        clearInterval(volumePollIntervalRef.current);
        volumePollIntervalRef.current = null;
      }
    }
  }, [videoId]);

  const handleUrlSubmit = (newVideoId: string) => {
    setVideoId(newVideoId);
  };

  return (
    // Ensure this main container is effectively full-height and manages layout
    <main className="relative w-screen h-screen flex flex-col items-center justify-start overflow-hidden">
      {/* ShaderCanvas is already positioned absolutely and with z-index by its own styles */}
      <ShaderCanvas volume={currentVolume} />
      
      {/* Hidden YouTube Player Container */}
      <div id="youtube-player-container" ref={playerContainerRef} className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none"></div>
      
      {/* Content Area: Centered, on top of the canvas */}
      <div className="z-10 flex flex-col items-center justify-start w-full px-4 pt-12 sm:pt-20"> {/* Increased padding-top */}
        <div className="w-full max-w-lg md:max-w-xl"> {/* Constrain width of input area */}
          <YouTubeInput onUrlSubmit={handleUrlSubmit} />
          {videoId && (
            <p className="text-white text-center mt-3 text-sm bg-black bg-opacity-30 px-3 py-1 rounded-md">
              Playing: {videoId} (Volume: {Math.round(currentVolume * 100)}%)
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
