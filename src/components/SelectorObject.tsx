"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";
import { MeshTransmissionMaterial, Html } from "@react-three/drei";
import type { SelectorObjectProps, SectionInfo } from "./types";
import { textureCache } from "./TextureCache";

// Component to create a selector object with transmission material using extracted geometry
export default function SelectorObject({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  geometry,
  onClick,
  enableHover = true,
  sectionIndex = 0,
  isSelected = false,
  isHidden = false,
  imageSrc,
  videoSrc,
  forceHovered = false,
  onHover
}: SelectorObjectProps) {
  const [hovered, setHovered] = useState(false);
  const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const [activeMap, setActiveMap] = useState<THREE.Texture | null>(null);
  const sectionInfoRef = useRef<SectionInfo | undefined>(undefined);
  
  // Force hovered state for mobile slider - now the ONLY source of hover
  useEffect(() => {
    setHovered(forceHovered);
  }, [forceHovered]);
  
  // Create text texture (memoized to prevent recreation)
  const textTexture = useMemo(() => {
    // Create canvas for text texture
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (context) {
      // Fill background
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw text
      context.fillStyle = '#222222';
      context.font = 'bold 400px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(sectionIndex.toString(), canvas.width / 2, canvas.height / 2 + 25);
    }
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    // Rotate 90 degrees clockwise and fix mirroring
    texture.rotation = -Math.PI / 2; // -90 degrees (clockwise)
    texture.flipY = false; // Fix vertical mirroring
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.center.set(0.5, 0.5); // Set rotation center
    
    // Force texture update
    texture.needsUpdate = true;
    
    return texture;
  }, [sectionIndex]);

  // Load image texture (from cache)
  useEffect(() => {
    if (!imageSrc) {
      setImageTexture(null);
      return;
    }

    let cancelled = false;
    textureCache.getImageTexture(imageSrc).then((texture) => {
      if (!cancelled) {
        setImageTexture(texture);
        setActiveMap(texture); // default map
      }
    }).catch((error) => {
      console.error(`Failed to load image texture for section ${sectionIndex}:`, error);
    });

    return () => { cancelled = true; };
  }, [imageSrc, sectionIndex]);

  // Prepare video texture (lazy load from cache) and toggle between image/video on slider selection
  useEffect(() => {
    if (!videoSrc) return;

    if (forceHovered) {
      // If we don't have a video texture yet, get it from cache
      if (!videoTexture) {
        let cancelled = false;
        textureCache.getVideoTexture(videoSrc).then((vTex) => {
          if (!cancelled) {
            setVideoTexture(vTex);
            setActiveMap(vTex);
            // Try to play the video
            const videoElement = textureCache.getVideoElement(videoSrc);
            if (videoElement) {
              void videoElement.play().catch(() => { /* ignore autoplay block */ });
            }
          }
        }).catch((error) => {
          console.error(`Failed to load video texture for section ${sectionIndex}:`, error);
          // Fallback to image texture if video fails
          if (imageTexture) {
            setActiveMap(imageTexture);
          }
        });

        return () => { cancelled = true; };
      } else {
        // Reuse existing video texture
        const videoElement = textureCache.getVideoElement(videoSrc);
        if (videoElement?.paused) {
          void videoElement.play().catch(() => { /* ignore */ });
        }
        // Normalize existing texture orientation if previously created with vertical flip
        if (videoTexture) {
          videoTexture.repeat.x = 1;
          videoTexture.repeat.y = 1;
          videoTexture.needsUpdate = true;
        }
        setActiveMap(videoTexture);
      }
    } else {
      // Not hovered -> show image (fallback to text texture handled below in material)
      if (imageTexture) {
        setActiveMap(imageTexture);
      } else if (videoSrc) {
        // Pause video to save resources
        const videoElement = textureCache.getVideoElement(videoSrc);
        if (videoElement) {
          videoElement.pause();
        }
      }
    }
  }, [forceHovered, videoSrc, videoTexture, imageTexture, sectionIndex]);

  // Compose section info for click callback
  useEffect(() => {
    sectionInfoRef.current = {
      index: sectionIndex,
      title: `Section ${sectionIndex}`,
      description: `Details about section ${sectionIndex}.`,
      image: imageSrc,
      video: videoSrc
    };
  }, [sectionIndex, imageSrc, videoSrc]);
  
  // Calculate position based on selection state
  const finalPosition = position;
  
  // Calculate scale based on selection state
  const finalScale = scale;
  
  // Float animation - now only triggered by slider selection
  const { positionY, rotationY } = useSpring({
    positionY: forceHovered ? finalPosition[1] + 1 : finalPosition[1],
    rotationY: forceHovered ? -0.9 : rotation[1],
    config: { tension: 300, friction: 30 }
  });

  if (isHidden) {
    return null; // Don't render hidden objects
  }
  
  return (
    <animated.mesh 
      position-x={finalPosition[0]}
      position-y={positionY}
      position-z={finalPosition[2]}
      rotation-x={rotation[0]}
      rotation-y={rotationY}
      rotation-z={rotation[2]}
      scale={finalScale}
      name="selector"
      onClick={(e) => {
        e.stopPropagation();
        console.log(`SelectorObject clicked for section ${sectionIndex}, onClick exists: ${!!onClick}`);
        if (onClick) {
          onClick(sectionInfoRef.current);
        }
      }}
      onPointerOver={(e: { stopPropagation: () => void }) => {
        e.stopPropagation(); // Prevent event from bubbling to objects behind
        if (onHover) onHover(sectionIndex);
        // Hover animation now only controlled by forceHovered (slider)
      }}
      onPointerOut={(e) => {
        e.stopPropagation(); // Prevent event from bubbling to objects behind
        if (onHover) onHover(null);
        // Hover animation now only controlled by forceHovered (slider)
      }}
      onPointerDown={(e) => {
        e.stopPropagation(); // Prevent event from bubbling to objects behind
      }}
    >
      {geometry ? (
        <primitive object={geometry} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <MeshTransmissionMaterial
        transmission={0.9}
        roughness={0.2}
        thickness={0.1}
        ior={1.5}
        chromaticAberration={0.2}
        backside={false}
        samples={10}
        resolution={256}
        clearcoat={0.5}
        clearcoatRoughness={0.0}
        distortion={0.0}
        distortionScale={0.0}
        temporalDistortion={0.0}
        map={activeMap ?? (imageSrc || videoSrc ? null : textTexture)}
        color="#ffffff"
        side={THREE.DoubleSide}
        // key={sectionIndex} // Force re-render when sectionIndex changes
      />
      
      {/* Tooltip - only shows when forceHovered (slider selection) */}
      {forceHovered && (
        <Html
          position={[-1.5, 0, 0]} // Position above and to the left of the object
          center
          distanceFactor={8}
        >
          {/* WIDE */}
          <h1 className="text-6xl rounded-4xl font-bold text-center p-16 px-8 w-96 text-white bg-black/40 backdrop-blur-2xl max-content">
            {sectionIndex === 0 ? "← Back to Start" : `Section ${sectionIndex}`}
          </h1>
        </Html>
      )}
    </animated.mesh>
  );
}
