"use client";

import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";
import { MeshTransmissionMaterial, Html } from "@react-three/drei";
import type { SelectorObjectProps, SectionInfo } from "./types";

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
  videoSrc
}: SelectorObjectProps) {
  const [hovered, setHovered] = useState(false);
  const [textTexture, setTextTexture] = useState<THREE.CanvasTexture | null>(null);
  const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null);
  const [videoTexture, setVideoTexture] = useState<THREE.VideoTexture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [activeMap, setActiveMap] = useState<THREE.Texture | null>(null);
  const sectionInfoRef = useRef<SectionInfo | undefined>(undefined);
  
  useEffect(() => {
    // Only create texture if we don't have one or if sectionIndex actually changed
    if (textTexture && textTexture.userData?.sectionIndex === sectionIndex) {
      return; // No need to recreate
    }
    
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
    
    // Store sectionIndex in userData to prevent unnecessary recreations
    texture.userData = { sectionIndex };
    
    // Dispose old texture if it exists
    if (textTexture) {
      textTexture.dispose();
    }
    
    setTextTexture(texture);
    
    return () => {
      texture.dispose();
    };
  }, [sectionIndex, textTexture]); // Keep sectionIndex dependency but add optimization above

  // Load image texture (static)
  useEffect(() => {
    if (!imageSrc) return;
    const loader = new THREE.TextureLoader();
    let cancelled = false;
    loader.load(imageSrc, (tex) => {
      if (cancelled) return;
  // Rotate 90° clockwise and flip horizontally
  tex.center.set(0.5, 0.5);
  tex.rotation = -Math.PI / 2; // clockwise
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.flipY = false; // prevent vertical mirroring issues
      tex.needsUpdate = true;
      setImageTexture(tex);
      setActiveMap(tex); // default map
    });
    return () => { cancelled = true; };
  }, [imageSrc]);

  // Prepare video texture (only create once) and toggle between image/video on hover
  useEffect(() => {
    if (!videoSrc) return;
    if (hovered) {
      // If we don't have a video texture yet, create it
      if (!videoTexture) {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true; // autoplay requires muted
        video.playsInline = true;
        video.preload = 'auto';
        videoRef.current = video;
  void video.play().catch(() => { /* ignore autoplay block */ });
        const vTex = new THREE.VideoTexture(video);
        vTex.minFilter = THREE.LinearFilter;
        vTex.magFilter = THREE.LinearFilter;
  // Rotate 90° clockwise (no horizontal or vertical mirroring)
        vTex.center.set(0.5, 0.5);
        vTex.rotation = -Math.PI / 2;
        vTex.wrapS = vTex.wrapT = THREE.RepeatWrapping;
  vTex.repeat.x = 1; // no horizontal flip
  vTex.repeat.y = 1; // upright
        vTex.flipY = false; // prevent default vertical flip
        vTex.needsUpdate = true;
        setVideoTexture(vTex);
        setActiveMap(vTex);
      } else {
        // Reuse existing video texture
        if (videoRef.current?.paused) {
          void videoRef.current.play().catch(() => { /* ignore */ });
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
      } else if (videoRef.current) {
        // Pause video to save resources
        videoRef.current.pause();
      }
    }
  }, [hovered, videoSrc, videoTexture, imageTexture]);

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
  const finalPosition = isSelected 
    ? [-8, 3, 15] as [number, number, number] // Corner position when selected
    : position;
  
  // Calculate scale based on selection state
  const finalScale = isSelected 
    ? [0.8, 0.8, 0.8] as [number, number, number] // Smaller when selected
    : scale;
  
  // Float animation
  const { positionY, rotationY } = useSpring({
    positionY: hovered ? finalPosition[1] + 1 : finalPosition[1],
    rotationY: hovered ? -0.9 : rotation[1],
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
        if (onClick) {
          onClick(sectionInfoRef.current);
        }
      }}
      onPointerOver={(e: { stopPropagation: () => void }) => {
        e.stopPropagation(); // Prevent event from bubbling to objects behind
        document.body.style.cursor = 'pointer'; // Always show pointer cursor
        if (enableHover && !isSelected) { // Don't hover when selected
          setHovered(true); // Only enable animation when in intro view
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation(); // Prevent event from bubbling to objects behind
        document.body.style.cursor = 'auto'; // Always reset cursor
        if (enableHover && !isSelected) { // Don't hover when selected
          setHovered(false); // Only disable animation when in intro view
        }
      }}
      onPointerDown={(e) => {
        e.stopPropagation(); // Prevent event from bubbling to objects behind
        setHovered(false); // Hide tooltip immediately when clicked
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
  map={activeMap ?? textTexture}
        color="#ffffff"
        side={THREE.DoubleSide}
        key={sectionIndex} // Force re-render when sectionIndex changes
      />
      
      {/* Tooltip */}
      {hovered && (
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
