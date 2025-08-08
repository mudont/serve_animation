import React from "react";
import { Vector3D, BouncePoint, NetHit } from "../types";
import { StickFigurePlayer } from "./StickFigurePlayer";

interface TennisCourt3DProps {
  ballPosition: Vector3D;
  ballTrail: Vector3D[];
  bouncePoints: BouncePoint[];
  netHit: NetHit | null;
  serveProgress: number;
  isServing: boolean;
}

export const TennisCourt3D: React.FC<TennisCourt3DProps> = ({
  ballPosition,
  ballTrail,
  bouncePoints,
  netHit,
  serveProgress,
  isServing,
}) => {
  // Responsive dimensions - use viewBox for scaling
  const viewBoxWidth = 1000;
  const viewBoxHeight = 600;

  // Calculate scale to fit the court with minimal padding
  // Tennis court dimensions: 78ft long, 27ft wide
  const courtLength = 78;
  const courtWidth = 27;
  const maxHeight = 15; // Maximum ball height for trajectory

  // Add minimal padding just to ensure corners are visible
  const paddingLength = 10; // minimal padding for length
  const paddingWidth = 8; // minimal padding for width

  const totalLength = courtLength + paddingLength;
  const totalWidth = courtWidth + paddingWidth;

  // Calculate the actual projected dimensions for isometric view
  // Using exact isometric projection angles: 30° rotation, then 35.264° tilt
  const cos30 = Math.cos(Math.PI / 6);
  const sin30 = Math.sin(Math.PI / 6);
  const cos35 = Math.cos(Math.atan(Math.sqrt(2)));
  const sin35 = Math.sin(Math.atan(Math.sqrt(2)));

  // Calculate the bounding box of the projected court
  const projectedWidth = (totalLength + totalWidth) * cos30;
  const projectedHeight =
    (totalLength + totalWidth) * sin30 * sin35 + maxHeight * 2 * cos35;

  const scaleX = viewBoxWidth / projectedWidth;
  const scaleY = viewBoxHeight / projectedHeight;
  const scale = Math.min(scaleX, scaleY); // Use full available space

  // Isometric projection function
  const project3D = (x: number, y: number, z: number) => {
    // Isometric angles: 30° rotation around Y, then 35.264° around X
    const cos30 = Math.cos(Math.PI / 6);
    const sin30 = Math.sin(Math.PI / 6);
    const cos35 = Math.cos(Math.atan(Math.sqrt(2)));
    const sin35 = Math.sin(Math.atan(Math.sqrt(2)));

    // Scale Y (height) by 1.5x for better visibility
    const scaledY = y * 1.5;

    // Apply isometric transformation
    const isoX = (x * cos30 - z * cos30) * scale;
    const isoY =
      (x * sin30 * sin35 + scaledY * cos35 + z * sin30 * sin35) * scale;

    // Position the court optimally in the viewBox
    // Shift left by 45ft to show the right side better
    const leftShift = 45 * cos30 * scale; // Convert 45ft to projected pixels
    return {
      x: isoX + viewBoxWidth * 0.5 - leftShift, // Shift left by 35ft
      y: viewBoxHeight * 0.75 - isoY, // Position for optimal 3D view
    };
  };

  // Tennis court dimensions
  const baselineToBaseline = 78;
  const singlesSideline = 27;
  const serviceLineDistance = 21;
  const netHeight = 3;

  // Court corners (ground level, y=0)
  const corners = [
    project3D(0, 0, -singlesSideline / 2),
    project3D(0, 0, singlesSideline / 2),
    project3D(baselineToBaseline, 0, singlesSideline / 2),
    project3D(baselineToBaseline, 0, -singlesSideline / 2),
  ];

  // Net posts
  const netPost1 = project3D(
    baselineToBaseline / 2,
    netHeight,
    -singlesSideline / 2
  );
  const netPost2 = project3D(
    baselineToBaseline / 2,
    netHeight,
    singlesSideline / 2
  );
  const netBottom1 = project3D(baselineToBaseline / 2, 0, -singlesSideline / 2);
  const netBottom2 = project3D(baselineToBaseline / 2, 0, singlesSideline / 2);

  // Ball position
  const ballProj = project3D(ballPosition.x, ballPosition.y, ballPosition.z);

  return (
    <svg
      width="100%"
      height="100%"
      className="border border-gray-300 bg-gradient-to-b from-sky-200 to-green-100"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Court surface */}
      <polygon
        points={corners.map((c) => `${c.x},${c.y}`).join(" ")}
        fill="rgba(34, 197, 94, 0.3)"
        stroke="white"
        strokeWidth="2"
      />

      {/* Court lines */}
      <g stroke="white" strokeWidth="2" fill="none">
        {/* Baselines */}
        <line
          x1={corners[0].x}
          y1={corners[0].y}
          x2={corners[1].x}
          y2={corners[1].y}
        />
        <line
          x1={corners[2].x}
          y1={corners[2].y}
          x2={corners[3].x}
          y2={corners[3].y}
        />

        {/* Sidelines */}
        <line
          x1={corners[0].x}
          y1={corners[0].y}
          x2={corners[3].x}
          y2={corners[3].y}
        />
        <line
          x1={corners[1].x}
          y1={corners[1].y}
          x2={corners[2].x}
          y2={corners[2].y}
        />

        {/* Service lines */}
        {(() => {
          const serviceLine1Start = project3D(
            serviceLineDistance,
            0,
            -singlesSideline / 2
          );
          const serviceLine1End = project3D(
            serviceLineDistance,
            0,
            singlesSideline / 2
          );
          const serviceLine2Start = project3D(
            baselineToBaseline - serviceLineDistance,
            0,
            -singlesSideline / 2
          );
          const serviceLine2End = project3D(
            baselineToBaseline - serviceLineDistance,
            0,
            singlesSideline / 2
          );

          return (
            <>
              <line
                x1={serviceLine1Start.x}
                y1={serviceLine1Start.y}
                x2={serviceLine1End.x}
                y2={serviceLine1End.y}
              />
              <line
                x1={serviceLine2Start.x}
                y1={serviceLine2Start.y}
                x2={serviceLine2End.x}
                y2={serviceLine2End.y}
              />
            </>
          );
        })()}

        {/* Center service line */}
        {(() => {
          const centerStart = project3D(serviceLineDistance, 0, 0);
          const centerEnd = project3D(
            baselineToBaseline - serviceLineDistance,
            0,
            0
          );

          return (
            <line
              x1={centerStart.x}
              y1={centerStart.y}
              x2={centerEnd.x}
              y2={centerEnd.y}
            />
          );
        })()}
      </g>

      {/* Net */}
      <g stroke="black" strokeWidth="2">
        {/* Net posts */}
        <line
          x1={netBottom1.x}
          y1={netBottom1.y}
          x2={netPost1.x}
          y2={netPost1.y}
        />
        <line
          x1={netBottom2.x}
          y1={netBottom2.y}
          x2={netPost2.x}
          y2={netPost2.y}
        />

        {/* Net top */}
        <line
          x1={netPost1.x}
          y1={netPost1.y}
          x2={netPost2.x}
          y2={netPost2.y}
          strokeWidth="3"
        />

        {/* Net mesh */}
        {Array.from({ length: 8 }, (_, i) => {
          const t = i / 7;
          const meshStart = {
            x: netBottom1.x + t * (netBottom2.x - netBottom1.x),
            y: netBottom1.y + t * (netBottom2.y - netBottom1.y),
          };
          const meshEnd = {
            x: netPost1.x + t * (netPost2.x - netPost1.x),
            y: netPost1.y + t * (netPost2.y - netPost1.y),
          };

          return (
            <line
              key={i}
              x1={meshStart.x}
              y1={meshStart.y}
              x2={meshEnd.x}
              y2={meshEnd.y}
              stroke="gray"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}
      </g>

      {/* Ball trail in 3D */}
      {ballTrail.length > 1 && (
        <path
          d={(() => {
            const projectedTrail = ballTrail.map((pos) =>
              project3D(pos.x, pos.y, pos.z)
            );
            return (
              `M ${projectedTrail[0].x} ${projectedTrail[0].y} ` +
              projectedTrail
                .slice(1)
                .map((p) => `L ${p.x} ${p.y}`)
                .join(" ")
            );
          })()}
          stroke="red"
          strokeWidth="3"
          fill="none"
          opacity="0.8"
        />
      )}

      {/* Ball shadow on court */}
      {(() => {
        const shadowProj = project3D(ballPosition.x, 0, ballPosition.z);
        return (
          <circle
            cx={shadowProj.x}
            cy={shadowProj.y}
            r="3"
            fill="rgba(0,0,0,0.3)"
          />
        );
      })()}

      {/* Ball */}
      <circle
        cx={ballProj.x}
        cy={ballProj.y}
        r="5"
        fill="yellow"
        stroke="black"
        strokeWidth="1"
      />

      {/* Bounce marks on court */}
      {bouncePoints.map((bounce, index) => {
        const bounceProj = project3D(bounce.position.x, 0, bounce.position.z);
        return (
          <g key={index}>
            <circle
              cx={bounceProj.x}
              cy={bounceProj.y}
              r="4"
              fill="red"
              opacity="0.8"
            />
            <circle
              cx={bounceProj.x}
              cy={bounceProj.y}
              r="8"
              fill="none"
              stroke="red"
              strokeWidth="1"
              opacity="0.5"
            />
          </g>
        );
      })}

      {/* Net hit mark */}
      {netHit &&
        (() => {
          const netHitProj = project3D(
            netHit.position.x,
            netHit.position.y,
            netHit.position.z
          );
          return (
            <g>
              {/* Red X mark */}
              <g stroke="red" strokeWidth="4" strokeLinecap="round">
                <line
                  x1={netHitProj.x - 8}
                  y1={netHitProj.y - 8}
                  x2={netHitProj.x + 8}
                  y2={netHitProj.y + 8}
                />
                <line
                  x1={netHitProj.x - 8}
                  y1={netHitProj.y + 8}
                  x2={netHitProj.x + 8}
                  y2={netHitProj.y - 8}
                />
              </g>
              {/* Circle around X */}
              <circle
                cx={netHitProj.x}
                cy={netHitProj.y}
                r="12"
                fill="none"
                stroke="red"
                strokeWidth="2"
              />
            </g>
          );
        })()}

      {/* Stick figure player */}
      <StickFigurePlayer
        project3D={project3D}
        serveProgress={serveProgress}
        isServing={isServing}
      />

      {/* Height reference lines */}
      {ballPosition.y > 0 && (
        <line
          x1={ballProj.x}
          y1={ballProj.y}
          x2={project3D(ballPosition.x, 0, ballPosition.z).x}
          y2={project3D(ballPosition.x, 0, ballPosition.z).y}
          stroke="rgba(255,255,0,0.5)"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      )}

      {/* Coordinate axes for reference */}
      <g stroke="gray" strokeWidth="1" opacity="0.5">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="gray" />
          </marker>
        </defs>

        {/* Origin point */}
        {(() => {
          const origin = project3D(0, 0, 0);
          return <circle cx={origin.x} cy={origin.y} r="2" fill="gray" />;
        })()}

        {/* X axis (distance) */}
        <line
          x1={project3D(0, 0, 0).x}
          y1={project3D(0, 0, 0).y}
          x2={project3D(20, 0, 0).x}
          y2={project3D(20, 0, 0).y}
          markerEnd="url(#arrowhead)"
        />
        <text
          x={project3D(22, 0, 0).x}
          y={project3D(22, 0, 0).y}
          fontSize="12"
          fill="gray"
        >
          Distance
        </text>

        {/* Y axis (height) - pointing UP */}
        <line
          x1={project3D(0, 0, 0).x}
          y1={project3D(0, 0, 0).y}
          x2={project3D(0, 15, 0).x}
          y2={project3D(0, 15, 0).y}
          markerEnd="url(#arrowhead)"
        />
        <text
          x={project3D(0, 17, 0).x}
          y={project3D(0, 17, 0).y}
          fontSize="12"
          fill="gray"
        >
          Height
        </text>

        {/* Z axis (lateral) */}
        <line
          x1={project3D(0, 0, 0).x}
          y1={project3D(0, 0, 0).y}
          x2={project3D(0, 0, 15).x}
          y2={project3D(0, 0, 15).y}
          markerEnd="url(#arrowhead)"
        />
        <text
          x={project3D(0, 0, 17).x}
          y={project3D(0, 0, 17).y}
          fontSize="12"
          fill="gray"
        >
          Lateral
        </text>
      </g>
    </svg>
  );
};
