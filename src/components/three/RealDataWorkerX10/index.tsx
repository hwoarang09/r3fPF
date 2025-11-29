import React, { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import Rail, { RAIL_END_X } from "../VehicleTest/Rail";
import { calculateInitialVehicles } from "../VehicleTest/VehiclesLocationCalculator";

const STRIDE = 5;
const RAIL_COUNT = 10;
const WORKER_COUNT = 10;
const VEH_LENGTH = 3;
const VEH_HEIGHT = 8;
const VEH_DEPTH = 6;

interface RealDataWorkerX10Props {
  vehicleCount?: number;
}

/**
 * RealDataWorkerX10 - Real data structure with 10 Workers
 * Each worker handles one rail independently with real data structures
 * All share the same SharedArrayBuffer
 */
const RealDataWorkerX10: React.FC<RealDataWorkerX10Props> = ({ vehicleCount = 700 }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);
  const workersRef = useRef<Worker[]>([]);

  const sharedBuffer = useMemo(
    () =>
      new SharedArrayBuffer(
        vehicleCount * STRIDE * Float32Array.BYTES_PER_ELEMENT
      ),
    [vehicleCount]
  );

  const sharedView = useMemo(
    () => new Float32Array(sharedBuffer),
    [sharedBuffer]
  );

  useEffect(() => {
    const vehiclesPerRail = Math.floor(vehicleCount / RAIL_COUNT);

    // Initialize shared memory
    const initials = calculateInitialVehicles(vehicleCount);
    initials.forEach((v, i) => {
      const idx = i * STRIDE;
      sharedView[idx] = v.x;
      sharedView[idx + 1] = v.y;
      sharedView[idx + 2] = v.z;
      sharedView[idx + 3] = v.speed;
      sharedView[idx + 4] = 0;
    });

    // Initialize mesh
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

    // Create WORKER_COUNT workers, distribute rails among them
    const workers: Worker[] = [];
    const railsPerWorker = Math.ceil(RAIL_COUNT / WORKER_COUNT);

    for (let w = 0; w < WORKER_COUNT; w++) {
      const worker = new Worker(new URL("./realDataRailWorker.ts", import.meta.url), {
        type: "module",
      });

      // Assign rails to this worker
      const railIndices: number[][] = [];
      for (
        let r = w * railsPerWorker;
        r < Math.min((w + 1) * railsPerWorker, RAIL_COUNT);
        r++
      ) {
        const indices: number[] = [];
        for (let s = 0; s < vehiclesPerRail; s++) {
          indices.push(s * RAIL_COUNT + r);
        }
        railIndices.push(indices);
      }

      worker.postMessage({
        sharedBuffer,
        railIndices,
        perRail: vehiclesPerRail,
        rail: RAIL_END_X,
        id: w,
      });

      workers.push(worker);
    }
    workersRef.current = workers;

    console.log(`[RealDataWorkerX10] Created ${WORKER_COUNT} workers`);

    return () => {
      workers.forEach((w) => w.terminate());
      workersRef.current = [];
    };
  }, [sharedBuffer, sharedView, vehicleCount, tempObject]);

  useFrame(() => {
    if (!meshRef.current) return;

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
  });

  return (
    <>
      <Rail />
      <instancedMesh ref={meshRef} args={[undefined, undefined, vehicleCount]}>
        <boxGeometry args={[VEH_LENGTH, VEH_HEIGHT, VEH_DEPTH]} />
        <meshStandardMaterial color="pink" />
      </instancedMesh>
    </>
  );
};

export default RealDataWorkerX10;

