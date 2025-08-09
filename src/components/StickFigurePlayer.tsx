import React from 'react';

interface StickFigurePlayerProps {
  project3D: (x: number, y: number, z: number) => { x: number; y: number };
  serveProgress: number; // 0 to 1, where 1 is ball contact
  isServing: boolean;
}

export const StickFigurePlayer: React.FC<StickFigurePlayerProps> = ({
  project3D,
  serveProgress,
  isServing
}) => {
  // Player position (behind baseline)
  const playerX = -2;
  const playerZ = 3;
  
  // Body parts positions based on serve motion
  const getBodyPositions = () => {
    if (!isServing) {
      // Ready position
      return {
        head: project3D(playerX, 6, playerZ),
        torso: project3D(playerX, 4.5, playerZ),
        waist: project3D(playerX, 3, playerZ),
        leftShoulder: project3D(playerX - 0.5, 5, playerZ),
        rightShoulder: project3D(playerX + 0.5, 5, playerZ),
        leftElbow: project3D(playerX - 0.8, 4, playerZ),
        rightElbow: project3D(playerX + 0.8, 4, playerZ),
        leftHand: project3D(playerX - 1, 3.5, playerZ),
        rightHand: project3D(playerX + 1, 3.5, playerZ),
        leftHip: project3D(playerX - 0.3, 3, playerZ),
        rightHip: project3D(playerX + 0.3, 3, playerZ),
        leftKnee: project3D(playerX - 0.3, 1.5, playerZ),
        rightKnee: project3D(playerX + 0.3, 1.5, playerZ),
        leftFoot: project3D(playerX - 0.3, 0, playerZ),
        rightFoot: project3D(playerX + 0.3, 0, playerZ),
        racquet: project3D(playerX + 1, 3.5, playerZ)
      };
    }
    
    // Serving motion
    const t = serveProgress;
    
    // Realistic serve motion with forward swing and follow-through
    let armSwing, racquetHeight, racquetForward;
    
    if (t < 0.6) {
      // Toss phase: racquet goes up and back (preparation)
      armSwing = t / 0.6; // Linear rise to full extension
      racquetHeight = armSwing;
      racquetForward = -0.3 * armSwing; // Slight backward motion during toss
    } else if (t < 0.9) {
      // Contact phase: racquet moves forward and up for contact
      const contactPhase = (t - 0.6) / 0.3; // 0 to 1 over contact phase
      armSwing = 1.0; // Stay at full extension
      racquetHeight = 1.0 + contactPhase * 0.3; // Reach up for contact
      racquetForward = -0.3 + contactPhase * 1.0; // Move forward for contact
    } else {
      // Follow-through phase: racquet comes down and forward
      const followPhase = (t - 0.9) / 0.1; // 0 to 1 over follow-through
      armSwing = 1.0 - followPhase * 0.5; // Start coming down
      racquetHeight = 1.3 - followPhase * 0.8; // Come down from peak
      racquetForward = 0.7 + followPhase * 0.5; // Continue forward and down
    }
    
    const bodyLean = t * 0.5;
    
    return {
      head: project3D(playerX + bodyLean, 6, playerZ),
      torso: project3D(playerX + bodyLean, 4.5, playerZ),
      waist: project3D(playerX + bodyLean, 3, playerZ),
      leftShoulder: project3D(playerX - 0.5 + bodyLean, 5, playerZ),
      rightShoulder: project3D(playerX + 0.5 + bodyLean, 5 + armSwing * 0.5, playerZ),
      leftElbow: project3D(playerX - 0.8 + bodyLean, 4, playerZ),
      rightElbow: project3D(playerX + 0.8 + bodyLean + racquetForward * 0.5, 4.5 + armSwing, playerZ),
      leftHand: project3D(playerX - 1 + bodyLean, 3.5, playerZ),
      rightHand: project3D(playerX + 1 + bodyLean + racquetForward * 0.8, 4 + racquetHeight * 1.5, playerZ),
      leftHip: project3D(playerX - 0.3 + bodyLean, 3, playerZ),
      rightHip: project3D(playerX + 0.3 + bodyLean, 3, playerZ),
      leftKnee: project3D(playerX - 0.3 + bodyLean, 1.5, playerZ),
      rightKnee: project3D(playerX + 0.3 + bodyLean, 1.5, playerZ),
      leftFoot: project3D(playerX - 0.3 + bodyLean, 0, playerZ),
      rightFoot: project3D(playerX + 0.3 + bodyLean, 0, playerZ),
      racquet: project3D(playerX + 1.2 + bodyLean + racquetForward, 4.5 + racquetHeight * 1.8, playerZ - 0.3)
    };
  };
  
  const positions = getBodyPositions();
  
  return (
    <g stroke="brown" strokeWidth="3" fill="none" strokeLinecap="round">
      {/* Head */}
      <circle cx={positions.head.x} cy={positions.head.y} r="8" fill="peachpuff" stroke="brown" strokeWidth="2" />
      
      {/* Torso */}
      <line x1={positions.torso.x} y1={positions.torso.y} x2={positions.waist.x} y2={positions.waist.y} />
      
      {/* Arms */}
      <line x1={positions.leftShoulder.x} y1={positions.leftShoulder.y} 
            x2={positions.leftElbow.x} y2={positions.leftElbow.y} />
      <line x1={positions.leftElbow.x} y1={positions.leftElbow.y} 
            x2={positions.leftHand.x} y2={positions.leftHand.y} />
      
      <line x1={positions.rightShoulder.x} y1={positions.rightShoulder.y} 
            x2={positions.rightElbow.x} y2={positions.rightElbow.y} />
      <line x1={positions.rightElbow.x} y1={positions.rightElbow.y} 
            x2={positions.rightHand.x} y2={positions.rightHand.y} />
      
      {/* Shoulders */}
      <line x1={positions.leftShoulder.x} y1={positions.leftShoulder.y} 
            x2={positions.rightShoulder.x} y2={positions.rightShoulder.y} />
      
      {/* Legs */}
      <line x1={positions.leftHip.x} y1={positions.leftHip.y} 
            x2={positions.leftKnee.x} y2={positions.leftKnee.y} />
      <line x1={positions.leftKnee.x} y1={positions.leftKnee.y} 
            x2={positions.leftFoot.x} y2={positions.leftFoot.y} />
      
      <line x1={positions.rightHip.x} y1={positions.rightHip.y} 
            x2={positions.rightKnee.x} y2={positions.rightKnee.y} />
      <line x1={positions.rightKnee.x} y1={positions.rightKnee.y} 
            x2={positions.rightFoot.x} y2={positions.rightFoot.y} />
      
      {/* Hips */}
      <line x1={positions.leftHip.x} y1={positions.leftHip.y} 
            x2={positions.rightHip.x} y2={positions.rightHip.y} />
      
      {/* Racquet */}
      <g stroke="black" strokeWidth="2">
        {/* Racquet handle */}
        <line x1={positions.rightHand.x} y1={positions.rightHand.y} 
              x2={positions.racquet.x} y2={positions.racquet.y} />
        
        {/* Racquet head */}
        <ellipse cx={positions.racquet.x} cy={positions.racquet.y - 8} 
                 rx="6" ry="12" fill="none" stroke="black" strokeWidth="2" />
        
        {/* Racquet strings */}
        <g stroke="gray" strokeWidth="0.5" opacity="0.7">
          <line x1={positions.racquet.x - 4} y1={positions.racquet.y - 16} 
                x2={positions.racquet.x - 4} y2={positions.racquet.y} />
          <line x1={positions.racquet.x} y1={positions.racquet.y - 16} 
                x2={positions.racquet.x} y2={positions.racquet.y} />
          <line x1={positions.racquet.x + 4} y1={positions.racquet.y - 16} 
                x2={positions.racquet.x + 4} y2={positions.racquet.y} />
        </g>
      </g>
      
      {/* Ball contact effect */}
      {isServing && serveProgress > 0.95 && (
        <g>
          <circle cx={positions.racquet.x} cy={positions.racquet.y - 8} r="15" 
                  fill="none" stroke="yellow" strokeWidth="2" opacity="0.5" />
          <circle cx={positions.racquet.x} cy={positions.racquet.y - 8} r="10" 
                  fill="none" stroke="orange" strokeWidth="1" opacity="0.7" />
        </g>
      )}
    </g>
  );
};