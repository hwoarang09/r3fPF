import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";

// 상단 메뉴 컴포넌트
const Menu: React.FC = () => (
  <div className="absolute top-0 w-full p-4 bg-white/50 flex justify-between items-center z-10">
    <h1 className="text-xl font-bold">My R3F Project</h1>
    <nav className="flex space-x-4">
      <a href="#home" className="text-gray-700 hover:text-gray-900">
        Home
      </a>
      <a href="#about" className="text-gray-700 hover:text-gray-900">
        About
      </a>
      <a href="#contact" className="text-gray-700 hover:text-gray-900">
        Contact
      </a>
    </nav>
  </div>
);

// Box 컴포넌트 (r3f 객체)
const Box: React.FC = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="orange" />
  </mesh>
);

// App 컴포넌트
const App: React.FC = () => (
  <div className="relative w-screen h-screen">
    <Menu />
    <Canvas className="absolute inset-0">
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Box />
      <Perf position="bottom-right" />
    </Canvas>
  </div>
);

export default App;
