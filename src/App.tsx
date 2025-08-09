import React, { useState, useEffect, useRef } from "react";
import {
  SimulationParams,
  BallState,
  BouncePoint,
  NetHit,
  Vector3D,
} from "./types";
import { PhysicsEngine } from "./physics";
import { ControlPanel } from "./components/ControlPanel";
import { TennisCourtSVG } from "./components/TennisCourtSVG";
import { TennisCourt3D } from "./components/TennisCourt3D";

const App: React.FC = () => {
  // Helper function to calculate contact height from player height
  const calculateContactHeight = (playerHeight: number): number => {
    // Contact height is typically 1.42 times player height (based on 6ft -> 8.5ft)
    return playerHeight * 1.42;
  };

  const [params, setParamsInternal] = useState<SimulationParams>({
    playerHeight: 6.0, // Default 6ft player
    serverHeight: calculateContactHeight(6.0), // 8.5ft contact height
    initialVelocity: 90,
    topspinRpm: -2000,
    topspinPlane: 30,
    initialDirection: 0,
    initialVerticalAngle: -3,
    animationSpeed: 0.5,
    airDensity: 0.0765, // lb/ft³ at sea level
    dragCoefficient: 0.47, // sphere
    magnusCoefficient: 0.1,
    enableGravity: true,
    enableDrag: true,
    enableMagnus: true,
  });

  const [ballState, setBallState] = useState<BallState | null>(null);
  const [ballTrail, setBallTrail] = useState<
    Array<{ x: number; y: number; z: number }>
  >([]);
  const [bouncePoints, setBouncePoints] = useState<BouncePoint[]>([]);
  const [netHit, setNetHit] = useState<NetHit | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isServing, setIsServing] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<
    Array<{
      ballState: BallState;
      ballTrail: Vector3D[];
      bouncePoints: BouncePoint[];
      netHit: NetHit | null;
      isServing: boolean;
    }>
  >([]);

  // Custom setParams function that automatically calculates contact height
  const setParams = (newParams: SimulationParams) => {
    // If playerHeight changed, recalculate serverHeight
    if (newParams.playerHeight !== params.playerHeight) {
      newParams.serverHeight = calculateContactHeight(newParams.playerHeight);
    }
    setParamsInternal(newParams);
  };

  const physicsEngine = useRef(new PhysicsEngine());
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const courtWidth = 100; // feet (extended for visualization)
  const courtHeight = 100; // feet

  const startSimulation = () => {
    // Start with serving motion
    const servingState = physicsEngine.current.createServingState(params, 0);
    setBallState(servingState);
    setBallTrail([]); // Start with empty trail - will begin after racquet contact
    setBouncePoints([]);
    setNetHit(null);
    setIsRunning(true);
    setIsServing(true);
    lastTimeRef.current = performance.now();
  };

  const stopSimulation = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const resetSimulation = () => {
    stopSimulation();
    setBallState(null);
    setBallTrail([]);
    setBouncePoints([]);
    setNetHit(null);
    setIsServing(false);
    setSimulationHistory([]);
  };

  const stepForward = () => {
    if (isRunning) return;

    if (ballState) {
      // Save current state to history
      const currentSnapshot = {
        ballState,
        ballTrail: [...ballTrail],
        bouncePoints: [...bouncePoints],
        netHit,
        isServing,
      };
      setSimulationHistory((prev) => [...prev, currentSnapshot]);

      // Step forward by 0.01 seconds (multiple physics steps)
      let newState = ballState;
      let newTrail = [...ballTrail];
      let newBounces = [...bouncePoints];
      let newNetHit = netHit;
      let newIsServing = isServing;

      const stepsPerFrame = Math.ceil(0.01 / (1 / 120)); // 0.01 sec at 120 FPS

      for (let i = 0; i < stepsPerFrame; i++) {
        if (newIsServing && !newState.hasServed) {
          newState = physicsEngine.current.createServingState(
            params,
            newState.time + 1 / 120
          );
          if (newState.hasServed) {
            newState = physicsEngine.current.createInitialState(params);
            newState.time = ballState.time + (i + 1) / 120;
            newIsServing = false;
            // Start trail from contact point
            newTrail = [newState.position];
          }
          // Don't add to trail during serving motion
        } else {
          const result = physicsEngine.current.step(newState, params);
          newState = result.newState;

          if (result.hitNet && result.netHitPoint) {
            newNetHit = { position: result.netHitPoint, time: newState.time };
            break;
          }

          if (result.bounced && result.bouncePoint) {
            newBounces = [
              ...newBounces,
              { position: result.bouncePoint, time: newState.time },
            ];
          }

          if (newState.position.x >= 103) break;
          
          // Only add to trail after serve is complete
          newTrail = [...newTrail, newState.position];
        }
      }

      setBallState(newState);
      setBallTrail(newTrail);
      setBouncePoints(newBounces);
      setNetHit(newNetHit);
      setIsServing(newIsServing);
    }
  };

  const stepBackward = () => {
    if (isRunning || simulationHistory.length === 0) return;

    const previousState = simulationHistory[simulationHistory.length - 1];
    setBallState(previousState.ballState);
    setBallTrail(previousState.ballTrail);
    setBouncePoints(previousState.bouncePoints);
    setNetHit(previousState.netHit);
    setIsServing(previousState.isServing);
    setSimulationHistory((prev) => prev.slice(0, -1));
  };

  useEffect(() => {
    if (!isRunning || !ballState) return;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      const targetFrameTime = 16.67 / params.animationSpeed; // 60 FPS adjusted for speed

      if (deltaTime >= targetFrameTime) {
        let newState: BallState;

        if (isServing && !ballState.hasServed) {
          // Continue serving motion
          newState = physicsEngine.current.createServingState(
            params,
            ballState.time + 1 / 60
          );
          if (newState.hasServed) {
            // Switch to actual ball physics after serve
            newState = physicsEngine.current.createInitialState(params);
            newState.time = ballState.time;
            setIsServing(false);
            // Start the ball trail from the contact point
            setBallState(newState);
            setBallTrail([newState.position]);
          } else {
            // During serving motion, don't add to trail
            setBallState(newState);
          }
        } else {
          // Normal physics simulation
          const result = physicsEngine.current.step(ballState, params);
          newState = result.newState;

          // Handle net hits
          if (result.hitNet && result.netHitPoint) {
            setNetHit({
              position: result.netHitPoint,
              time: newState.time,
            });
            stopSimulation();
            return;
          }

          // Handle bounces
          if (result.bounced && result.bouncePoint) {
            setBouncePoints((prev) => [
              ...prev,
              {
                position: result.bouncePoint!,
                time: newState.time,
              },
            ]);
          }

          // Check if ball has traveled 25 ft past opposing baseline (78 ft + 25 ft = 103 ft)
          if (newState.position.x >= 103) {
            stopSimulation();
            return;
          }

          setBallState(newState);
          setBallTrail((prev) => [...prev, newState.position]);
        }

        lastTimeRef.current = currentTime;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, ballState, params.animationSpeed]);

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      <div className="flex gap-4 h-screen">
        {/* Control Panel - Fixed Width */}
        <div className="w-80 flex-shrink-0 max-h-screen overflow-y-auto">
          <ControlPanel
            params={params}
            onParamsChange={setParams}
            onStart={startSimulation}
            onStop={stopSimulation}
            onReset={resetSimulation}
            onStepForward={stepForward}
            onStepBackward={stepBackward}
            isRunning={isRunning}
            isPaused={!isRunning && ballState !== null}
          />

          {/* Stats Display */}
          {ballState && (
            <div className="mt-4 bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold mb-2">Ball Stats</h3>
              <div className="text-sm space-y-1">
                <div>Time: {ballState.time.toFixed(2)}s</div>
                <div>Height: {ballState.position.y.toFixed(1)} ft</div>
                <div>Distance: {ballState.position.x.toFixed(1)} ft</div>
                <div>
                  Speed:{" "}
                  {(
                    (Math.sqrt(
                      ballState.velocity.x ** 2 +
                        ballState.velocity.y ** 2 +
                        ballState.velocity.z ** 2
                    ) *
                      3600) /
                    5280
                  ).toFixed(1)}{" "}
                  mph
                </div>
                <div>
                  Status:{" "}
                  {netHit
                    ? "Hit Net!"
                    : isServing
                      ? "Serving..."
                      : "Ball in flight"}
                </div>
                <div>Bounces: {bouncePoints.length}</div>
                {netHit && (
                  <div className="text-red-600 font-bold">
                    Net Hit at {netHit.time.toFixed(2)}s
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Tennis Court Visualizations - Takes remaining space */}
        <div className="flex-1 flex flex-col space-y-2 min-h-0 min-w-0">
          {/* 3D Isometric View */}
          <div className="bg-white p-2 rounded-lg shadow-lg flex-1 min-h-0">
            <h3 className="font-bold mb-2 text-sm">
              Tennis Court (3D Isometric View)
            </h3>
            <div className="w-full h-full min-h-0">
              <TennisCourt3D
                ballPosition={
                  ballState?.position || { x: 0, y: params.serverHeight, z: 3 }
                }
                ballTrail={ballTrail}
                bouncePoints={bouncePoints}
                netHit={netHit}
                serveProgress={
                  isServing ? Math.min(ballState?.time || 0, 0.3) / 0.3 : 0
                }
                isServing={isServing}
                params={params}
              />
            </div>
          </div>

          {/* Bird's Eye View */}
          <div className="bg-white p-2 rounded-lg shadow-lg flex-1 min-h-0">
            <h3 className="font-bold mb-2 text-sm">
              Tennis Court (Bird's Eye View)
            </h3>
            <div className="w-full h-full min-h-0">
              <TennisCourtSVG
                ballPosition={
                  ballState?.position || { x: 0, y: params.serverHeight, z: 3 }
                }
                ballTrail={ballTrail}
                courtWidth={courtWidth}
                courtHeight={courtHeight}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
