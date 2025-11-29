import React, { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import Rail, { RAIL_END_X } from "../VehicleTest/Rail";
import { calculateInitialVehicles } from "../VehicleTest/VehiclesLocationCalculator";

const STRIDE = 8; // [x, y, z, targetSpeed, isStopped, acceleration, currentSpeed, speedChangeTimer]
const VEH_LENGTH = 3;
const VEH_HEIGHT = 8;
const VEH_DEPTH = 6;

interface WorkerX1Props {
  vehicleCount?: number;
}

/**
 * WorkerX1 - SharedArrayBuffer + Web Worker
 * Main thread: Only rendering (read shared memory)
 * Worker thread: All simulation logic (write shared memory)
 * Zero-copy, zero-latency communication
 */
const WorkerX1: React.FC<WorkerX1Props> = ({ vehicleCount = 700 }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);
  const workerRef = useRef<Worker | null>(null);

  // 1. Create SharedArrayBuffer (shared memory)
  const sharedBuffer = useMemo(
    () =>
      new SharedArrayBuffer(
        vehicleCount * STRIDE * Float32Array.BYTES_PER_ELEMENT
      ),
    [vehicleCount]
  );

  // Main thread view into shared memory
  const sharedView = useMemo(
    () => new Float32Array(sharedBuffer),
    [sharedBuffer]
  );

  useEffect(() => {
    // Initialize data in shared memory (main thread writes once)
    const initials = calculateInitialVehicles(vehicleCount);
    initials.forEach((v, i) => {
      const idx = i * STRIDE;
      sharedView[idx] = v.x;
      sharedView[idx + 1] = v.y;
      sharedView[idx + 2] = v.z;
      sharedView[idx + 3] = 2 + Math.random() * 16; // target speed (2~10 random, will change over time)
      sharedView[idx + 4] = 0; // isStopped = false
      sharedView[idx + 5] = 3 + Math.random() * 7; // acceleration (3~10 random)
      sharedView[idx + 6] = 0; // currentSpeed (starts at 0)
      sharedView[idx + 7] = 2 + Math.random() * 3; // speedChangeTimer (2~5 seconds, random per vehicle)
    });

    // Initialize instanced mesh matrices
    if (meshRef.current) {
      for (let i = 0; i < vehicleCount; i++) {
        const idx = i * STRIDE;
        tempObject.position.set(
          sharedView[idx],
          sharedView[idx + 1],
          sharedView[idx + 2]
        );
        tempObject.updateMatrix();
        meshRef.current.setMatrixAt(i, tempObject.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }

    // Create worker and pass shared memory (only passes memory address, not copy!)
    const worker = new Worker(
      new URL("./simulationWorker.ts", import.meta.url),
      { type: "module" }
    );
    worker.postMessage({
      sharedBuffer,
      count: vehicleCount,
      rail: RAIL_END_X,
    });
    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [sharedBuffer, sharedView, vehicleCount, tempObject]);

  useFrame(() => {
    if (!meshRef.current) return;

    // --- Render loop (NO LOGIC!) ---
    // Worker already updated sharedView values
    // Just read and update matrices

    for (let i = 0; i < vehicleCount; i++) {
      const idx = i * STRIDE;
      const x = sharedView[idx];
      const y = sharedView[idx + 1];
      const z = sharedView[idx + 2];

      tempObject.position.set(x, y, z);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <Rail />
      <instancedMesh ref={meshRef} args={[undefined, undefined, vehicleCount]}>
        <boxGeometry args={[VEH_LENGTH, VEH_HEIGHT, VEH_DEPTH]} />
        <meshStandardMaterial color="cyan" />
      </instancedMesh>
    </>
  );
};

export default WorkerX1;
