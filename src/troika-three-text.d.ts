declare module 'troika-three-text' {
  import * as THREE from 'three';
  import * as React from 'react';

  export interface TextProps {
    text?: string;
    fontSize?: number;
    font?: string;
    anchorX?: string | number;
    anchorY?: string | number;
    maxWidth?: number;
    depthOffset?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number];
    color?: string | number;
    opacity?: number;
    visible?: boolean;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export class Text extends React.Component<TextProps> {}
}