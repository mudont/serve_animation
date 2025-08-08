import React from 'react';
import { Vector3D } from '../types';

interface TennisCourtSVGProps {
  ballPosition: Vector3D;
  ballTrail: Vector3D[];
  courtWidth: number;
  courtHeight: number;
}

export const TennisCourtSVG: React.FC<TennisCourtSVGProps> = ({
  ballPosition,
  ballTrail,
  courtWidth,
  courtHeight
}) => {
  // Tennis court dimensions (in feet) - actual court size
  const baselineToBaseline = 78;
  const singlesSideline = 27;
  const serviceLineDistance = 21;
  
  // Add padding around the court to show all corners
  const padding = 15; // feet of padding
  const totalWidth = baselineToBaseline + (padding * 2);
  const totalHeight = singlesSideline + (padding * 2);
  
  // Use viewBox for responsive scaling
  const viewBoxWidth = totalWidth * 10; // scale factor for viewBox
  const viewBoxHeight = totalHeight * 10;
  
  // Convert ball position to viewBox coordinates
  const scale = 10; // viewBox scale factor
  const ballX = (ballPosition.x + padding) * scale;
  const ballY = (totalHeight/2 - ballPosition.z) * scale; // Center court at middle, flip Z
  
  const courtCenterY = viewBoxHeight / 2;
  const courtHalfWidth = (singlesSideline * scale) / 2;
  const courtStartX = padding * scale;
  
  return (
    <svg 
      width="100%" 
      height="100%" 
      className="border border-gray-300 bg-green-100"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Court lines */}
      <g stroke="white" strokeWidth="20" fill="none">
        {/* Baselines */}
        <line x1={courtStartX} y1={courtCenterY - courtHalfWidth} 
              x2={courtStartX} y2={courtCenterY + courtHalfWidth} />
        <line x1={courtStartX + baselineToBaseline * scale} y1={courtCenterY - courtHalfWidth} 
              x2={courtStartX + baselineToBaseline * scale} y2={courtCenterY + courtHalfWidth} />
        
        {/* Sidelines */}
        <line x1={courtStartX} y1={courtCenterY - courtHalfWidth} 
              x2={courtStartX + baselineToBaseline * scale} y2={courtCenterY - courtHalfWidth} />
        <line x1={courtStartX} y1={courtCenterY + courtHalfWidth} 
              x2={courtStartX + baselineToBaseline * scale} y2={courtCenterY + courtHalfWidth} />
        
        {/* Service lines */}
        <line x1={courtStartX + serviceLineDistance * scale} y1={courtCenterY - courtHalfWidth} 
              x2={courtStartX + serviceLineDistance * scale} y2={courtCenterY + courtHalfWidth} />
        <line x1={courtStartX + (baselineToBaseline - serviceLineDistance) * scale} y1={courtCenterY - courtHalfWidth} 
              x2={courtStartX + (baselineToBaseline - serviceLineDistance) * scale} y2={courtCenterY + courtHalfWidth} />
        
        {/* Center service line */}
        <line x1={courtStartX + serviceLineDistance * scale} y1={courtCenterY} 
              x2={courtStartX + (baselineToBaseline - serviceLineDistance) * scale} y2={courtCenterY} />
        
        {/* Net */}
        <line x1={courtStartX + baselineToBaseline * scale / 2} y1={courtCenterY - courtHalfWidth} 
              x2={courtStartX + baselineToBaseline * scale / 2} y2={courtCenterY + courtHalfWidth} 
              stroke="black" strokeWidth="6" />
      </g>
      
      {/* Ball trail */}
      <path
        d={ballTrail.length > 1 ? 
          `M ${(ballTrail[0].x + padding) * scale} ${(totalHeight/2 - ballTrail[0].z) * scale} ` +
          ballTrail.slice(1).map(pos => 
            `L ${(pos.x + padding) * scale} ${(totalHeight/2 - pos.z) * scale}`
          ).join(' ')
          : ''
        }
        stroke="red"
        strokeWidth="4"
        fill="none"
        opacity="0.7"
      />
      
      {/* Ball */}
      <circle
        cx={ballX}
        cy={ballY}
        r="8"
        fill="yellow"
        stroke="black"
        strokeWidth="2"
      />
      
      {/* Server position indicator (3 ft right of center baseline) */}
      <circle
        cx={courtStartX}
        cy={(totalHeight/2 - 3) * scale}
        r="12"
        fill="blue"
        opacity="0.5"
      />
    </svg>
  );
};