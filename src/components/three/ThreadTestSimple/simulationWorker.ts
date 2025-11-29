// simulationWorker.ts - Vehicle simulation in separate thread

const STRIDE = 8; // [x, y, z, targetSpeed, isStopped, acceleration, currentSpeed, speedChangeTimer]
const RAIL_COUNT = 10;
const SAFE_DISTANCE = 6; // Distance threshold for stopping

let data: Float32Array | null = null;
let vehicleCount = 0;
let vehiclesPerRail = 0;
let railLength = 0;

// Per-rail index arrays for sorting
let railIndices: Int32Array[] = [];

console.log("[Worker] Worker loaded");

self.onmessage = (e: MessageEvent) => {
  console.log("[Worker] Message received:", e.data);

  const { sharedBuffer, count, rail } = e.data;

  if (!sharedBuffer) {
    console.error("[Worker] No sharedBuffer received!");
    return;
  }

  // Create view to shared memory (same memory as main thread)
  data = new Float32Array(sharedBuffer);
  vehicleCount = count;
  railLength = rail;
  vehiclesPerRail = Math.floor(vehicleCount / RAIL_COUNT);

  console.log("[Worker] Initialized:", {
    vehicleCount,
    railLength,
    vehiclesPerRail,
    safeDistance: SAFE_DISTANCE,
  });

  // Create per-rail index arrays
  // Vehicles are stored: [rail0_slot0, rail1_slot0, ..., rail9_slot0, rail0_slot1, rail1_slot1, ...]
  // So vehicle i belongs to rail (i % RAIL_COUNT) and slot (floor(i / RAIL_COUNT))
  railIndices = [];
  for (let r = 0; r < RAIL_COUNT; r++) {
    const indices = new Int32Array(vehiclesPerRail);
    for (let s = 0; s < vehiclesPerRail; s++) {
      indices[s] = s * RAIL_COUNT + r; // vehicle index for rail r, slot s
    }
    railIndices.push(indices);
  }

  // Start simulation loop
  runSimulation();
};

function runSimulation() {
  console.log("[Worker] Starting simulation loop");

  const DELTA = 1 / 60; // Fixed timestep (~60fps)
  let frameCount = 0;
  let lastTime = performance.now();

  // Performance tracking
  let calcTimes: number[] = [];
  let loopCount = 0;

  function simulationLoop() {
    if (!data) {
      setTimeout(simulationLoop, 0);
      return;
    }

    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    // Only update if enough time has passed (adaptive timing)
    // This prevents too-fast updates while allowing catch-up if calculation is slow
    if (elapsed >= 16) {
      const calcStart = performance.now();

      lastTime = currentTime;
      frameCount++;
      loopCount++;

      // 1. Update target speeds periodically (random speed changes)
      for (let i = 0; i < vehicleCount; i++) {
        const idx = i * STRIDE;

        // Decrease timer
        data[idx + 7] -= DELTA;

        // When timer expires, change target speed
        if (data[idx + 7] <= 0) {
          data[idx + 3] = 2 + Math.random() * 8; // New random target speed (2~10)
          data[idx + 7] = 2 + Math.random() * 3; // Reset timer (2~5 seconds)
        }
      }

      // 2. Movement (update all vehicles with acceleration)
      for (let i = 0; i < vehicleCount; i++) {
        const idx = i * STRIDE;
        const targetSpeed = data[idx + 3];
        const isStopped = data[idx + 4];
        const acceleration = data[idx + 5];
        const currentSpeed = data[idx + 6];

        if (isStopped === 0) {
          // Accelerate towards target speed
          const newSpeed = Math.min(
            currentSpeed + acceleration * DELTA,
            targetSpeed
          );
          data[idx + 6] = newSpeed;

          // Move with current speed
          data[idx] += newSpeed * DELTA;
          if (data[idx] >= railLength) data[idx] -= railLength;
        } else {
          // Decelerate to 0 when stopped
          data[idx + 6] = Math.max(currentSpeed - acceleration * 2 * DELTA, 0);
        }
      }

      // 3. For each rail: sort by X, then check collision
      for (let r = 0; r < RAIL_COUNT; r++) {
        const indices = railIndices[r];

        // Sort this rail's vehicles by X position
        indices.sort((a, b) => data![a * STRIDE] - data![b * STRIDE]);

        // Check collision within this rail
        for (let i = 0; i < vehiclesPerRail; i++) {
          const currentId = indices[i];
          const nextId = indices[(i + 1) % vehiclesPerRail]; // wrap around

          const currentBase = currentId * STRIDE;
          const nextBase = nextId * STRIDE;

          // Distance to car ahead
          let dist = data[nextBase] - data[currentBase];
          if (dist < 0) dist += railLength; // Loop correction (wrap around)

          const currentSpeed = data[currentBase + 6];
          const nextSpeed = data[nextBase + 6]; // Speed of car ahead

          // Adaptive speed control based on distance
          if (dist < SAFE_DISTANCE) {
            // Too close: match or go slower than car ahead
            data[currentBase + 4] = 1; // Mark as stopped (will decelerate)
            // Cap speed to car ahead's speed
            data[currentBase + 6] = Math.min(currentSpeed, nextSpeed);
          } else if (dist < SAFE_DISTANCE * 2) {
            // Medium distance: don't exceed car ahead's speed
            data[currentBase + 4] = 0; // Can move
            data[currentBase + 6] = Math.min(currentSpeed, nextSpeed * 1.1); // Allow 10% faster
          } else {
            // Safe distance: free to accelerate
            data[currentBase + 4] = 0; // Go
          }
        }
      }

      const calcEnd = performance.now();
      const calcTime = calcEnd - calcStart;
      calcTimes.push(calcTime);

      // Log average every 30 loops
      if (loopCount % 30 === 0) {
        const avgCalcTime =
          calcTimes.reduce((a, b) => a + b, 0) / calcTimes.length;
        const theoreticalFPS = 1000 / avgCalcTime; // How many frames per second at this calc speed
        console.log(
          `[SimWorker] Avg: ${avgCalcTime.toFixed(
            2
          )}ms → ${theoreticalFPS.toFixed(
            1
          )} FPS possible | First veh x: ${data[0].toFixed(1)}`
        );
        calcTimes = []; // Reset for next batch
      }
    }

    // Immediately schedule next iteration (no fixed delay!)
    // If calculation finishes early, next iteration starts sooner
    // If calculation takes longer, it will skip frames naturally
    setTimeout(simulationLoop, 0);
  }

  simulationLoop();
}
