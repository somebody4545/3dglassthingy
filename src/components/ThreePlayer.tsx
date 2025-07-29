"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import SceneContent from "./SceneContent";
import DetailView from "./DetailView";
import type { PlayerProps } from "./types";

// Main ThreePlayer component
export default function ThreePlayer({ 
  width, 
  height, 
  projectData 
}: PlayerProps) {
  const [isClient, setIsClient] = useState(false);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [dimensions, setDimensions] = useState({ 
    width: width ?? 800, 
    height: height ?? 600 
  });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  
  // Base FOV for 16:9 aspect ratio (this will be the minimum)
  const baseFOV = projectData?.camera?.object?.fov ?? 50;
  const baseAspect = 16 / 9;
  
  // Calculate FOV based on aspect ratio to maintain minimum viewing angles
  const calculateFOV = (aspect: number) => {
    // Calculate what the horizontal FOV would be at the base aspect ratio
    const baseVerticalFOV = baseFOV;
    const baseHorizontalFOV = 2 * Math.atan(Math.tan((baseVerticalFOV * Math.PI) / 360) * baseAspect) * (180 / Math.PI);
    
    // Calculate what vertical FOV we need to maintain the base horizontal FOV at current aspect
    const requiredVerticalFOVForHorizontal = 2 * Math.atan(Math.tan((baseHorizontalFOV * Math.PI) / 360) / aspect) * (180 / Math.PI);
    
    // Use the larger of the two FOVs to ensure both dimensions meet their minimum
    return Math.max(baseVerticalFOV, requiredVerticalFOVForHorizontal);
  };

  // Use layoutEffect to set dimensions synchronously before paint
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: width ?? window.innerWidth,
        height: height ?? window.innerHeight
      });
      setIsClient(true);
    }
  }, [width, height]);

  useEffect(() => {
    // Handle window resize and update camera
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const newDimensions = {
          width: width ?? window.innerWidth,
          height: height ?? window.innerHeight
        };
        setDimensions(newDimensions);
        
        // Update camera and renderer if they exist
        if (cameraRef.current && rendererRef.current) {
          const newAspect = newDimensions.width / newDimensions.height;
          const newFOV = calculateFOV(newAspect);
          
          cameraRef.current.aspect = newAspect;
          cameraRef.current.fov = newFOV;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newDimensions.width, newDimensions.height);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [width, height, calculateFOV]);

  if (!isClient) {
    return (
      <div 
        style={{ width: dimensions.width, height: dimensions.height }} 
        className="flex items-center justify-center bg-gray-900 text-white"
      >
        Loading 3D Scene...
      </div>
    );
  }

  return (
    <div 
      style={{ width: dimensions.width, height: dimensions.height }} 
      className="relative"
    >
      <Canvas
        shadows={projectData?.project?.shadows}
        gl={{
          antialias: true,
          toneMapping: projectData?.project?.toneMapping ?? THREE.ACESFilmicToneMapping,
          toneMappingExposure: projectData?.project?.toneMappingExposure ?? 1
        }}
        dpr={0.25} // Render at half resolution for better performance
        style={{ width: '100%', height: '100%' }}
        frameloop="always"
        onCreated={(state) => {
          // Store refs for resize handling
          cameraRef.current = state.camera as THREE.PerspectiveCamera;
          rendererRef.current = state.gl;
          
          // Set initial camera aspect ratio and FOV
          if (state.camera instanceof THREE.PerspectiveCamera) {
            const initialAspect = dimensions.width / dimensions.height;
            const initialFOV = calculateFOV(initialAspect);
            
            state.camera.aspect = initialAspect;
            state.camera.fov = initialFOV;
            state.camera.updateProjectionMatrix();
          }
          
          // Set initial renderer size
          state.gl.setSize(dimensions.width, dimensions.height);
        }}
        camera={{
          fov: projectData?.camera?.object?.fov ?? 50,
          near: projectData?.camera?.object?.near ?? 0.1,
          far: projectData?.camera?.object?.far ?? 1000,
          position: [
            projectData?.camera?.object?.matrix?.[12] ?? 0,
            projectData?.camera?.object?.matrix?.[13] ?? 0,
            projectData?.camera?.object?.matrix?.[14] ?? 5
          ]
        }}
      >
        {/* Basic lighting if no custom lighting is provided */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow={projectData?.project?.shadows}
        />

        {/* Scene content */}
        <SceneContent
          sceneData={projectData?.scene}
          cameraData={projectData?.camera}
          scripts={projectData?.scripts}
          onSectionSelect={setSelectedSection}
          selectedSection={selectedSection}
        />
      </Canvas>

      {/* Detail View Information Panel - Outside Canvas for true window positioning */}
      <DetailView 
        selectedSection={selectedSection}
        onClose={() => setSelectedSection(null)}
      />
    </div>
  );
}
