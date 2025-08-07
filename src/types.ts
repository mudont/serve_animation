export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface SimulationParams {
  serverHeight: number; // feet
  initialVelocity: number; // mph
  topspinRpm: number;
  topspinPlane: number; // degrees
  initialDirection: number; // degrees
  initialVerticalAngle: number; // degrees (positive = up, negative = down)
  animationSpeed: number; // 0.01x to 1x
  airDensity: number; // lb/ft³
  dragCoefficient: number; // dimensionless
  magnusCoefficient: number; // dimensionless
  enableGravity: boolean;
  enableDrag: boolean;
  enableMagnus: boolean;
}

export interface BallState {
  position: Vector3D;
  velocity: Vector3D;
  spin: Vector3D;
  time: number;
  hasServed: boolean;
}

export interface BouncePoint {
  position: Vector3D;
  time: number;
}

export interface NetHit {
  position: Vector3D;
  time: number;
}