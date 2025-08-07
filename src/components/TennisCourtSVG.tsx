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
  // Convert 3D coordinates to 2D SVG coordinates (bird's eye view)
  const scale = 8; // pixels per foot
  const svgWidth = courtWidth * scale;
  const svgHeight = courtHeight * scale;
  
  // Convert ball position to SVG coordinates (x = distance, z = lateral position)
  const ballX = ballPosition.x * scale;
  const ballY = (courtHeight/2 - ballPosition.z) * scale; // Center court at middle, flip Z
  
  // Tennis court dimensions (in feet) - bird's eye view
  const baselineToBaseline = 78;
  const singlesSideline = 27;
  const serviceLineDistance = 21;
  const courtCenterY = svgHeight / 2;
  const courtHalfWidth = (singlesSideline * scale) / 2;
  
  return (
    <svg 
      width={svgWidth} 
      height={svgHeight} 
      className="border border-gray-300 bg-green-100"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
    >
      {/* Court lines */}
      <g stroke="white" strokeWidth="2" fill="none">
        {/* Baselines */}
        <line x1={0} y1={courtCenterY - courtHalfWidth} 
              x2={0} y2={courtCenterY + courtHalfWidth} />
        <line x1={baselineToBaseline * scale} y1={courtCenterY - courtHalfWidth} 
              x2={baselineToBaseline * scale} y2={courtCenterY + courtHalfWidth} />
        
        {/* Sidelines */}
        <line x1={0} y1={courtCenterY - courtHalfWidth} 
              x2={baselineToBaseline * scale} y2={courtCenterY - courtHalfWidth} />
        <line x1={0} y1={courtCenterY + courtHalfWidth} 
              x2={baselineToBaseline * scale} y2={courtCenterY + courtHalfWidth} />
        
        {/* Service lines */}
        <line x1={serviceLineDistance * scale} y1={courtCenterY - courtHalfWidth} 
              x2={serviceLineDistance * scale} y2={courtCenterY + courtHalfWidth} />
        <line x1={(baselineToBaseline - serviceLineDistance) * scale} y1={courtCenterY - courtHalfWidth} 
              x2={(baselineToBaseline - serviceLineDistance) * scale} y2={courtCenterY + courtHalfWidth} />
        
        {/* Center service line */}
        <line x1={serviceLineDistance * scale} y1={courtCenterY} 
              x2={(baselineToBaseline - serviceLineDistance) * scale} y2={courtCenterY} />
        
        {/* Net */}
        <line x1={baselineToBaseline * scale / 2} y1={courtCenterY - courtHalfWidth} 
              x2={baselineToBaseline * scale / 2} y2={courtCenterY + courtHalfWidth} 
              stroke="black" strokeWidth="3" />
      </g>
      
      {/* Ball trail */}
      <path
        d={ballTrail.length > 1 ? 
          `M ${ballTrail[0].x * scale} ${(courtHeight/2 - ballTrail[0].z) * scale} ` +
          ballTrail.slice(1).map(pos => 
            `L ${pos.x * scale} ${(courtHeight/2 - pos.z) * scale}`
          ).join(' ')
          : ''
        }
        stroke="red"
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      />
      
      {/* Ball */}
      <circle
        cx={ballX}
        cy={ballY}
        r="4"
        fill="yellow"
        stroke="black"
        strokeWidth="1"
      />
      
      {/* Server position indicator (3 ft right of center baseline) */}
      <circle
        cx={0}
        cy={(courtHeight/2 - 3) * scale}
        r="6"
        fill="blue"
        opacity="0.5"
      />
    </svg>
  );
};