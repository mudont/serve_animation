import { Vector3D, BallState, SimulationParams } from "./types";

// Constants
const GRAVITY = 32.174; // ft/s²
const BALL_MASS = 0.125; // lb (tennis ball)
const BALL_RADIUS = 0.1067; // ft (tennis ball radius)

export class PhysicsEngine {
  private dt = 1 / 120; // 120 FPS simulation

  mphToFtPerSec(mph: number): number {
    return mph * 1.467;
  }

  rpmToRadPerSec(rpm: number): number {
    return (rpm * 2 * Math.PI) / 60;
  }

  calculateDragForce(velocity: Vector3D, params: SimulationParams): Vector3D {
    const speed = Math.sqrt(
      velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2
    );
    if (speed === 0) return { x: 0, y: 0, z: 0 };

    const dragMagnitude =
      0.5 *
      params.airDensity *
      params.dragCoefficient *
      Math.PI *
      BALL_RADIUS ** 2 *
      speed ** 2;

    return {
      x: (-dragMagnitude * velocity.x) / speed / BALL_MASS,
      y: (-dragMagnitude * velocity.y) / speed / BALL_MASS,
      z: (-dragMagnitude * velocity.z) / speed / BALL_MASS,
    };
  }

  calculateMagnusForce(
    velocity: Vector3D,
    spin: Vector3D,
    params: SimulationParams
  ): Vector3D {
    // Magnus force = (4π²r³ρCm/m) * (ω × v)
    const crossProduct = {
      x: spin.y * velocity.z - spin.z * velocity.y,
      y: spin.z * velocity.x - spin.x * velocity.z,
      z: spin.x * velocity.y - spin.y * velocity.x,
    };

    const magnusFactor =
      (4 *
        Math.PI ** 2 *
        BALL_RADIUS ** 3 *
        params.airDensity *
        params.magnusCoefficient) /
      BALL_MASS;

    return {
      x: magnusFactor * crossProduct.x,
      y: magnusFactor * crossProduct.y,
      z: magnusFactor * crossProduct.z,
    };
  }

