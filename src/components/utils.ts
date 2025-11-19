// Helper function to dispatch events
import * as THREE from 'three';

export function dispatch(array: Array<(event: unknown) => void>, event: unknown) {
  for (let i = 0, l = array.length; i < l; i++) {
    const fn = array[i];
    if (fn) {
      fn(event);
    }
  }
}

// Camera configuration constants
export const CAMERA_CONFIGS = {
  sideview: {
    position: { x: 19.178403854370117, y: -0.23591174185276031, z: 1.6092607975006104 },
    matrix: [
      -0.0069840684784670225, 0.0000018543924965897307, -0.9999756636490419, 0,
      0.013963832155882514, 0.9999024963707595, -0.00009567247655881668, 0,
      0.9998781622101486, -0.01396416051014617, -0.00698341340083375, 0,
      19.178403854370117, -0.23591174185276031, 1.6092607975006104, 1
    ],
    fov: 32.26880414280885
  },
  intro: {
    position: { x: 14.86, y: 1.036, z: 20.462 },
    matrix: [
      0.8171439616690617, -0.024134028473317245, -0.5759282026237645, 0,
      0.04422503559001073, 0.9988030904518558, 0.020893365714606437, 0,
      0.5747346275759391, -0.04254333289096095, 0.8172332425272945, 0,
      14.86, 1.036, 20.462, 1
    ],
    fov: 33.43
  }
};

// Transition configuration
export const TRANSITION_CONFIG = {
  duration: 2000, // 2 seconds
  ease: (t: number) => 1 - Math.pow(1 - t, 3) // ease out cubic
};

// FOV Controller class to manage camera FOV calculations and updates
export class FOVController {
  private baseFOV: number;
  private baseAspect: number = 9/16; // Base aspect ratio (16:9)
  private currentAspect: number = 16 / 9;

  constructor(initialBaseFOV: number = 32.26880414280885) {
    this.baseFOV = initialBaseFOV;
  }

  // Set the base FOV (the FOV that would be used at 16:9 aspect ratio)
  setBaseFOV(baseFOV: number): void {
    this.baseFOV = baseFOV;
  }

  // Get the current base FOV
  getBaseFOV(): number {
    return this.baseFOV;
  }

  // Update the current aspect ratio
  setAspect(aspect: number): void {
    this.currentAspect = aspect;
  }

  // Calculate the adaptive FOV for the current aspect ratio
  calculateAdaptiveFOV(baseFOV?: number): number {
    const fov = baseFOV ?? this.baseFOV;
    
    // Calculate what the horizontal FOV would be at the base aspect ratio
    const baseVerticalFOV = fov;
    const baseHorizontalFOV = 2 * Math.atan(Math.tan((baseVerticalFOV * Math.PI) / 360) * this.baseAspect) * (180 / Math.PI);
    
    // Calculate what vertical FOV we need to maintain the base horizontal FOV at current aspect
    const requiredVerticalFOVForHorizontal = 2 * Math.atan(Math.tan((baseHorizontalFOV * Math.PI) / 360) / this.currentAspect) * (180 / Math.PI);
    console.log('Adaptive FOV Calculation:', {
      baseFOV: fov,
      currentAspect: this.currentAspect,
      baseHorizontalFOV,
      requiredVerticalFOVForHorizontal
    });
    // Use the larger of the two FOVs to ensure both dimensions meet their minimum
    return Math.max(baseVerticalFOV, requiredVerticalFOVForHorizontal);
  }

  // Apply the adaptive FOV to a camera
  applyToCamera(camera: THREE.Camera, baseFOV?: number): void {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = this.calculateAdaptiveFOV(baseFOV);
      camera.aspect = this.currentAspect;
      camera.updateProjectionMatrix();
    }
  }

  // Apply the current base FOV (adapted for current aspect ratio) to camera
  applyCurrentBaseFOVToCamera(camera: THREE.Camera): void {
    this.applyToCamera(camera, this.baseFOV);
  }

  // Get the current adaptive FOV without applying it
  getCurrentAdaptiveFOV(baseFOV?: number): number {
    return this.calculateAdaptiveFOV(baseFOV);
  }
}

// Camera Transition Controller
export class CameraTransitionController {
  private camera: THREE.PerspectiveCamera | null = null;
  private fovController: FOVController | null = null;
  private isTransitioning: boolean = false;
  private startPos: THREE.Vector3 = new THREE.Vector3();
  private targetPos: THREE.Vector3 = new THREE.Vector3();
  private startQuaternion: THREE.Quaternion = new THREE.Quaternion();
  private targetQuaternion: THREE.Quaternion = new THREE.Quaternion();
  private startBaseFOV: number = 0;
  private targetBaseFOV: number = 0;
  private startTime: number = 0;
  private duration: number = TRANSITION_CONFIG.duration;
  private onComplete?: () => void;

  setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
  }

  setFOVController(fovController: FOVController): void {
    this.fovController = fovController;
  }

  isCurrentlyTransitioning(): boolean {
    return this.isTransitioning;
  }

  startTransition(
    targetPos: THREE.Vector3,
    targetQuaternion: THREE.Quaternion,
    targetBaseFOV: number,
    onComplete?: () => void
  ): boolean {
    if (!this.camera || !this.fovController) {
      return false;
    }

    // If already transitioning, stop at current position
    if (this.isTransitioning) {
      this.stopTransitionAtCurrent();
    }

    this.isTransitioning = true;
    this.startPos.copy(this.camera.position);
    this.startQuaternion.copy(this.camera.quaternion);
    this.targetPos.copy(targetPos);
    this.targetQuaternion.copy(targetQuaternion);
    this.startBaseFOV = this.fovController.getBaseFOV();
    this.targetBaseFOV = targetBaseFOV;
    this.startTime = performance.now();
    this.onComplete = onComplete;

    return true;
  }

  update(): boolean {
    if (!this.camera || !this.fovController || !this.isTransitioning) {
      return false;
    }

    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const easeProgress = TRANSITION_CONFIG.ease(progress);

    // Interpolate position
    this.camera.position.lerpVectors(this.startPos, this.targetPos, easeProgress);

    // Interpolate rotation
    this.camera.quaternion.slerpQuaternions(this.startQuaternion, this.targetQuaternion, easeProgress);

    // Interpolate base FOV and apply adaptive FOV
    const currentBaseFOV = THREE.MathUtils.lerp(this.startBaseFOV, this.targetBaseFOV, easeProgress);
    this.fovController.setBaseFOV(currentBaseFOV);
    this.fovController.applyCurrentBaseFOVToCamera(this.camera);

    if (progress >= 1) {
      this.isTransitioning = false;
      this.onComplete?.();
      return true; // Transition completed
    }

    return false; // Still transitioning
  }

  // Force immediate completion of current transition
  completeTransition(): void {
    if (!this.camera || !this.fovController || !this.isTransitioning) {
      return;
    }

    this.camera.position.copy(this.targetPos);
    this.camera.quaternion.copy(this.targetQuaternion);
    
    this.fovController.setBaseFOV(this.targetBaseFOV);
    this.fovController.applyCurrentBaseFOVToCamera(this.camera);

    this.isTransitioning = false;
    this.onComplete?.();
  }

  // Stop transition at current interpolated position (don't jump to target)
  stopTransitionAtCurrent(): void {
    if (!this.camera || !this.isTransitioning) {
      return;
    }

    // Camera is already at the current interpolated position from the last update() call
    // Just mark as not transitioning and call completion callback
    this.isTransitioning = false;
    this.onComplete?.();
  }
}
