import type * as THREE from "three";

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
}

export interface SelectorObjectProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  geometry?: THREE.BufferGeometry;
  onClick?: () => void;
  enableHover?: boolean;
  sectionIndex?: number;
  isSelected?: boolean;
  isHidden?: boolean;
}

export interface DetailViewProps {
  selectedSection: number | null;
  onClose: () => void;
}
