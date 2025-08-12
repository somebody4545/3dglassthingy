"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from 'three';
import { sectionData, panelPages } from './sectionData';
import SelectorObject from "./SelectorObject";
import { dispatch, CAMERA_CONFIGS, TRANSITION_CONFIG } from "./utils";
import type { SceneContentProps } from "./types";

interface EventHandlers {
  init: Array<(event: unknown) => void>;
  start: Array<(event: unknown) => void>;
  stop: Array<(event: unknown) => void>;
  keydown: Array<(event: unknown) => void>;
  keyup: Array<(event: unknown) => void>;
  pointerdown: Array<(event: unknown) => void>;
  pointerup: Array<(event: unknown) => void>;
  pointermove: Array<(event: unknown) => void>;
  update: Array<(event: unknown) => void>;
  [key: string]: Array<(event: unknown) => void>;
}

// Component to handle the 3D scene content
export default function SceneContent({ 
  sceneData, 
  cameraData, 
  scripts, 
  onInit, 
  onSectionSelect, 
  selectedSection: parentSelectedSection,
  pageIndex
}: SceneContentProps) {
  const { scene, camera, gl: renderer } = useThree();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectorGeometry, setSelectorGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isInIntroView, setIsInIntroView] = useState(false);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [, forceRerender] = useState(0);
  // Page transition state
  interface PageTransitionState {
    stage: 'idle' | 'leaving' | 'entering';
    prevPage: number | null;
    nextPage: number | null;
    progress: number; // base timeline 0..1 (before per-item delay)
  }
  const pageTransition = useRef<PageTransitionState>({ stage: 'idle', prevPage: null, nextPage: null, progress: 0 });
  const currentPageRef = useRef(pageIndex);
  const lastRequestedRef = useRef(pageIndex);
  const pageQueueRef = useRef<number[]>([]);
  const perItemDelay = 0.02; // faster stagger
  const travelDistance = 25; // travel distance retained
  const baseDuration = 0.6; // shorter duration per panel
  const easeOutExpo = (x: number) => (x <= 0 ? 0 : (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)));

  // Helper to start next queued transition if idle
  const startNextTransition = useCallback(() => {
    if (pageTransition.current.stage !== 'idle') return;
    // Pull next distinct target
    while (pageQueueRef.current.length) {
      const target = pageQueueRef.current.shift();
      if (target != null && target !== currentPageRef.current) {
        pageTransition.current = { stage: 'leaving', prevPage: currentPageRef.current, nextPage: target, progress: 0 };
        break;
      }
    }
  }, []);

  // Queue page changes
  useEffect(() => {
    if (pageIndex !== lastRequestedRef.current) {
      // Push to queue if not duplicate of last queued
      const q = pageQueueRef.current;
      if (q[q.length - 1] !== pageIndex) q.push(pageIndex);
      lastRequestedRef.current = pageIndex;
      startNextTransition();
    }
  }, [pageIndex, startNextTransition]);

  // Adaptive FOV calculation (same as in ThreePlayer)
  const baseAspect = 16 / 9;
  
  // Track current base FOV (the FOV that would be used at 16:9)
  const currentBaseFOVRef = useRef<number>(CAMERA_CONFIGS.sideview.fov);
  
  const calculateAdaptiveFOV = useCallback((baseFOV: number, aspect: number) => {
    // Calculate what the horizontal FOV would be at the base aspect ratio
    const baseVerticalFOV = baseFOV;
    const baseHorizontalFOV = 2 * Math.atan(Math.tan((baseVerticalFOV * Math.PI) / 360) * baseAspect) * (180 / Math.PI);
    
    // Calculate what vertical FOV we need to maintain the base horizontal FOV at current aspect
    const requiredVerticalFOVForHorizontal = 2 * Math.atan(Math.tan((baseHorizontalFOV * Math.PI) / 360) / aspect) * (180 / Math.PI);
    
    // Use the larger of the two FOVs to ensure both dimensions meet their minimum
    return Math.max(baseVerticalFOV, requiredVerticalFOVForHorizontal);
  }, [baseAspect]);

  // Sync with parent component's selectedSection
  useEffect(() => {
    setSelectedSection(parentSelectedSection ?? null);
  }, [parentSelectedSection]);
  
  // Pre-generate random rotations once (skip first object)
  const [randomRotations] = useState(() => 
    Array.from({ length: 11 }, (_, i) => {
      if (i === 0) {
        // Keep original rotation for the first (clickable) object
        return [0, 0, -1.5707963267948966] as [number, number, number];
      }
      return [
        0 + (Math.random() * 0.2 - 0.1),
        0 + (Math.random() * 0.2 - 0.1),
        -1.5707963267948966 + (Math.random() * 0.2 - 0.1)
      ] as [number, number, number];
    })
  );
  
  const eventsRef = useRef<EventHandlers>({
    init: [],
    start: [],
    stop: [],
    keydown: [],
    keyup: [],
    pointerdown: [],
    pointerup: [],
    pointermove: [],
    update: []
  });
  const timeRef = useRef({ startTime: 0, prevTime: 0 });
  const transitionRef = useRef({
    isTransitioning: false,
    startPos: new THREE.Vector3(),
    targetPos: new THREE.Vector3(),
    startQuaternion: new THREE.Quaternion(),
    targetQuaternion: new THREE.Quaternion(),
    startFov: 0,
    targetFov: 0,
    startTime: 0,
    duration: TRANSITION_CONFIG.duration
  });

  // Function to smoothly transition camera
  const transitionToIntroCamera = useCallback(() => {
    if (isTransitioning || !camera) return;
    
    setIsTransitioning(true);
    transitionRef.current.isTransitioning = true;
    transitionRef.current.startPos.copy(camera.position);
    transitionRef.current.startQuaternion.copy(camera.quaternion);
    
    // Extract target position and rotation from intro camera matrix
    const tempPos = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();
    const introMatrix = new THREE.Matrix4().fromArray(CAMERA_CONFIGS.intro.matrix);
    introMatrix.decompose(tempPos, tempQuat, tempScale);
    
    transitionRef.current.targetPos.copy(tempPos);
    transitionRef.current.targetQuaternion.copy(tempQuat);
    
    // Store base FOVs (not adaptive ones)
    transitionRef.current.startFov = currentBaseFOVRef.current;
    transitionRef.current.targetFov = CAMERA_CONFIGS.intro.fov;
    transitionRef.current.startTime = performance.now();
    
    console.log('Starting camera transition to intro position');
  }, [camera, isTransitioning]);

  // Function to transition back to sideview
  const transitionToSideviewCamera = useCallback(() => {
    if (isTransitioning || !camera) return;
    
    setIsTransitioning(true);
    setIsInIntroView(false); // Disable hover effects when going back to sideview
    setSelectedSection(null); // Clear selected section
    if (onSectionSelect) {
      onSectionSelect(null); // Clear selection in parent component too
    }
    transitionRef.current.isTransitioning = true;
    transitionRef.current.startPos.copy(camera.position);
    transitionRef.current.startQuaternion.copy(camera.quaternion);
    
    // Extract target position and rotation from sideview camera matrix
    const tempPos = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();
    const sideviewMatrix = new THREE.Matrix4().fromArray(CAMERA_CONFIGS.sideview.matrix);
    sideviewMatrix.decompose(tempPos, tempQuat, tempScale);
    
    transitionRef.current.targetPos.copy(tempPos);
    transitionRef.current.targetQuaternion.copy(tempQuat);
    
    // Store base FOVs (not adaptive ones)
    transitionRef.current.startFov = currentBaseFOVRef.current;
    transitionRef.current.targetFov = CAMERA_CONFIGS.sideview.fov;
    transitionRef.current.startTime = performance.now();
    
    console.log('Starting camera transition back to sideview position');
  }, [camera, isTransitioning, onSectionSelect]);

  // Function to show section details
  const showSectionDetails = useCallback((sectionIndex: number) => {
    setSelectedSection(sectionIndex);
    if (onSectionSelect) {
      onSectionSelect(sectionIndex);
    }
    console.log(`Showing details for section ${sectionIndex}`);
  }, [onSectionSelect]);

  // Initialize events and scripts similar to the original player
  useEffect(() => {
    if (!sceneData || !cameraData || isLoaded) return;

    const loader = new THREE.ObjectLoader();
    
    try {
      // Load scene
      const loadedScene = loader.parse(sceneData);
      scene.clear();
      scene.copy(loadedScene);

      // Apply MeshTransmissionMaterial to objects named "selector" or "selectors"
      scene.traverse((object: THREE.Object3D) => {
        if ('isMesh' in object && object.isMesh && 'name' in object && object.name === 'selectors') {
          console.log('Found selector object, applying MeshTransmissionMaterial:', object.name);

          // Extract and store the geometry for reuse
          if ('geometry' in object && object.geometry && !selectorGeometry) {
            // Clone the geometry to avoid sharing issues
            const clonedGeometry = (object as THREE.Mesh).geometry.clone();
            setSelectorGeometry(clonedGeometry);
            console.log('Extracted selector geometry for reuse');
          }

          // Hide the original object
          if ('visible' in object) {
            object.visible = false;
          }
          console.log('Hidden original selector object');
        }
      });

      // Load camera settings but start with sideview position
      const loadedCamera = loader.parse(cameraData);
      if (camera && loadedCamera) {
        // Copy camera properties from loaded camera
        camera.copy(loadedCamera);
        
        // Apply sideview camera transformation matrix
        const sideviewMatrix = new THREE.Matrix4().fromArray(CAMERA_CONFIGS.sideview.matrix);
        camera.matrix.copy(sideviewMatrix);
        camera.matrix.decompose(camera.position, camera.quaternion, camera.scale);
        
        // Set adaptive FOV based on current aspect ratio
        const canvas = renderer.domElement;
        const currentAspect = canvas.clientWidth / canvas.clientHeight;
        const adaptiveFOV = calculateAdaptiveFOV(CAMERA_CONFIGS.sideview.fov, currentAspect);
        
        // Update the current base FOV tracker
        currentBaseFOVRef.current = CAMERA_CONFIGS.sideview.fov;
        
        (camera as THREE.PerspectiveCamera).fov = adaptiveFOV;
        (camera as THREE.PerspectiveCamera).aspect = currentAspect;
        camera.updateProjectionMatrix();
        
        console.log('Camera initialized to sideview position and rotation:', camera.position, camera.rotation);
      }

      // Process scripts if they exist
      if (scripts) {
        const scriptWrapParams = 'player,renderer,scene,camera';
        const scriptWrapResultObj: Record<string, string> = {};

        for (const eventKey in eventsRef.current) {
          scriptWrapResultObj[eventKey] = eventKey;
        }

        const scriptWrapResult = JSON.stringify(scriptWrapResultObj).replace(/"/g, '');

        for (const uuid in scripts) {
          const object = scene.getObjectByProperty('uuid', uuid);
          
          if (!object) {
            console.warn('ThreePlayer: Script without object.', uuid);
            continue;
          }

          const objectScripts = scripts[uuid];

          // Type guard to ensure objectScripts is an array
          if (!Array.isArray(objectScripts)) {
            console.warn('ThreePlayer: Scripts for object is not an array.', uuid);
            continue;
          }

          for (let i = 0; i < objectScripts.length; i++) {
            const script = objectScripts[i];

            // Type guard to ensure script has source property
            if (!script || typeof script !== 'object' || !('source' in script) || typeof script.source !== 'string') {
              console.warn('ThreePlayer: Invalid script format.', uuid, i);
              continue;
            }

            try {
              // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call -- Script execution is intentional for Three.js scene scripts
              const functions = (new Function(
                scriptWrapParams, 
                script.source + '\nreturn ' + scriptWrapResult + ';'
              ).bind(object as unknown))(null, renderer, scene, camera) as Record<string, (event: unknown) => void>;

              for (const name in functions) {
                const func = functions[name];
                if (func === undefined || typeof func !== 'function') continue;

                if (!(name in eventsRef.current)) {
                  console.warn('ThreePlayer: Event type not supported (', name, ')');
                  continue;
                }

                eventsRef.current[name]?.push(func.bind(object) as (event: unknown) => void);
              }
            } catch (error) {
              console.error('Error processing script:', error);
            }
          }
        }
      }

      setIsLoaded(true);
      
      // Dispatch init events
      dispatch(eventsRef.current.init, []);
      dispatch(eventsRef.current.start, []);
      
      if (onInit) onInit();

    } catch (error) {
      console.error('Error loading scene:', error);
    }
  }, [sceneData, cameraData, scripts, scene, camera, renderer, isLoaded, onInit, selectorGeometry, calculateAdaptiveFOV]);

  // Animation loop with 30 FPS cap
  useFrame((_state) => {
    if (!isLoaded) return;

    const time = performance.now();
    
    // Frame rate limiting to 30 FPS
    const targetFPS = 30;
    const interval = 1000 / targetFPS;
    if (time - timeRef.current.prevTime < interval) {
      return; // Skip this frame
    }
    
    if (timeRef.current.startTime === 0) {
      timeRef.current.startTime = time;
      timeRef.current.prevTime = time;
    }

    // Handle camera transition
    if (transitionRef.current.isTransitioning) {
      const elapsed = time - transitionRef.current.startTime;
      const progress = Math.min(elapsed / transitionRef.current.duration, 1);
      
      // Apply easing function
      const easeProgress = TRANSITION_CONFIG.ease(progress);
      
      if (camera) {
        // Interpolate position
        camera.position.lerpVectors(
          transitionRef.current.startPos,
          transitionRef.current.targetPos,
          easeProgress
        );
        
        // Interpolate rotation using quaternion slerp
        camera.quaternion.slerpQuaternions(
          transitionRef.current.startQuaternion,
          transitionRef.current.targetQuaternion,
          easeProgress
        );
        
        // Interpolate FOV with adaptive calculation
        const canvas = renderer.domElement;
        const currentAspect = canvas.clientWidth / canvas.clientHeight;
        
        // Calculate adaptive FOVs for start and target
        const adaptiveStartFov = calculateAdaptiveFOV(transitionRef.current.startFov, currentAspect);
        const adaptiveTargetFov = calculateAdaptiveFOV(transitionRef.current.targetFov, currentAspect);
        
        const currentFov = THREE.MathUtils.lerp(
          adaptiveStartFov,
          adaptiveTargetFov,
          easeProgress
        );
        
        (camera as THREE.PerspectiveCamera).fov = currentFov;
        (camera as THREE.PerspectiveCamera).aspect = currentAspect;
        camera.updateProjectionMatrix();
      }
      
      if (progress >= 1) {
        transitionRef.current.isTransitioning = false;
        setIsTransitioning(false);
        
        // Update the current base FOV tracker
        currentBaseFOVRef.current = transitionRef.current.targetFov;
        
        // Only enable hover effects when transitioning to intro view, not sideview
        if (transitionRef.current.targetFov === CAMERA_CONFIGS.intro.fov) {
          setIsInIntroView(true);
        }
        console.log('Camera transition completed');
      }
    }

    try {
      dispatch(eventsRef.current.update, {
        time: time - timeRef.current.startTime,
        delta: time - timeRef.current.prevTime
      });
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(error.message ?? error, error.stack ?? '');
    }

    timeRef.current.prevTime = time;

    // Page transition progression
  if (pageTransition.current.stage !== 'idle') {
      const state = pageTransition.current;
      const deltaSec = 1 / 30; // fixed due to fps cap
      state.progress += deltaSec / baseDuration;
      const prevCfg = state.prevPage != null ? panelPages[state.prevPage] : undefined;
      const nextCfg = state.nextPage != null ? panelPages[state.nextPage] : undefined;
  const prevCount = prevCfg?.sections.length ?? 0;
  const nextCount = nextCfg?.sections.length ?? 0;
      const prevSpan = (prevCount - 1) * perItemDelay + 1; // last item's end time relative to base
      const nextSpan = (nextCount - 1) * perItemDelay + 1;
      if (state.stage === 'leaving' && state.progress >= prevSpan) {
        state.stage = 'entering';
        state.progress = 0;
      } else if (state.stage === 'entering' && state.progress >= nextSpan) {
    // Finalize current page
    currentPageRef.current = state.nextPage ?? currentPageRef.current;
    state.stage = 'idle';
    state.prevPage = currentPageRef.current;
    state.nextPage = null;
    state.progress = 0;
    // Immediately start next if queued
    startNextTransition();
      }
      forceRerender(v => v + 1);
    }
  });

  // Event handlers
  useEffect(() => {
    const currentEvents = eventsRef.current;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      dispatch(currentEvents.keydown, event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      dispatch(currentEvents.keyup, event);
    };

    const handlePointerDown = (event: PointerEvent) => {
      dispatch(currentEvents.pointerdown, event);
    };

    const handlePointerUp = (event: PointerEvent) => {
      dispatch(currentEvents.pointerup, event);
    };

    const handlePointerMove = (event: PointerEvent) => {
      dispatch(currentEvents.pointermove, event);
    };

    if (isLoaded) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('pointerup', handlePointerUp);
      document.addEventListener('pointermove', handlePointerMove);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        document.removeEventListener('pointerdown', handlePointerDown);
        document.removeEventListener('pointerup', handlePointerUp);
        document.removeEventListener('pointermove', handlePointerMove);
        
        dispatch(currentEvents.stop, []);
      };
    }
  }, [isLoaded]);

  return (
    <>
      {/* Replace the original selector with a transmission material version */}
      {selectorGeometry && (() => {
        const current = pageTransition.current;
  const baseX = 0.853598594665527;
        const pagesToRender: Array<{page: number; phase: 'static' | 'leaving' | 'entering';}> = [];
        if (current.stage === 'idle') {
          pagesToRender.push({ page: currentPageRef.current, phase: 'static' });
        } else {
          if (current.stage === 'leaving' && current.prevPage != null) pagesToRender.push({ page: current.prevPage, phase: 'leaving' });
          if (current.stage === 'entering' && current.nextPage != null) pagesToRender.push({ page: current.nextPage, phase: 'entering' });
        }
        return pagesToRender.flatMap(({ page, phase }) => {
          const cfg = panelPages[page];
          if (!cfg) return [];
          const spacingMultiplier = cfg.spacingMultiplier ?? 1;
          const xSpacing = 2 * spacingMultiplier;
          const actualCount = cfg.sections.length;
          const half = (actualCount - 1) / 2; // simple symmetric center around baseX
          return cfg.sections.map((section, slot) => {
            const i = section.index;
            // Center this page's items around the virtual 10-wide center
            const xPosition = baseX - (slot - half) * xSpacing;
            let yOffset = -0.09537577629089355;
            if (phase === 'leaving') {
              const localStart = slot * perItemDelay;
              const localT = Math.min(Math.max(current.progress - localStart, 0) / 1, 1);
              const eased = easeOutExpo(localT);
              yOffset -= eased * travelDistance;
            } else if (phase === 'entering') {
              const reverseSlot = (cfg.sections.length - 1) - slot;
              const localStart = reverseSlot * perItemDelay;
              const localT = Math.min(Math.max(current.progress - localStart, 0) / 1, 1);
              const eased = easeOutExpo(localT);
              yOffset -= (travelDistance - eased * travelDistance);
            }
            let clickHandler: (() => void) | undefined;
            if (i === 0) {
              clickHandler = isInIntroView ? transitionToSideviewCamera : transitionToIntroCamera;
            } else if (isInIntroView && selectedSection === null) {
              clickHandler = () => showSectionDetails(i);
            }
            const isHidden = selectedSection !== null && selectedSection !== i;
            const isSelected = selectedSection === i;
            return (
              <SelectorObject
                key={`page-${page}-phase-${phase}-i-${i}`}
                position={[xPosition, yOffset, 1.5677690505981445 + (slot * 0.1)]}
                rotation={randomRotations[i]}
                scale={[2.147387316260944, 2.147387316260944, 2.1473870277404785]}
                geometry={selectorGeometry.clone()}
                onClick={clickHandler}
                enableHover={isInIntroView && selectedSection === null && phase !== 'leaving'}
                sectionIndex={i}
                isSelected={isSelected}
                isHidden={isHidden}
                imageSrc={section.image ?? sectionData.find(s => s.index === i)?.image}
                videoSrc={section.video ?? sectionData.find(s => s.index === i)?.video}
              />
            );
          });
        });
      })()}
    </>
  );
}
