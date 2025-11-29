import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import VehicleTest from "./VehicleTest";
import VehicleTest2 from "./VehicleTest2";
import VehicleTest3 from "./VehicleTest3";
import JSSingleThread from "./VehicleTest4";
import WorkerX1 from "./ThreadTestSimple";
import WorkerX10 from "./ThreadTestSimple2";
import RealDataSingle from "./RealDataSingle";
import RealDataWorkerX1 from "./RealDataWorkerX1";
import RealDataWorkerX10 from "./RealDataWorkerX10";
import CameraController from "./cameraController";

type TestMode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const ThreeScene: React.FC = () => {
  const [mode, setMode] = useState<TestMode>(1);
  const vehicleCount = 1400 * 2;

  return (
    <>
      {/* Mode selector UI */}
      <div className="absolute top-20 left-4 z-20 flex gap-2">
        <button
          className={`px-3 py-1 rounded ${
            mode === 1 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode(1)}
        >
          1. Pure (No Physics)
        </button>
        <button
          className={`px-3 py-1 rounded ${
            mode === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode(2)}
        >
          2. Sensor
        </button>
        <button
          className={`px-3 py-1 rounded ${
            mode === 3 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode(3)}
        >
          3. Raycast
        </button>
        <button
          className={`px-3 py-1 rounded ${
            mode === 4 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode(4)}
        >
          4. JS Single Thread
        </button>
        <button
          className={`px-3 py-1 rounded ${
            mode === 5 ? "bg-green-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode(5)}
        >
          5. Worker x1
        </button>
        <button
          className={`px-3 py-1 rounded ${
            mode === 6 ? "bg-purple-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode(6)}
        >
          6. Worker x10
        </button>
        <button
          className={`px-3 py-1 rounded ${
            mode === 7 ? "bg-orange-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode(7)}
        >
          7. Real Data (Single)
        </button>
        <button
          className={`px-3 py-1 rounded ${
            mode === 8 ? "bg-teal-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode(8)}
        >
          8. Real Data (Worker x1)
        </button>
        <button
          className={`px-3 py-1 rounded ${
            mode === 9 ? "bg-pink-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode(9)}
        >
          9. Real Data (Worker x10)
        </button>
      </div>

      <Canvas className="absolute inset-0">
        <ambientLight />
        <pointLight position={[10, 10, 10]} />

        {mode === 1 && <VehicleTest vehicleCount={vehicleCount} />}
        {mode === 2 && <VehicleTest2 vehicleCount={vehicleCount} />}
        {mode === 3 && <VehicleTest3 vehicleCount={vehicleCount} />}
        {mode === 4 && <JSSingleThread vehicleCount={vehicleCount} />}
        {mode === 5 && <WorkerX1 vehicleCount={vehicleCount} />}
        {mode === 6 && <WorkerX10 vehicleCount={vehicleCount} />}
        {mode === 7 && <RealDataSingle vehicleCount={vehicleCount} />}
        {mode === 8 && <RealDataWorkerX1 vehicleCount={vehicleCount} />}
        {mode === 9 && <RealDataWorkerX10 vehicleCount={vehicleCount} />}

        <Perf position="bottom-right" />
        <CameraController />
        <OrbitControls makeDefault />
      </Canvas>
    </>
  );
};

export default ThreeScene;
