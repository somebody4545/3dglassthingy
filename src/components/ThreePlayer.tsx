"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState, useLayoutEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePreloadSectionMedia } from "../hooks/usePreloadSectionMedia";
import * as THREE from "three";
import SceneContent from "./SceneContent";
import DetailView from "./DetailView";
import type { PlayerProps } from "./types";
import { FOVController } from './utils';
import { sectionData, panelPages } from './sectionData';

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
  const mediaPreload = usePreloadSectionMedia();
  const [pageIndex, setPageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sliderSelectedSection, setSliderSelectedSection] = useState<number | null>(null);
  const [isExperienceStarted, setIsExperienceStarted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const cursorRef = useRef<HTMLDivElement>(null);
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);
  const totalPages = panelPages.length;
  const canPageUp = pageIndex > 0;
  const canPageDown = pageIndex < totalPages - 1;
  const [showTooltip, setShowTooltip] = useState(true);
  
  // FOV Controller for managing camera FOV calculations
  const fovController = useRef(new FOVController(projectData?.camera?.object?.fov ?? 50)).current;

  // Use layoutEffect to set dimensions synchronously before paint
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      setDimensions({
        width: width ?? window.innerWidth,
        height: height ?? window.innerHeight
      });
      setIsClient(true);
      // Mobile detection
      setIsMobile(window.innerWidth <= 768);
    }
  }, [width, height]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Mouse tracking for custom cursor
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePositionRef.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Initialize cursor position
  useEffect(() => {
    if (!isMobile && cursorRef.current && typeof window !== 'undefined') {
      const rect = cursorRef.current.getBoundingClientRect();
      cursorRef.current.style.left = `${window.innerWidth / 2}px`;
      cursorRef.current.style.top = `${window.innerHeight / 2}px`;
    }
  }, [isMobile]);

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
          fovController.setAspect(newAspect);
          
          // Always apply aspect ratio changes immediately, even during transitions
          fovController.applyToCamera(cameraRef.current);
          
          rendererRef.current.setSize(newDimensions.width, newDimensions.height);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [width, height, isTransitioning, fovController]);

  // Reset slider selection when page changes (only if experience started)
  useEffect(() => {
    if (!isExperienceStarted) return;
    const currentPageSections = panelPages[pageIndex]?.sections ?? [];
    // Set to first content section (index 1) if it exists, otherwise first available section
    const firstContentSection = currentPageSections.find(s => s.index !== 0);
    setSliderSelectedSection(firstContentSection?.index ?? null);
  }, [pageIndex, isExperienceStarted]);

  if (!isClient || !mediaPreload.done) {
    return (
      <div 
        style={{ width: dimensions.width, height: dimensions.height }} 
        className="flex items-center justify-center bg-gray-900 text-white"
      >
        <div className="text-center space-y-4">
          <div className="text-xl font-semibold">Loading 3D Scene & Media...</div>
          {mediaPreload.total > 0 && (
            <div className="w-64 mx-auto">
              <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 transition-all" style={{ width: `${(mediaPreload.progress * 100).toFixed(0)}%` }} />
              </div>
              <div className="mt-2 text-sm text-gray-300">{mediaPreload.loaded} / {mediaPreload.total}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ width: dimensions.width, height: dimensions.height, cursor: hoveredSection == null ? 'auto' : 'none' }} 
      className="relative"
    >
      {/* Top tooltip */}
      {showTooltip && (
        <div className="absolute top-4 mt-12 left-1/2 transform -translate-x-1/2 z-40 ">
          <div className="bg-black/60 text-white px-4 py-2 rounded-lg text-xl backdrop-blur-sm flex items-center justify-between">
        <span>Click on a panel for more info, <br />and use the slider to skim panels</span>
        <button
          onClick={() => setShowTooltip(false)}
          className="ml-2 text-2xl text-white hover:text-gray-300 cursor-pointer"
          aria-label="Close tooltip"
        >
          ×
        </button>
          </div>
        </div>
      )}

      <Canvas
        shadows={projectData?.project?.shadows}
        gl={{
          antialias: true,
          toneMapping: projectData?.project?.toneMapping ?? THREE.ACESFilmicToneMapping,
          toneMappingExposure: projectData?.project?.toneMappingExposure ?? 1
        }}
        dpr={0.5} // Render at half resolution for better performance
        style={{ width: '100%', height: '100%' }}
        frameloop="always"
        onCreated={(state) => {
          // Store refs for resize handling
          cameraRef.current = state.camera as THREE.PerspectiveCamera;
          rendererRef.current = state.gl;
          
          // Set initial camera aspect ratio and FOV
          if (state.camera instanceof THREE.PerspectiveCamera) {
            // Use actual window dimensions for initial calculation, not state dimensions
            const initialWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
            const initialHeight = typeof window !== 'undefined' ? window.innerHeight : 600;
            const initialAspect = initialWidth / initialHeight;
            fovController.setAspect(initialAspect);
            fovController.applyToCamera(state.camera);
          }
          
          // Set initial renderer size
          const initialWidth = typeof window !== 'undefined' ? window.innerWidth : dimensions.width;
          const initialHeight = typeof window !== 'undefined' ? window.innerHeight : dimensions.height;
          state.gl.setSize(initialWidth, initialHeight);
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
          pageIndex={pageIndex}
          isMobile={isMobile}
          sliderSelectedSection={sliderSelectedSection}
          onSliderSelect={setSliderSelectedSection}
          onTransitionChange={setIsTransitioning}
          fovController={fovController}
          isExperienceStarted={isExperienceStarted}
          setIsExperienceStarted={setIsExperienceStarted}
          onHover={setHoveredSection}
        />
      </Canvas>

      {/* Detail View Information Panel - Outside Canvas for true window positioning */}
      <DetailView 
        selectedSection={selectedSection}
        onClose={() => setSelectedSection(null)}
      />

      {/* Custom cursor for desktop */}
      {!isMobile && (
        <div
          ref={cursorRef}
          className="absolute pointer-events-none z-[1000000000]"
          style={{
            transform: 'translate(-50%, -50%)'
          }}
        >
          <AnimatePresence>
            {hoveredSection !== null && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-2 bg-black/80 text-white px-3 py-2 rounded-lg backdrop-blur-sm"
              >
                <span className="text-sm font-medium">
                  {sectionData.find(s => s.index === hoveredSection)?.title || `Section ${hoveredSection}`}
                </span>
                <span className="text-lg">→</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Slider controls: only show when experience has started */}
      {isExperienceStarted && (
        <div className="absolute left-0 right-0 bottom-0 flex items-center justify-center p-4 z-50 pointer-events-none">
          <div className="w-full max-w-3xl px-4">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <button
                type="button"
                onClick={() => canPageUp && setPageIndex(p => Math.max(0, p - 1))}
                disabled={!canPageUp}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 text-2xl font-semibold text-white shadow-[0_0_0_2px_rgba(255,255,255,0.05),0_8px_30px_-8px_rgba(0,0,0,0.7)] backdrop-blur-xl transition hover:bg-white/15 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.15),0_10px_34px_-8px_rgba(0,0,0,0.75)] disabled:cursor-not-allowed disabled:opacity-30 pointer-events-auto`}
                aria-label="Previous Page"
              >↑</button>
              <div className="text-center text-white/85">
                <div className="text-lg font-semibold">{pageIndex + 1} / {totalPages}</div>
                <div className="text-sm text-white/55">{panelPages[pageIndex]?.label}</div>
              </div>
              <button
                type="button"
                onClick={() => canPageDown && setPageIndex(p => Math.min(totalPages - 1, p + 1))}
                disabled={!canPageDown}
                className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-black/40 text-2xl font-semibold text-white shadow-[0_0_0_2px_rgba(255,255,255,0.05),0_8px_30px_-8px_rgba(0,0,0,0.7)] backdrop-blur-xl transition hover:bg-white/15 hover:shadow-[0_0_0_2px_rgba(255,255,255,0.15),0_10px_34px_-8px_rgba(0,0,0,0.75)] disabled:cursor-not-allowed disabled:opacity-30 pointer-events-auto`}
                aria-label="Next Page"
              >↓</button>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, (panelPages[pageIndex]?.sections?.length ?? 1) - 1)}
              value={(() => {
                const currentPageSections = panelPages[pageIndex]?.sections ?? [];
                const idx = currentPageSections.findIndex(s => s.index === sliderSelectedSection);
                return idx >= 0 ? idx : 0;
              })()}
              onChange={(e) => {
                const val = Number(e.currentTarget.value);
                const currentPageSections = panelPages[pageIndex]?.sections ?? [];
                if (currentPageSections[val]) {
                  setSliderSelectedSection(currentPageSections[val].index);
                }
              }}
              className="w-full pointer-events-auto"
              aria-label="Select section"
            />
            <div className="mt-2 text-center text-sm text-white/80">
              Section {sliderSelectedSection ?? 0}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
