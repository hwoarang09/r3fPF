// realDataRailWorker.ts - One worker handles multiple rails with real data structures

const STRIDE = 5;
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
    `[RealDataRailWorker ${workerId}] Started with ${railIndicesArray.length} rails`
  );

  // TODO: Initialize real data structures here for each rail
  // (e.g., spatial hash, linked list, quad tree, etc.)

  runSimulation();
};

function runSimulation() {
  console.log(
    `[RealDataRailWorker ${workerId}] Starting simulation loop with ${railIndicesArray.length} rails`
  );

  const DELTA = 1 / 60;
  let lastTime = performance.now();

  let calcTimes: number[] = [];
  let loopCount = 0;

  function simulationLoop() {
    if (!data || railIndicesArray.length === 0) {
      setTimeout(simulationLoop, 0);
      return;
    }

    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 16) {
      const calcStart = performance.now();

      lastTime = currentTime;
      loopCount++;

      // TODO: Implement real data structure logic here
      // Replace sort-based collision detection with actual data structures
      // Process each rail assigned to this worker

      const calcEnd = performance.now();
      const calcTime = calcEnd - calcStart;
      calcTimes.push(calcTime);

      if (loopCount % 30 === 0) {
        const avgCalcTime =
          calcTimes.reduce((a, b) => a + b, 0) / calcTimes.length;
        const theoreticalFPS = 1000 / avgCalcTime;
        console.log(
          `[RealDataRailWorker ${workerId}] Avg: ${avgCalcTime.toFixed(
            2
          )}ms → ${theoreticalFPS.toFixed(1)} FPS possible | Rails: ${
            railIndicesArray.length
          }`
        );
        calcTimes = [];
      }
    }

    setTimeout(simulationLoop, 0);
  }

  simulationLoop();
}

