import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import Box from "./Box";
import { useMqttStore } from "../../store/mqttStore";

const ThreeScene: React.FC = () => {
  const { sendMessage } = useMqttStore();
  const handleBoxClick = () => {
    sendMessage({ topic: "control/box", message: "Box clicked!" });
    console.log("Box clicked!");
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
