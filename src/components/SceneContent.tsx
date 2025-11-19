"use client";

import { extend, useFrame, useThree } from "@react-three/fiber";
import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from 'three';
import { Text } from 'troika-three-text'
import { sectionData, panelPages } from './sectionData';
import SelectorObject from "./SelectorObject";
import { dispatch, CAMERA_CONFIGS, TRANSITION_CONFIG, FOVController, CameraTransitionController } from "./utils";
import type { SceneContentProps } from "./types";

extend({ Text });

// Wrapper component to use lowercase 'text'
const TextWrapper = (props: any) => <Text {...props} />;

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
const text =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

// Component to handle the 3D scene content
export default function SceneContent({ 
  sceneData, 
  cameraData, 
  scripts, 
  onInit, 
  onSectionSelect, 
  selectedSection: parentSelectedSection,
  pageIndex,
  isMobile,
  sliderSelectedSection,
  onSliderSelect,
  onTransitionChange,
  fovController,
  isExperienceStarted,
  setIsExperienceStarted,
  onHover
}: SceneContentProps) {
  const { scene, camera, gl: renderer } = useThree();
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectorGeometry, setSelectorGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [isInIntroView, setIsInIntroView] = useState(false);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [, forceRerender] = useState(0);
  const transitionController = useRef(new CameraTransitionController());
  const [transitionState, setTransitionState] = useState(false); // For triggering re-renders
  const geometryPoolRef = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  // Compute isTransitioning from the transition controller
  const isTransitioning = transitionController.current.isCurrentlyTransitioning() || transitionState;
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

  // Get geometry from pool or create new clone
  const getGeometryForSelector = useCallback((key: string): THREE.BufferGeometry | undefined => {
    if (geometryPoolRef.current.has(key)) {
      return geometryPoolRef.current.get(key);
    }
    if (selectorGeometry) {
      const cloned = selectorGeometry.clone();
      geometryPoolRef.current.set(key, cloned);
      return cloned;
    }
    return undefined;
  }, [selectorGeometry]);

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
      // Clear the queue and load the last requested category immediately
      pageQueueRef.current = [];
      lastRequestedRef.current = pageIndex;
      
      // If currently transitioning, interrupt and start new transition
      if (pageTransition.current.stage !== 'idle') {
        // Reset transition state
        pageTransition.current = { stage: 'idle', prevPage: currentPageRef.current, nextPage: null, progress: 0 };
      }
      
      // Start transition to the new page immediately
      if (pageIndex !== currentPageRef.current) {
        pageTransition.current = { stage: 'leaving', prevPage: currentPageRef.current, nextPage: pageIndex, progress: 0 };
      }
    }
  }, [pageIndex]);

  // Cleanup geometry pool when selectorGeometry changes
  useEffect(() => {
    return () => {
      geometryPoolRef.current.forEach((geometry) => {
        geometry.dispose();
      });
      geometryPoolRef.current.clear();
    };
  }, [selectorGeometry]);

  // Initialize transition controller
  useEffect(() => {
    if (camera && fovController) {
      transitionController.current.setCamera(camera as THREE.PerspectiveCamera);
      transitionController.current.setFOVController(fovController);
    }
  }, [camera, fovController]);

  // Camera follow for selected section (now default behavior)
  useEffect(() => {
    if (sliderSelectedSection == null || !selectorGeometry || !camera) return;

    // If already transitioning, stop it immediately at current position
    if (isTransitioning) {
      transitionController.current.stopTransitionAtCurrent();
    }

    // Only look in the current page for the selected section
    const pageCfg = panelPages[pageIndex];
    if (!pageCfg || !pageCfg.sections) return;

    const foundSlot = pageCfg.sections.findIndex(s => s.index === sliderSelectedSection);
    if (foundSlot < 0) return;

    const cfg = pageCfg;
    const spacingMultiplier = cfg.spacingMultiplier ?? 1;
    const xSpacing = 2 * spacingMultiplier;
    const actualCount = cfg.sections.length;
    const half = (actualCount - 1) / 2;
    const baseX = 0.853598594665527;
    const xPosition = baseX - (foundSlot - half) * xSpacing;
    const yOffset = -0.09537577629089355;
    const zPos = 1.5677690505981445 + (foundSlot * 0.1);

    const selectorPos = new THREE.Vector3(xPosition, yOffset, zPos);

    // Desired camera target: closer and slightly above the selector on mobile
    const camOffset = new THREE.Vector3(0, 0.8, 9.5);
    const targetPos = selectorPos.clone().add(camOffset);

    // Compute quaternion that looks at the selector position
    const tempCam = new THREE.PerspectiveCamera();
    tempCam.position.copy(targetPos);
    tempCam.lookAt(selectorPos);
    tempCam.updateMatrixWorld();

    const targetBaseFOV = isMobile ? 80 : 80; // Base FOV values, FOV controller handles aspect ratio adaptation

    const success = transitionController.current.startTransition(
      targetPos,
      tempCam.quaternion,
      targetBaseFOV,
      () => {
        setTransitionState(false);
        fovController?.setBaseFOV(targetBaseFOV);
        onTransitionChange?.(false);
        console.log('Camera follow transition completed');
      }
    );

    if (success) {
      setTransitionState(true);
      onTransitionChange?.(true);
      console.log('Starting camera follow transition');
    }
  }, [isMobile, sliderSelectedSection, selectorGeometry, camera, fovController, onTransitionChange, isTransitioning, pageIndex]);  // Pre-generate random rotations once (skip first object)
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

  // Function to smoothly transition camera
  const transitionToIntroCamera = useCallback(() => {
    if (!camera) return;

    // If already transitioning, complete it immediately
    if (isTransitioning) {
      transitionController.current.completeTransition();
    }

    // Extract target position and rotation from intro camera matrix
    const tempPos = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();
    const introMatrix = new THREE.Matrix4().fromArray(CAMERA_CONFIGS.intro.matrix);
    introMatrix.decompose(tempPos, tempQuat, tempScale);

    const success = transitionController.current.startTransition(
      tempPos,
      tempQuat,
      CAMERA_CONFIGS.intro.fov, // Base FOV, FOV controller handles adaptation
      () => {
        setTransitionState(false);
        setIsInIntroView(true);
        fovController?.setBaseFOV(CAMERA_CONFIGS.intro.fov);
        onTransitionChange?.(false);
        console.log('Camera transition to intro completed');
      }
    );

    if (success) {
      setTransitionState(true);
      onTransitionChange?.(true);
      console.log('Starting camera transition to intro position');
    }
  }, [camera, isTransitioning, fovController, onTransitionChange]);

  // Function to transition back to sideview
  const transitionToSideviewCamera = useCallback(() => {
    if (!camera) return;

    // If already transitioning, complete it immediately
    if (isTransitioning) {
      transitionController.current.completeTransition();
    }

    setIsInIntroView(false);
    setSelectedSection(null);
    if (onSectionSelect) {
      onSectionSelect(null);
    }

    // When transitioning back to start view, reset slider
    if (onSliderSelect) {
      onSliderSelect(null);
    }

    // Extract target position and rotation from sideview camera matrix
    const tempPos = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    const tempScale = new THREE.Vector3();
    const sideviewMatrix = new THREE.Matrix4().fromArray(CAMERA_CONFIGS.sideview.matrix);
    sideviewMatrix.decompose(tempPos, tempQuat, tempScale);

    const success = transitionController.current.startTransition(
      tempPos,
      tempQuat,
      CAMERA_CONFIGS.sideview.fov, // Base FOV, FOV controller handles adaptation
      () => {
        setTransitionState(false);
        fovController?.setBaseFOV(CAMERA_CONFIGS.sideview.fov);
        onTransitionChange?.(false);
        console.log('Camera transition to sideview completed');
      }
    );

    if (success) {
      setTransitionState(true);
      onTransitionChange?.(true);
      console.log('Starting camera transition back to sideview position');
    }
  }, [camera, isTransitioning, onSectionSelect, onSliderSelect, pageIndex, fovController, onTransitionChange]);

  // Function to show section details
  const showSectionDetails = useCallback((sectionIndex: number) => {
    console.log(`showSectionDetails called with sectionIndex: ${sectionIndex}`);
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
        
        // Update the FOV controller with initial base FOV
        fovController?.setBaseFOV(CAMERA_CONFIGS.sideview.fov);
        
        const canvas = renderer.domElement;
        const currentAspect = canvas.clientWidth / canvas.clientHeight;
        fovController?.setAspect(currentAspect);
        fovController?.applyToCamera(camera);
        
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
  }, [sceneData, cameraData, scripts, scene, camera, renderer, isLoaded, onInit, selectorGeometry, fovController]);

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
    const transitionCompleted = transitionController.current.update();
    if (transitionCompleted) {
      // Transition just completed
      setTransitionState(false);
      onTransitionChange?.(false);
      console.log('Camera transition completed');
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
          const firstSlot = 0;
          const firstXPosition = baseX - (firstSlot - half) * xSpacing;
          let yOffset = -3.5;
          if (phase === 'leaving') {
            const localStart = firstSlot * perItemDelay;
            const localT = Math.min(Math.max(current.progress - localStart, 0) / 1, 1);
            const eased = easeOutExpo(localT);
            yOffset -= eased * travelDistance;
          } else if (phase === 'entering') {
            const reverseSlot = (cfg.sections.length - 1) - firstSlot;
            const localStart = reverseSlot * perItemDelay;
            const localT = Math.min(Math.max(current.progress - localStart, 0) / 1, 1);
            const eased = easeOutExpo(localT);
            yOffset -= (travelDistance - eased * travelDistance);
          }
          const textProps = {
            key: `text-${page}`,
            text: cfg.label,
            fontSize: 2,                 // roughly comparable to size in Text3D
            font: "./Montserrat-Bold.ttf", // path to font file
            anchorX: "center",             // optional; aligns horizontally
            anchorY: "middle",             // optional; aligns vertically
            maxWidth: Infinity,          // optional; control wrapping
            depthOffset: 0,              // optional; for z-fighting control
            position: [firstXPosition, yOffset, 1.5677690505981445 - 3] as [number, number, number]
          };
          const textElement = (
            <text {...(textProps as any)} />
          );
          const selectors = cfg.sections.map((section, slot) => {
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
            let clickHandler: ((sectionInfo?: any) => void) | undefined;
            if (i === 0) {
              clickHandler = () => {
                if (isInIntroView) {
                  // End experience: hide slider and return to start
                  setIsExperienceStarted?.(false);
                  transitionToSideviewCamera();
                } else {
                  // Start experience: show slider and go to first element
                  setIsExperienceStarted?.(true);
                  transitionToIntroCamera();
                  // Set slider to first content section to trigger animation
                  const pageCfg = panelPages[pageIndex];
                  const firstContentSection = pageCfg?.sections?.find(s => s.index !== 0);
                  onSliderSelect?.(firstContentSection?.index ?? null);
                }
              };
            } else {
              clickHandler = (sectionInfo) => showSectionDetails(i);
            }
            const isHidden = false;
            const isSelected = selectedSection === i;
            const forceHovered = sliderSelectedSection === i;
            return (
              <SelectorObject
                key={`page-${page}-i-${i}`}
                position={[xPosition, yOffset, 1.5677690505981445 + (slot * 0.1)]}
                rotation={randomRotations[i]}
                scale={[2.147387316260944, 2.147387316260944, 2.1473870277404785]}
                geometry={getGeometryForSelector(`page-${page}-i-${i}`)}
                onClick={clickHandler}
                enableHover={true}
                sectionIndex={i}
                isSelected={isSelected}
                isHidden={isHidden}
                imageSrc={section.image ?? sectionData.find(s => s.index === i)?.image}
                videoSrc={section.video}
                forceHovered={forceHovered}
                onHover={onHover}
              />
            );
          });
          return [
            textElement,
            ...selectors
          ];
        });
      })()}
    </>
  );
}
