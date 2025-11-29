// simulationWorker.ts
const STRIDE = 9;
const RAIL_END_X = 1000;
const SECTOR_SIZE = 10;
const TOTAL_SECTORS = Math.ceil(RAIL_END_X / SECTOR_SIZE);
const SAFE_DISTANCE = 3;
const RAIL_COUNT = 100;

let data: Float32Array | null = null;
let vehicleCount = 0;
let railSectorStores: Set<number>[][] = [];

self.onmessage = (e: MessageEvent) => {
  const { sharedBuffer, count } = e.data;
  if (!sharedBuffer) return;

  data = new Float32Array(sharedBuffer);
  vehicleCount = count;

  railSectorStores = [];
  for (let r = 0; r < RAIL_COUNT; r++) {
    railSectorStores.push(
      Array.from({ length: TOTAL_SECTORS }, () => new Set())
    );
  }

  for (let i = 0; i < vehicleCount; i++) {
    const idx = i * STRIDE;
    const x = data[idx];
    const z = data[idx + 2];
    const railIdx = Math.round(z);

    if (railIdx < 0 || railIdx >= RAIL_COUNT) continue;

    const sector = Math.min(
      Math.max(Math.floor(x / SECTOR_SIZE), 0),
      TOTAL_SECTORS - 1
    );

    data[idx + 5] = sector;
    data[idx + 6] = data[idx + 3];
    data[idx + 7] = 1.0;
    data[idx + 8] = 2 + Math.random() * 3;

    railSectorStores[railIdx][sector].add(i);
  }

  console.log(
    `[Worker] Initialized ${vehicleCount} vehicles on ${RAIL_COUNT} rails`
  );
  loop();
};

let lastTime = performance.now();
let loopCount = 0;
let calcTimes: number[] = [];

function loop() {
  const now = performance.now();
  const delta = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  if (!data) return;

  const calcStart = performance.now();

  // 1. 속도 변경 타이머
  for (let i = 0; i < vehicleCount; i++) {
    const idx = i * STRIDE;
    data[idx + 8] -= delta;

    if (data[idx + 8] <= 0) {
      data[idx + 3] = 2 + Math.random() * 8;
      data[idx + 8] = 2 + Math.random() * 3;
    }
  }

  // 2. 이동 + 충돌
  for (let i = 0; i < vehicleCount; i++) {
    const idx = i * STRIDE;

    let x = data[idx];
    const z = data[idx + 2];
    const railIdx = Math.round(z);

    if (railIdx < 0 || railIdx >= RAIL_COUNT) continue;

    const targetSpeed = data[idx + 3];
    const wasStopped = data[idx + 4] > 0.5;
    let currentSector = Math.floor(data[idx + 5]);
    let currentSpeed = data[idx + 6];
    const accel = data[idx + 7];

    // D. 충돌 감지 먼저 (상태 결정 전에)
    let minDistance = Infinity;
    const nextSector = (currentSector + 1) % TOTAL_SECTORS;

    for (const secIdx of [currentSector, nextSector]) {
      const set = railSectorStores[railIdx][secIdx];
      if (!set) continue;

      for (const otherId of set) {
        if (otherId === i) continue;

        const otherIdx = otherId * STRIDE;
        const otherX = data[otherIdx];
        let dist = otherX - x;

        if (dist < -(RAIL_END_X / 2)) dist += RAIL_END_X;

        if (dist > 0 && dist < SECTOR_SIZE * 2 && dist < minDistance) {
          minDistance = dist;
        }
      }
    }

    // 현재 상태 결정
    const shouldStop = minDistance < SAFE_DISTANCE;

    // [핵심] 정지 -> 출발 전환 시 랜덤 속도 부여
    if (wasStopped && !shouldStop) {
      data[idx + 3] = 2 + Math.random() * 8; // 새 목표 속도
      data[idx + 8] = 2 + Math.random() * 3; // 타이머 리셋
    }

    data[idx + 4] = shouldStop ? 1 : 0;

    // A. 가속/감속
    if (shouldStop) {
      currentSpeed = Math.max(currentSpeed - accel * 2 * delta, 0);
    } else {
      currentSpeed = Math.min(currentSpeed + accel * delta, data[idx + 3]); // 업데이트된 targetSpeed 사용
    }
    data[idx + 6] = currentSpeed;

    // B. 이동
    if (currentSpeed > 0) {
      x += currentSpeed * delta;
      if (x >= RAIL_END_X) x -= RAIL_END_X;
      data[idx] = x;
    }

    // C. 섹터 업데이트
    const newSector = Math.min(Math.floor(x / SECTOR_SIZE), TOTAL_SECTORS - 1);
    if (newSector !== currentSector) {
      railSectorStores[railIdx][currentSector]?.delete(i);
      railSectorStores[railIdx][newSector]?.add(i);
      data[idx + 5] = newSector;
      currentSector = newSector;
    }
  }

  const calcEnd = performance.now();
  calcTimes.push(calcEnd - calcStart);

  loopCount++;
  if (loopCount % 30 === 0) {
    const avg = calcTimes.reduce((a, b) => a + b, 0) / calcTimes.length;
    const fps = 1000 / avg;
    console.log(`[Worker] Avg: ${avg.toFixed(2)}ms → ${fps.toFixed(1)} FPS`);
    calcTimes = [];
  }

  setTimeout(loop, 0);
}
