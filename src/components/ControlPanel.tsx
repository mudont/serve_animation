import React from 'react';
import { SimulationParams } from '../types';

interface ControlPanelProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  isRunning: boolean;
  isPaused: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  onParamsChange,
  onStart,
  onStop,
  onReset,
  onStepForward,
  onStepBackward,
  isRunning,
  isPaused
}) => {
  const updateParam = (key: keyof SimulationParams, value: any) => {
    onParamsChange({ ...params, [key]: value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-xl font-bold mb-4">Tennis Serve Simulator</h2>
      
      {/* Server Height */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Server Height: {params.serverHeight.toFixed(1)} ft
        </label>
        <input
          type="range"
          min="5"
          max="8"
          step="0.1"
          value={params.serverHeight}
          onChange={(e) => updateParam('serverHeight', parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Initial Velocity */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Initial Velocity: {params.initialVelocity} mph
        </label>
        <input
          type="range"
          min="60"
          max="140"
          step="1"
          value={params.initialVelocity}
          onChange={(e) => updateParam('initialVelocity', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Topspin RPM */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Topspin: {params.topspinRpm} RPM
        </label>
        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={params.topspinRpm}
          onChange={(e) => updateParam('topspinRpm', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Topspin Plane */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Topspin Plane: {params.topspinPlane}°
        </label>
        <input
          type="range"
          min="-90"
          max="90"
          step="5"
          value={params.topspinPlane}
          onChange={(e) => updateParam('topspinPlane', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Initial Direction */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Direction: {params.initialDirection}°
        </label>
        <input
          type="range"
          min="-30"
          max="30"
          step="1"
          value={params.initialDirection}
          onChange={(e) => updateParam('initialDirection', parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Initial Vertical Angle */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Vertical Angle: {params.initialVerticalAngle}° {params.initialVerticalAngle > 0 ? '(up)' : params.initialVerticalAngle < 0 ? '(down)' : '(level)'}
        </label>
        <input
          type="range"
          min="-15"
          max="15"
          step="1"
          value={params.initialVerticalAngle}
          onChange={(e) => updateParam('initialVerticalAngle', parseInt(e.target.value))}
          className="w-full"
        />
      </div>



      {/* Physics Coefficients */}
      <div className="space-y-3">
        <h3 className="font-medium">Physics Coefficients:</h3>
        
        {/* Air Density */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Air Density: {params.airDensity.toFixed(4)} lb/ft³
          </label>
          <input
            type="range"
            min="0.05"
            max="0.12"
            step="0.001"
            value={params.airDensity}
            onChange={(e) => updateParam('airDensity', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            Sea level: 0.0765, High altitude: ~0.06
          </div>
        </div>

        {/* Drag Coefficient */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Drag Coefficient: {params.dragCoefficient.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.01"
            value={params.dragCoefficient}
            onChange={(e) => updateParam('dragCoefficient', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            Smooth sphere: 0.47, Rough ball: ~0.5-0.7
          </div>
        </div>

        {/* Magnus Coefficient */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Magnus Coefficient: {params.magnusCoefficient.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.0"
            max="0.3"
            step="0.01"
            value={params.magnusCoefficient}
            onChange={(e) => updateParam('magnusCoefficient', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            Typical range: 0.1-0.2 for tennis balls
          </div>
        </div>
      </div>

      {/* Physics Effects */}
      <div className="space-y-2">
        <h3 className="font-medium">Physics Effects:</h3>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={params.enableGravity}
            onChange={(e) => updateParam('enableGravity', e.target.checked)}
          />
          <span>Gravity</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={params.enableDrag}
            onChange={(e) => updateParam('enableDrag', e.target.checked)}
          />
          <span>Air Drag</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={params.enableMagnus}
            onChange={(e) => updateParam('enableMagnus', e.target.checked)}
          />
          <span>Magnus Effect</span>
        </label>
      </div>

      {/* Playback Controls */}
      <div className="space-y-3">
        <h3 className="font-medium">Playback Controls:</h3>
        
        {/* Animation Speed */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Animation Speed: {params.animationSpeed.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.01"
            max="1"
            step="0.01"
            value={params.animationSpeed}
            onChange={(e) => updateParam('animationSpeed', parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-2">
          <button
            onClick={onStepBackward}
            disabled={isRunning}
            title="Step Backward (0.01s)"
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-medium text-xl flex items-center justify-center"
          >
            ⏪
          </button>
          
          <button
            onClick={isRunning ? onStop : onStart}
            title={isRunning ? "Pause" : "Play"}
            className={`w-12 h-12 rounded font-medium text-xl flex items-center justify-center ${
              isRunning 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? '⏸️' : '▶️'}
          </button>
          
          <button
            onClick={onStepForward}
            disabled={isRunning}
            title="Step Forward (0.01s)"
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded font-medium text-xl flex items-center justify-center"
          >
            ⏩
          </button>
          
          <button
            onClick={onReset}
            title="Reset Simulation"
            className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium text-xl flex items-center justify-center"
          >
            🔄
          </button>
        </div>
        
        <div className="text-xs text-gray-500 text-center">
          Step size: 0.01 seconds
        </div>
      </div>
    </div>
  );
};