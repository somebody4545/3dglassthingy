import * as THREE from "three";

export interface PlayerProps {
  width?: number;
  height?: number;
  projectData?: any;
}

export interface SceneContentProps {
  sceneData?: any;
  cameraData?: any;
  scripts?: any;
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