  step(
    state: BallState,
    params: SimulationParams
  ): {
    newState: BallState;
    bounced: boolean;
    bouncePoint?: Vector3D;
    hitNet: boolean;
    netHitPoint?: Vector3D;
  } {
    const acceleration = { x: 0, y: 0, z: 0 };

    // Gravity
    if (params.enableGravity) {
      acceleration.y -= GRAVITY;
    }

    // Drag
    if (params.enableDrag) {
      const drag = this.calculateDragForce(state.velocity, params);
      acceleration.x += drag.x;
      acceleration.y += drag.y;
      acceleration.z += drag.z;
    }

    // Magnus effect
    if (params.enableMagnus) {
      const magnus = this.calculateMagnusForce(
        state.velocity,
        state.spin,
        params
      );
      acceleration.x += magnus.x;
      acceleration.y += magnus.y;
      acceleration.z += magnus.z;
    }

    // Update velocity
    let newVelocity = {
      x: state.velocity.x + acceleration.x * this.dt,
      y: state.velocity.y + acceleration.y * this.dt,
      z: state.velocity.z + acceleration.z * this.dt,
    };

    // Update position
    let newPosition = {
      x: state.position.x + newVelocity.x * this.dt,
      y: state.position.y + newVelocity.y * this.dt,
      z: state.position.z + newVelocity.z * this.dt,
    };

    let bounced = false;
    let bouncePoint: Vector3D | undefined;
    let hitNet = false;
    let netHitPoint: Vector3D | undefined;

    // Tennis court constants
    const NET_POSITION_X = 39; // Net is at center of 78ft court
    const NET_HEIGHT = 3; // 3 feet high
    const COURT_WIDTH = 27; // Singles court width

    // Check for net collision
    if (
      state.position.x < NET_POSITION_X &&
      newPosition.x >= NET_POSITION_X &&
      newPosition.y <= NET_HEIGHT &&
      Math.abs(newPosition.z) <= COURT_WIDTH / 2
    ) {
      hitNet = true;
      // Calculate exact intersection point with net
      const t =
        (NET_POSITION_X - state.position.x) /
        (newPosition.x - state.position.x);
      netHitPoint = {
        x: NET_POSITION_X,
        y: state.position.y + t * (newPosition.y - state.position.y),
        z: state.position.z + t * (newPosition.z - state.position.z),
      };

      return {
        newState: {
          position: netHitPoint,
          velocity: { x: 0, y: 0, z: 0 }, // Ball stops at net
          spin: state.spin,
          time: state.time + this.dt,
          hasServed: state.hasServed,
        },
        bounced: false,
        bouncePoint: undefined,
        hitNet: true,
        netHitPoint,
      };
    }

    // Check for ground collision (bounce)
    if (newPosition.y <= 0 && state.velocity.y < 0) {
      bounced = true;
      bouncePoint = { x: newPosition.x, y: 0, z: newPosition.z };

      // Bounce physics
      const restitution = 0.7; // Energy loss on bounce
      const friction = 0.3; // Friction coefficient

      newPosition.y = 0;
      newVelocity.y = -newVelocity.y * restitution;
      newVelocity.x *= 1 - friction;
      newVelocity.z *= 1 - friction;

      // Spin changes on bounce
      const newSpin = {
        x: state.spin.x * 0.8,
        y: state.spin.y * 0.8,
        z: state.spin.z * 0.8,
      };

      return {
        newState: {
          position: newPosition,
          velocity: newVelocity,
          spin: newSpin,
          time: state.time + this.dt,
          hasServed: state.hasServed,
        },
        bounced,
        bouncePoint,
        hitNet: false,
        netHitPoint: undefined,
      };
    }

    return {
      newState: {
        position: newPosition,
        velocity: newVelocity,
        spin: state.spin,
        time: state.time + this.dt,
        hasServed: state.hasServed,
      },
      bounced,
      bouncePoint,
      hitNet: false,
      netHitPoint: undefined,
    };
  }

  createInitialState(params: SimulationParams): BallState {
    const velocityMagnitude = this.mphToFtPerSec(params.initialVelocity);
    // Convert angles to radians
    const directionRad = (params.initialDirection * Math.PI) / 180;
    const verticalAngleRad = (params.initialVerticalAngle * Math.PI) / 180;
    const spinRad = this.rpmToRadPerSec(params.topspinRpm);
    const spinPlaneRad = (params.topspinPlane * Math.PI) / 180;

    // Calculate velocity components with vertical angle
    const horizontalVelocity = velocityMagnitude * Math.cos(verticalAngleRad);
    const vx = horizontalVelocity * Math.cos(directionRad);
    const vy = velocityMagnitude * Math.sin(verticalAngleRad);
    const vz = -horizontalVelocity * Math.sin(directionRad);

    return {
      // Start 3 ft to the right of center baseline (z = 3)
      position: { x: 0, y: params.serverHeight, z: 3 },
      velocity: {
        x: vx, // Forward velocity (across court)
        y: vy, // Vertical velocity (up/down)
        z: vz, // Lateral velocity (left/right)
      },
      spin: {
        x: spinRad * Math.cos(spinPlaneRad),
        y: 0,
        z: spinRad * Math.sin(spinPlaneRad),
      },
      time: 0,
      hasServed: false,
    };
  }

  // Create serving motion state (before ball is hit)
  createServingState(params: SimulationParams, serveTime: number): BallState {
    // Ball follows racquet during serve motion (first 0.3 seconds)
    const serveProgress = Math.min(serveTime / 0.3, 1);
    const height = params.serverHeight + Math.sin(serveProgress * Math.PI) * 2; // Arc motion

    return {
      position: { x: -1 + serveProgress, y: height, z: 3 },
      velocity: { x: 0, y: 0, z: 0 },
      spin: { x: 0, y: 0, z: 0 },
      time: serveTime,
      hasServed: serveProgress >= 1,
    };
  }
}
