"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    setIsClient(true);
    
    // Set initial dimensions
    if (typeof window !== 'undefined') {
      setDimensions({
        width: width ?? window.innerWidth,
        height: height ?? window.innerHeight
      });
    }

    // Handle window resize
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setDimensions({
          width: width ?? window.innerWidth,
          height: height ?? window.innerHeight
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [width, height]);

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
        style={{ width: '100%', height: '100%' }}
        frameloop="always"
        onCreated={(state) => {
          // Cap framerate to 30 FPS
          let lastFrameTime = 0;
          const targetFPS = 30;
          const interval = 1000 / targetFPS;
          
          const render = (time: number) => {
            if (time - lastFrameTime >= interval) {
              lastFrameTime = time;
              state.gl.render(state.scene, state.camera);
            }
            requestAnimationFrame(render);
          };
          
          // Stop the default render loop and start our custom one
          state.gl.setAnimationLoop(null);
          requestAnimationFrame(render);
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
