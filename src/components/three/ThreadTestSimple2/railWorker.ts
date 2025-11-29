// railWorker.ts - One worker handles multiple rails

const STRIDE = 5; // [x, y, z, speed, isStopped]
const SAFE_DISTANCE = 6;

let data: Float32Array | null = null;
let railIndicesArray: Int32Array[] = [];
let vehiclesPerRail = 0;
let railLength = 0;
let workerId = -1;

self.onmessage = (e: MessageEvent) => {
  const { sharedBuffer, railIndices, perRail, rail, id } = e.data;

  data = new Float32Array(sharedBuffer);
  vehiclesPerRail = perRail;
  railLength = rail;
  workerId = id;

  // Each worker handles multiple rails
  railIndicesArray = railIndices.map(
    (indices: number[]) => new Int32Array(indices)
  );

  console.log(
    `[Worker ${workerId}] Started with ${railIndicesArray.length} rails`
  );

  runSimulation();
};

function runSimulation() {
  console.log(
    `[Worker ${workerId}] Starting simulation loop with ${railIndicesArray.length} rails`
  );

  const DELTA = 1 / 60; // Fixed timestep (~60fps)
  let lastTime = performance.now();

  // Performance tracking
  let calcTimes: number[] = [];
  let loopCount = 0;

  function simulationLoop() {
    if (!data || railIndicesArray.length === 0) {
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
      loopCount++;

      // Process each rail assigned to this worker
      for (const vehicleIndices of railIndicesArray) {
        // 1. Movement
        for (let i = 0; i < vehiclesPerRail; i++) {
          const vehIdx = vehicleIndices[i];
          const idx = vehIdx * STRIDE;

          if (data[idx + 4] === 0) {
            data[idx] += data[idx + 3] * DELTA;
            if (data[idx] >= railLength) data[idx] -= railLength;
          }
        }

        // 2. Sort indices by X position
        vehicleIndices.sort((a, b) => data![a * STRIDE] - data![b * STRIDE]);

        // 3. Collision detection
        for (let i = 0; i < vehiclesPerRail; i++) {
          const currentId = vehicleIndices[i];
          const nextId = vehicleIndices[(i + 1) % vehiclesPerRail];

          const currentBase = currentId * STRIDE;
          const nextBase = nextId * STRIDE;

          let dist = data[nextBase] - data[currentBase];
          if (dist < 0) dist += railLength;

          if (dist < SAFE_DISTANCE) {
            data[currentBase + 4] = 1;
          } else {
            data[currentBase + 4] = 0;
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
          `[RailWorker ${workerId}] Avg: ${avgCalcTime.toFixed(
            2
          )}ms → ${theoreticalFPS.toFixed(1)} FPS possible | Rails: ${
            railIndicesArray.length
          }`
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
