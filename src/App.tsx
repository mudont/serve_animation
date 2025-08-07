import React, { useState, useEffect, useRef } from 'react';
import { SimulationParams, BallState, BouncePoint, NetHit, Vector3D } from './types';
import { PhysicsEngine } from './physics';
import { ControlPanel } from './components/ControlPanel';
import { TennisCourtSVG } from './components/TennisCourtSVG';
import { TennisCourt3D } from './components/TennisCourt3D';

const App: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    serverHeight: 6.5,
    initialVelocity: 100,
    topspinRpm: 2000,
    topspinPlane: 45,
    initialDirection: 0,
    initialVerticalAngle: -3,
    animationSpeed: 0.5,
    airDensity: 0.0765, // lb/ft³ at sea level
    dragCoefficient: 0.47, // sphere
    magnusCoefficient: 0.1,
    enableGravity: true,
    enableDrag: true,
    enableMagnus: true
  });

  const [ballState, setBallState] = useState<BallState | null>(null);
  const [ballTrail, setBallTrail] = useState<Array<{ x: number; y: number; z: number }>>([]);
  const [bouncePoints, setBouncePoints] = useState<BouncePoint[]>([]);
  const [netHit, setNetHit] = useState<NetHit | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isServing, setIsServing] = useState(false);
  const [simulationHistory, setSimulationHistory] = useState<Array<{
    ballState: BallState;
    ballTrail: Vector3D[];
    bouncePoints: BouncePoint[];
    netHit: NetHit | null;
    isServing: boolean;
  }>>([]);
  
  const physicsEngine = useRef(new PhysicsEngine());
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const courtWidth = 100; // feet (extended for visualization)
  const courtHeight = 100; // feet

  const startSimulation = () => {
    // Start with serving motion
    const servingState = physicsEngine.current.createServingState(params, 0);
    setBallState(servingState);
    setBallTrail([servingState.position]);
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
        isServing
      };
      setSimulationHistory(prev => [...prev, currentSnapshot]);

      // Step forward by 0.01 seconds (multiple physics steps)
      let newState = ballState;
      let newTrail = [...ballTrail];
      let newBounces = [...bouncePoints];
      let newNetHit = netHit;
      let newIsServing = isServing;

      const stepsPerFrame = Math.ceil(0.01 / (1/120)); // 0.01 sec at 120 FPS
      
      for (let i = 0; i < stepsPerFrame; i++) {
        if (newIsServing && !newState.hasServed) {
          newState = physicsEngine.current.createServingState(params, newState.time + 1/120);
          if (newState.hasServed) {
            newState = physicsEngine.current.createInitialState(params);
            newState.time = ballState.time + (i + 1) / 120;
            newIsServing = false;
          }
        } else {
          const result = physicsEngine.current.step(newState, params);
          newState = result.newState;
          
          if (result.hitNet && result.netHitPoint) {
            newNetHit = { position: result.netHitPoint, time: newState.time };
            break;
          }
          
          if (result.bounced && result.bouncePoint) {
            newBounces = [...newBounces, { position: result.bouncePoint, time: newState.time }];
          }
          
          if (newState.position.x >= 103) break;
        }
        newTrail = [...newTrail, newState.position];
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
    setSimulationHistory(prev => prev.slice(0, -1));
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
          newState = physicsEngine.current.createServingState(params, ballState.time + 1/60);
          if (newState.hasServed) {
            // Switch to actual ball physics after serve
            newState = physicsEngine.current.createInitialState(params);
            newState.time = ballState.time;
            setIsServing(false);
          }
          setBallState(newState);
          setBallTrail(prev => [...prev, newState.position]);
        } else {
          // Normal physics simulation
          const result = physicsEngine.current.step(ballState, params);
          newState = result.newState;
          
          // Handle net hits
          if (result.hitNet && result.netHitPoint) {
            setNetHit({
              position: result.netHitPoint,
              time: newState.time
            });
            stopSimulation();
            return;
          }

          // Handle bounces
          if (result.bounced && result.bouncePoint) {
            setBouncePoints(prev => [...prev, { 
              position: result.bouncePoint!, 
              time: newState.time 
            }]);
          }
          
          // Check if ball has traveled 25 ft past opposing baseline (78 ft + 25 ft = 103 ft)
          if (newState.position.x >= 103) {
            stopSimulation();
            return;
          }

          setBallState(newState);
          setBallTrail(prev => [...prev, newState.position]);
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
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
                  <div>Speed: {Math.sqrt(
                    ballState.velocity.x ** 2 + 
                    ballState.velocity.y ** 2 + 
                    ballState.velocity.z ** 2
                  ).toFixed(1)} ft/s</div>
                  <div>Status: {netHit ? 'Hit Net!' : isServing ? 'Serving...' : 'Ball in flight'}</div>
                  <div>Bounces: {bouncePoints.length}</div>
                  {netHit && <div className="text-red-600 font-bold">Net Hit at {netHit.time.toFixed(2)}s</div>}
                </div>
              </div>
            )}
          </div>

          {/* Tennis Court Visualizations */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3D Isometric View */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold mb-4">Tennis Court (3D Isometric View)</h3>
              <TennisCourt3D
                ballPosition={ballState?.position || { x: 0, y: params.serverHeight, z: 3 }}
                ballTrail={ballTrail}
                bouncePoints={bouncePoints}
                netHit={netHit}
                serveProgress={isServing ? Math.min(ballState?.time || 0, 0.3) / 0.3 : 0}
                isServing={isServing}
              />
            </div>
            
            {/* Bird's Eye View */}
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h3 className="font-bold mb-4">Tennis Court (Bird's Eye View)</h3>
              <TennisCourtSVG
                ballPosition={ballState?.position || { x: 0, y: params.serverHeight, z: 3 }}
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