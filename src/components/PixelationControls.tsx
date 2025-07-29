"use client";

import { useState } from 'react';
import PixelationEffect from '../components/PixelationEffect';

interface PixelationControlsProps {
  children: React.ReactNode;
}

export default function PixelationControls({ children }: PixelationControlsProps) {
  const [isPixelated, setIsPixelated] = useState(true);
  const [tileSize, setTileSize] = useState(5);
  const [sigmaGauss, setSigmaGauss] = useState(1);

  return (
    <>
      {/* Control Panel */}
      <div className="fixed top-4 left-4 z-50 bg-black/80 text-white p-4 rounded-lg backdrop-blur-sm">
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isPixelated}
              onChange={(e) => setIsPixelated(e.target.checked)}
              className="w-4 h-4"
            />
            Enable Pixelation
          </label>
          
          {isPixelated && (
            <>
              <label className="flex items-center gap-2">
                Tile Size:
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={tileSize}
                  onChange={(e) => setTileSize(parseInt(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm w-6">{tileSize}</span>
              </label>
              
              <label className="flex items-center gap-2">
                Blur:
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={sigmaGauss}
                  onChange={(e) => setSigmaGauss(parseFloat(e.target.value))}
                  className="w-20"
                />
                <span className="text-sm w-8">{sigmaGauss}</span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isPixelated ? (
        <PixelationEffect tileSize={tileSize} sigmaGauss={sigmaGauss}>
          {children}
        </PixelationEffect>
      ) : (
        children
      )}
    </>
  );
}
