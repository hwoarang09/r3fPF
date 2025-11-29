import { RAIL_COUNT, RAIL_SPACING, RAIL_START_X } from "./Rail";

// Vehicle configuration
const VEHICLE_SPACING = 10; // spacing between vehicles on x-axis
const SPEED_PATTERN = [5, 4, 3, 2, 1]; // m/s, cycles through positions in a slot

export interface VehicleData {
  x: number;
  y: number;
  z: number;
  speed: number; // m/s, positive = moving right
  railIndex: number;
  slotIndex: number; // which slot (column) this vehicle is in
}

/**
 * Calculate initial vehicle positions and speeds
 * @param totalVehicles - total number of vehicles (must be divisible by RAIL_COUNT)
 * @returns array of VehicleData with initial positions and speeds
 */
export function calculateInitialVehicles(totalVehicles: number): VehicleData[] {
  const vehicles: VehicleData[] = [];
  const slotsPerRail = Math.floor(totalVehicles / RAIL_COUNT);

  for (let slotIndex = 0; slotIndex < slotsPerRail; slotIndex++) {
    for (let railIndex = 0; railIndex < RAIL_COUNT; railIndex++) {
      const x = RAIL_START_X + slotIndex * VEHICLE_SPACING;
      const y = -railIndex * RAIL_SPACING;
      const z = 0;
      // Speed pattern: 5, 4, 3, 2, 1, 5, 4, 3, 2, 1, ...
      const speed = SPEED_PATTERN[slotIndex % SPEED_PATTERN.length];

      vehicles.push({
        x,
        y,
        z,
        speed,
        railIndex,
        slotIndex,
      });
    }
  }

  return vehicles;
}

/**
 * Update vehicle positions based on delta time
 * Modifies the positions array in-place (Float32Array from InstancedMesh)
 * @param positions - Float32Array of positions (x, y, z for each vehicle)
 * @param speeds - array of speeds for each vehicle
 * @param delta - time delta in seconds
 * @param railEndX - end of rail for wrapping
 */
export function updateVehiclePositions(
  positions: Float32Array,
  speeds: number[],
  delta: number,
  railEndX: number
): void {
  const vehicleCount = speeds.length;

  for (let i = 0; i < vehicleCount; i++) {
    const idx = i * 3; // each vehicle has 3 floats (x, y, z)
    // Update x position based on speed (moving right)
    positions[idx] += speeds[i] * delta;

    // Wrap around when reaching end of rail
    if (positions[idx] > railEndX) {
      positions[idx] = 0;
    }
  }
}

export { VEHICLE_SPACING, SPEED_PATTERN, RAIL_COUNT };
