"use client";

import { useEffect, useRef } from 'react';

interface PixelationEffectProps {
  tileSize?: number;
  sigmaGauss?: number;
  children: React.ReactNode;
}

export default function PixelationEffect({ 
  tileSize = 2, 
  sigmaGauss = 1.5, 
  children 
}: PixelationEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentContainer = containerRef.current;
    
    function pixelate(currentTileSize = tileSize, currentSigmaGauss = sigmaGauss) {
      currentTileSize = currentTileSize < 1 ? 1 : currentTileSize;
      currentSigmaGauss = currentSigmaGauss < 1 ? 1 : currentSigmaGauss;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const rows = canvas.height / currentTileSize;
      const cols = canvas.width / currentTileSize;
      
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = "white";
          ctx.fillRect(
            c * currentTileSize - 1 + Math.floor(currentTileSize / 2),
            r * currentTileSize - 1 + Math.floor(currentTileSize / 2),
            1,
            1
          );
        }
      }

      // Find or create the SVG filter
      let svgFilter = document.getElementById("pixelate-filter") as SVGSVGElement | null;
      if (!svgFilter) {
        svgFilter = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgFilter.id = "pixelate-filter";
        svgFilter.style.position = "absolute";
        svgFilter.style.width = "0";
        svgFilter.style.height = "0";
        svgFilter.style.pointerEvents = "none";
        document.body.appendChild(svgFilter);

        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svgFilter.appendChild(defs);

        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.id = "pixelate";
        filter.setAttribute("x", "0%");
        filter.setAttribute("y", "0%");
        filter.setAttribute("width", "100%");
        filter.setAttribute("height", "100%");
        defs.appendChild(filter);
      }

      const filter = svgFilter.querySelector("#pixelate");
      if (filter) {
        filter.innerHTML = "";

        const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
        blur.setAttribute("in", "SourceGraphic");
        blur.setAttribute("stdDeviation", currentSigmaGauss.toString());
        blur.setAttribute("result", "blurred");

        const hmap = document.createElementNS("http://www.w3.org/2000/svg", "feImage");
        const hmapUrl = canvas.toDataURL();
        hmap.setAttribute("href", hmapUrl);
        hmap.setAttribute("result", "hmap");

        const blend = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
        blend.setAttribute("mode", "multiply");
        blend.setAttribute("in", "blurred");
        blend.setAttribute("in2", "hmap");

        const morph = document.createElementNS("http://www.w3.org/2000/svg", "feMorphology");
        morph.setAttribute("operator", "dilate");
        morph.setAttribute("radius", (currentTileSize / 2).toString());

        filter.appendChild(blur);
        filter.appendChild(hmap);
        filter.appendChild(blend);
        filter.appendChild(morph);
      }

      // Apply the filter to the container
      if (currentContainer) {
        currentContainer.style.filter = "url(#pixelate)";
      }
    }

    // Initial pixelation
    pixelate(tileSize, sigmaGauss);

    // Re-apply on window resize
    const handleResize = () => {
      pixelate(tileSize, sigmaGauss);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Clean up filter when component unmounts
      if (currentContainer) {
        currentContainer.style.filter = 'none';
      }
      
      const svgFilter = document.getElementById("pixelate-filter");
      if (svgFilter) {
        svgFilter.remove();
      }
    };
  }, [tileSize, sigmaGauss]);

  return (
    <div ref={containerRef} className="pixelation-container">
      {children}
    </div>
  );
}
