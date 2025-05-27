'use client';

import React, { useState } from 'react';
import { getYouTubeVideoId } from '@/domain/youtube/youtube.utils';

interface YouTubeInputProps {
  onUrlSubmit: (videoId: string) => void;
}

export default function YouTubeInput({ onUrlSubmit }: YouTubeInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      onUrlSubmit(videoId);
    } else {
      setError('Invalid YouTube URL or Video ID. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-4 md:p-6 bg-gray-800 bg-opacity-60 backdrop-blur-md rounded-xl shadow-2xl transition-all duration-300 ease-in-out">
      <label htmlFor="youtubeUrl" className="sr-only">YouTube URL or Video ID</label>
      <div className="flex flex-col sm:flex-row items-stretch">
        <input
          id="youtubeUrl"
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError('');
          }}
          placeholder="Enter YouTube URL or Video ID"
          className="flex-grow p-3 sm:p-4 text-base sm:text-lg rounded-lg sm:rounded-l-lg sm:rounded-r-none border border-gray-700 bg-gray-900 bg-opacity-75 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors duration-200"
        />
        <button 
          type="submit" 
          className="mt-3 sm:mt-0 px-6 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-lg sm:rounded-r-lg sm:rounded-l-none bg-purple-600 hover:bg-purple-700 text-white focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 outline-none transition-colors duration-200"
        >
          Visualize
        </button>
      </div>
      {error && <p className="text-red-400 text-sm font-medium mt-3 text-center sm:text-left">{error}</p>}
    </form>
  );
}
