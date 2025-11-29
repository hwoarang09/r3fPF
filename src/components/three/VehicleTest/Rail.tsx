import React from "react";

// Rail configuration
const RAIL_START_X = 0;
const RAIL_END_X = 100000;
const RAIL_COUNT = 10;
const RAIL_SPACING = 50; // y-axis spacing between rails
const RAIL_THICKNESS = 3; // thickness of rail (height in y)
const RAIL_DEPTH = 3; // depth of rail (z direction)

/**
 * Rail component - displays 10 horizontal rails using box meshes
 * X: 0 to 100000
 * Y: 10 lines going downward, spaced 100 apart (0, -100, -200, ... -900)
 */
const Rail: React.FC = () => {
  const rails = [];
  const railLength = RAIL_END_X - RAIL_START_X;
  const railCenterX = (RAIL_START_X + RAIL_END_X) / 2;

  for (let i = 0; i < RAIL_COUNT; i++) {
    const yPosition = -i * RAIL_SPACING;
    rails.push(
      <mesh key={i} position={[railCenterX, yPosition, 0]}>
        <boxGeometry args={[railLength, RAIL_THICKNESS, RAIL_DEPTH]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    );
  }

  return <group>{rails}</group>;
};

export default Rail;
export { RAIL_START_X, RAIL_END_X, RAIL_COUNT, RAIL_SPACING };
