"use client";

import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";
import { MeshTransmissionMaterial, Html } from "@react-three/drei";
import type { SelectorObjectProps } from "./types";

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
  isHidden = false
}: SelectorObjectProps) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Create video texture
  const videoTexture = useRef<THREE.VideoTexture | null>(null);
  
  useEffect(() => {
    // Create video element
    const video = document.createElement('video');
    video.src = '/content.mp4';
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    
    // Brighten the video using CSS filters
    video.style.filter = 'brightness(1.5) contrast(1.2)';
    
    // Create video texture
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;
    
    // Rotate 90 degrees clockwise and fix mirroring
    texture.rotation = -Math.PI / 2; // -90 degrees (clockwise)
    texture.flipY = false; // Fix vertical mirroring
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.center.set(0.5, 0.5); // Set rotation center
    
    videoTexture.current = texture;
    videoRef.current = video;
    
    // Start playing video
    video.play().catch(console.error);
    
    return () => {
      video.pause();
      texture.dispose();
    };
  }, []);
  
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
      onClick={onClick}
      onPointerOver={(e: any) => {
        e.stopPropagation(); // Prevent event from bubbling to objects behind
        document.body.style.cursor = 'pointer'; // Always show pointer cursor
        if (enableHover && !isSelected) { // Don't hover when selected
          setHovered(true); // Only enable animation when in intro view
        }
      }}
      onPointerOut={(e: any) => {
        document.body.style.cursor = 'auto'; // Always reset cursor
        if (enableHover && !isSelected) { // Don't hover when selected
          setHovered(false); // Only disable animation when in intro view
        }
      }}
      onPointerDown={() => {
        setHovered(false); // Hide tooltip immediately when clicked
      }}
      raycast-priority={position[0]} // Higher X position gets priority (frontmost object)
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
        map={videoTexture.current}
        color="#aaffaa"
        side={THREE.DoubleSide}
      />
      
      {/* Tooltip */}
      {hovered && (
        <Html
          position={[-1.5, 0, 0]} // Position above and to the left of the object
          center
          distanceFactor={8}
        >
          {/* WIDE */}
          <h1 className="text-4xl rounded-4xl font-bold text-center p-16 px-8 w-96 text-white bg-black/40 backdrop-blur-2xl max-content">
            {sectionIndex === 0 ? "← Back to Start" : `Section ${sectionIndex}`}
          </h1>
        </Html>
      )}
    </animated.mesh>
  );
}
