import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import {
  calculateInitialVehicles,
  updateVehiclePositions,
  VehicleData,
} from "./VehiclesLocationCalculator";
import { RAIL_END_X } from "./Rail";

interface InstancedVehicleProps {
  vehicleCount?: number;
}

/**
 * InstancedVehicle component - displays vehicles using InstancedMesh
 * Uses useFrame for animation, no re-rendering needed
 */
const InstancedVehicle: React.FC<InstancedVehicleProps> = ({
  vehicleCount = 700,
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  // Calculate initial vehicle data
  const vehiclesData = useMemo<VehicleData[]>(() => {
    return calculateInitialVehicles(vehicleCount);
  }, [vehicleCount]);

  // Extract speeds for update function
  const speeds = useMemo(() => {
    return vehiclesData.map((v) => v.speed);
  }, [vehiclesData]);

  // Store positions in a ref for mutation without re-render
  const positionsRef = useRef<Float32Array>(new Float32Array(vehicleCount * 3));

  // Initialize positions
  useEffect(() => {
    if (!meshRef.current) return;

    vehiclesData.forEach((vehicle, i) => {
      const idx = i * 3;
      positionsRef.current[idx] = vehicle.x;
      positionsRef.current[idx + 1] = vehicle.y;
      positionsRef.current[idx + 2] = vehicle.z;

      tempObject.position.set(vehicle.x, vehicle.y, vehicle.z);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [vehiclesData, tempObject]);

  // Animation loop - update positions every frame
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Update positions based on speeds
    updateVehiclePositions(positionsRef.current, speeds, delta, RAIL_END_X);

    // Apply updated positions to instanced mesh
    for (let i = 0; i < vehicleCount; i++) {
      const idx = i * 3;
      tempObject.position.set(
        positionsRef.current[idx],
        positionsRef.current[idx + 1],
        positionsRef.current[idx + 2]
      );
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, vehicleCount]}>
      <boxGeometry args={[3, 8, 6]} />
      <meshStandardMaterial color="orange" />
    </instancedMesh>
  );
};

export default InstancedVehicle;
