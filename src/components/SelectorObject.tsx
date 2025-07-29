"use client";

import { useState, useEffect } from "react";
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
  const [textTexture, setTextTexture] = useState<THREE.CanvasTexture | null>(null);
  
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
        e.stopPropagation(); // Prevent event from bubbling to objects behind
        if (onClick) {
          onClick();
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
        map={textTexture}
        color="#aaffaa"
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
