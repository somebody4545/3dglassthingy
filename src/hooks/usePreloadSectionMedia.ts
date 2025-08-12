"use client";

import { useEffect, useState, useRef } from 'react';
import { sectionData } from '../components/sectionData';

interface PreloadResult {
  progress: number; // 0..1
  loaded: number;
  total: number;
  done: boolean;
}

// Preload all section images and videos to warm browser cache before interaction.
export function usePreloadSectionMedia(): PreloadResult {
  const [loaded, setLoaded] = useState(0);
  const totalRef = useRef(0);
  const [total, setTotal] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return; // run once
    startedRef.current = true;
    const assets: string[] = [];
    sectionData.forEach(s => {
      if (s.image) assets.push(s.image);
      if (s.video) assets.push(s.video);
    });
    totalRef.current = assets.length;
    setTotal(assets.length);
    if (assets.length === 0) return;

    const handleDone = () => setLoaded(l => l + 1);

    const videoRegex = /\.(mp4|webm|ogg)(\?|$)/i;
    assets.forEach(src => {
      if (videoRegex.exec(src)) {
        // Video preload
        const video = document.createElement('video');
        video.src = src;
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        const cleanup = () => {
          video.removeEventListener('loadeddata', onLoaded);
          video.removeEventListener('error', onError);
        };
        const onLoaded = () => { cleanup(); handleDone(); };
        const onError = () => { cleanup(); handleDone(); };
        video.addEventListener('loadeddata', onLoaded, { once: true });
        video.addEventListener('error', onError, { once: true });
        try { video.load(); } catch {/* ignore */}
      } else {
        // Image preload
        const img = new Image();
        img.src = src;
        const cleanup = () => {
          img.onload = null;
          img.onerror = null;
        };
        img.onload = () => { cleanup(); handleDone(); };
        img.onerror = () => { cleanup(); handleDone(); };
      }
    });
  }, []);

  const progress = total > 0 ? loaded / total : 1;
  return { progress, loaded, total, done: loaded >= total && total > 0 };
}

export default usePreloadSectionMedia;
