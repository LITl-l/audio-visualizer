// src/domain/youtube/youtube.utils.ts
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // First, check if the input itself is a valid 11-character ID.
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    if (!/[?=/]/.test(url)) { // Ensure it's not part of a path/query looking like an ID
        return url;
    }
  }

  // Updated regex: anchored and requires trailing slash after domain.
  const youtubeDomainRegex = /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//;

  const urlRegexes = [
    // These regexes assume the domain and protocol part has already been validated.
    // They search for patterns that follow the domain.
    { regex: /watch\?v=([a-zA-Z0-9_-]{11})/, idIndex: 1 }, // No leading / needed if regex is tested on full URL after domain check
    { regex: /embed\/([a-zA-Z0-9_-]{11})/, idIndex: 1 },
    { regex: /v\/([a-zA-Z0-9_-]{11})/, idIndex: 1 },
    { regex: /playlist\?.*v=([a-zA-Z0-9_-]{11})/, idIndex: 1 },
    // youtu.be is special, its ID is right after the domain.
    // The main youtubeDomainRegex will match youtu.be/, then this specific regex will grab the ID.
    { regex: /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/, idIndex: 1} // This one needs to be more specific for youtu.be
  ];

  // Test for youtu.be separately first due to its unique structure
  const youtuBeMatch = url.match(/^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (youtuBeMatch && youtuBeMatch[1]) {
    if (/^[a-zA-Z0-9_-]{11}$/.test(youtuBeMatch[1])) { // Double check ID validity
        return youtuBeMatch[1];
    }
  }

  // Check if it's a standard YouTube domain for other patterns
  if (youtubeDomainRegex.test(url)) {
    // For youtube.com URLs, we use regexes that look for patterns *within* the path and query
    const youtubeComRegexes = [
        { regex: /watch\?v=([a-zA-Z0-9_-]{11})/, idIndex: 1 },
        { regex: /embed\/([a-zA-Z0-9_-]{11})/, idIndex: 1 },
        { regex: /v\/([a-zA-Z0-9_-]{11})/, idIndex: 1 },
        { regex: /playlist\?.*v=([a-zA-Z0-9_-]{11})/, idIndex: 1 },
    ];
    for (const { regex, idIndex } of youtubeComRegexes) {
      const match = url.match(regex); // These regexes search within the string
      if (match && match[idIndex] && /^[a-zA-Z0-9_-]{11}$/.test(match[idIndex])) {
        return match[idIndex]; 
      }
    }
  }
  
  // Handle URLs without http/https by prepending https:// and re-testing ONCE.
  // This avoids complex regex for optional protocol.
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (url.startsWith('www.youtube.com') || url.startsWith('youtu.be')) {
        // Prevent infinite recursion by ensuring this is only called once.
        // The simplest way is to rely on the structure of the function:
        // if the prepended version finds an ID, it returns. If not, it falls through to null.
        return getYouTubeVideoId('https://' + url);
    }
  }

  return null;
}
