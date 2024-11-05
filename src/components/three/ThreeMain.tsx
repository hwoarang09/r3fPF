import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import Box from "./Box";
import useMqtt from "../../hooks/useMqtt";

const ThreeScene: React.FC = () => {
  const { publishMessage } = useMqtt();

  const handleBoxClick = () => {
    publishMessage("control/box", "Box clicked!");
  };

  return (
    <Canvas className="absolute inset-0">
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Box color="orange" onClick={handleBoxClick} />
      <Perf position="bottom-right" />
    </Canvas>
  );
};

export default ThreeScene;
