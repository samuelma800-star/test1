import * as THREE from 'three';

export enum AppState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export enum ItemType {
  NEEDLE = 'NEEDLE',
  GIFT = 'GIFT',
  STOCKING = 'STOCKING',
  ORNAMENT = 'ORNAMENT',
  PARTICLE = 'PARTICLE',
}

// Base interface for position data
export interface PositionData {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

// Interface for a single interactive element
export interface TreeElement {
  id: string;
  type: ItemType;
  
  // Dual Position System
  scatterTransform: PositionData;
  treeTransform: PositionData;
  
  // Appearance
  color: string;
  secondaryColor?: string;
  size: number;
}