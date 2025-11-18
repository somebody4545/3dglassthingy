import type * as THREE from "three";
import { FOVController } from "./utils";

export interface ProjectData {
  metadata?: {
    type: string;
  };
  project?: {
    shadows?: boolean;
    shadowType?: THREE.ShadowMapType;
    toneMapping?: THREE.ToneMapping;
    toneMappingExposure?: number;
  };
  camera?: CameraData;
  scene?: SceneData;
  scripts?: ScriptData;
  environment?: EnvironmentData;
}

export interface CameraData {
  position?: [number, number, number];
  rotation?: [number, number, number];
  fov?: number;
  matrix?: number[];
  object?: {
    fov?: number;
    near?: number;
    far?: number;
    matrix?: number[];
    position?: [number, number, number];
    rotation?: [number, number, number];
  };
}

export interface SceneData {
  background?: string | number;
  fog?: {
    color?: string | number;
    near?: number;
    far?: number;
  };
  children?: unknown[];
}

export interface ScriptItem {
  source: string;
  [key: string]: unknown;
}

export type ScriptData = Record<string, ScriptItem[]>;

export type EnvironmentData = Record<string, unknown>;

export interface PlayerProps {
  width?: number;
  height?: number;
  projectData?: ProjectData | null;
}

export interface SceneContentProps {
  sceneData?: SceneData;
  cameraData?: CameraData;
  scripts?: ScriptData;
  onInit?: () => void;
  onSectionSelect?: (section: number | null) => void;
  selectedSection?: number | null;
  pageIndex: number; // current panel page
  isMobile?: boolean;
  sliderSelectedSection?: number | null; // for mobile slider
  onSliderSelect?: (section: number | null) => void; // callback to set slider selection
  onTransitionChange?: (isTransitioning: boolean) => void;
  fovController?: FOVController;
  isExperienceStarted?: boolean;
  setIsExperienceStarted?: (started: boolean) => void;
}

export interface SelectorObjectProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  geometry?: THREE.BufferGeometry;
  onClick?: (sectionInfo?: SectionInfo) => void;
  enableHover?: boolean;
  sectionIndex?: number;
  isSelected?: boolean;
  isHidden?: boolean;
  imageSrc?: string; // static image texture path
  videoSrc?: string; // video texture path for hover
  forceHovered?: boolean; // force hovered state for mobile slider
}

export interface DetailViewProps {
  selectedSection: number | null;
  onClose: () => void;
}

export interface SectionInfo {
  index: number;
  title: string;
  description: string;
  image?: string;
  video?: string;
}

export interface PanelPageConfig {
  sections: SectionInfo[]; // pasted section objects for this page (placeholders allowed)
  spacingMultiplier?: number;
  id?: string;
  label?: string;
  description?: string;
}
