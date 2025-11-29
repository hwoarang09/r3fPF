import React from "react";
import Rail from "./Rail";
import InstancedVehicle from "./InstancedVehicle";

interface VehicleTestProps {
  vehicleCount?: number;
}

/**
 * VehicleTest component - combines Rail and InstancedVehicle
 * Shows 10 rails with vehicles moving along them
 */
const VehicleTest: React.FC<VehicleTestProps> = ({ vehicleCount = 700 }) => {
  return (
    <group>
      <Rail />
      <InstancedVehicle vehicleCount={vehicleCount} />
    </group>
  );
};

export default VehicleTest;

