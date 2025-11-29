import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import Rail, { RAIL_END_X } from "../VehicleTest/Rail";
import { calculateInitialVehicles } from "../VehicleTest/VehiclesLocationCalculator";

// --- 상수 설정 (Worker와 동일) ---
const STRIDE = 8;
const RAIL_COUNT = 10;
const SAFE_DISTANCE = 6;
const VEH_LENGTH = 3;
const VEH_HEIGHT = 8;
const VEH_DEPTH = 6;

const JSSingleThread: React.FC<{ vehicleCount?: number }> = ({
  vehicleCount = 700,
}) => {
  const meshRef = useRef<InstancedMesh>(null);

  // 데이터 Ref
  const dataRef = useRef(new Float32Array(vehicleCount * STRIDE));
  const railIndicesRef = useRef<Int32Array[]>([]);

  // 성능 측정용 Ref
  const statsRef = useRef({
    calcTimes: [] as number[],
    loopCount: 0,
  });

  // 1. 초기화
  useEffect(() => {
    const data = dataRef.current;
    const vehiclesPerRail = Math.floor(vehicleCount / RAIL_COUNT);

    // 데이터 초기값 세팅
    const initials = calculateInitialVehicles(vehicleCount);
    initials.forEach((v, i) => {
      const idx = i * STRIDE;
      data[idx] = v.x;
      data[idx + 1] = v.y;
      data[idx + 2] = v.z;
      data[idx + 3] = 2 + Math.random() * 8; // targetSpeed
      data[idx + 4] = 0; // isStopped
      data[idx + 5] = 3 + Math.random() * 7; // acceleration
      data[idx + 6] = 0; // currentSpeed
      data[idx + 7] = 2 + Math.random() * 3; // timer
    });

    // 레일 인덱스 배열 생성
    railIndicesRef.current = [];
    for (let r = 0; r < RAIL_COUNT; r++) {
      const indices = new Int32Array(vehiclesPerRail);
      for (let s = 0; s < vehiclesPerRail; s++) {
        indices[s] = s * RAIL_COUNT + r;
      }
      railIndicesRef.current.push(indices);
    }

    // 초기 렌더링 (모양 잡기용)
    if (meshRef.current) {
      const temp = new Object3D();
      for (let i = 0; i < vehicleCount; i++) {
        const idx = i * STRIDE;
        temp.position.set(data[idx], data[idx + 1], data[idx + 2]);
        temp.updateMatrix();
        meshRef.current.setMatrixAt(i, temp.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [vehicleCount]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const data = dataRef.current;
    const railIndices = railIndicesRef.current;
    const railLength = RAIL_END_X;
    const vehiclesPerRail = Math.floor(vehicleCount / RAIL_COUNT);

    // -------------------------------------------------------
    // [측정 시작] 순수 로직 계산 시간만 잽니다.
    // -------------------------------------------------------
    const start = performance.now();

    // 1. Timer Logic
    for (let i = 0; i < vehicleCount; i++) {
      const idx = i * STRIDE;
      data[idx + 7] -= delta;
      if (data[idx + 7] <= 0) {
        data[idx + 3] = 2 + Math.random() * 8;
        data[idx + 7] = 2 + Math.random() * 3;
      }
    }

    // 2. Movement Logic
    for (let i = 0; i < vehicleCount; i++) {
      const idx = i * STRIDE;
      const targetSpeed = data[idx + 3];
      const isStopped = data[idx + 4];
      const acceleration = data[idx + 5];
      const currentSpeed = data[idx + 6];

      if (isStopped === 0) {
        const newSpeed = Math.min(
          currentSpeed + acceleration * delta,
          targetSpeed
        );
        data[idx + 6] = newSpeed;
        data[idx] += newSpeed * delta;
        if (data[idx] >= railLength) data[idx] -= railLength;
      } else {
        data[idx + 6] = Math.max(currentSpeed - acceleration * 2 * delta, 0);
      }
    }

    // 3. Collision & Sorting Logic
    for (let r = 0; r < RAIL_COUNT; r++) {
      const indices = railIndices[r];
      // Sort
      indices.sort((a, b) => data[a * STRIDE] - data[b * STRIDE]);

      // Check Collision
      for (let i = 0; i < vehiclesPerRail; i++) {
        const currentId = indices[i];
        const nextId = indices[(i + 1) % vehiclesPerRail];
        const currentBase = currentId * STRIDE;
        const nextBase = nextId * STRIDE;

        let dist = data[nextBase] - data[currentBase];
        if (dist < 0) dist += railLength;

        const currentSpeed = data[currentBase + 6];
        const nextSpeed = data[nextBase + 6];

        if (dist < SAFE_DISTANCE) {
          data[currentBase + 4] = 1;
          data[currentBase + 6] = Math.min(currentSpeed, nextSpeed);
        } else if (dist < SAFE_DISTANCE * 2) {
          data[currentBase + 4] = 0;
          data[currentBase + 6] = Math.min(currentSpeed, nextSpeed * 1.1);
        } else {
          data[currentBase + 4] = 0;
        }
      }
    }

    // -------------------------------------------------------
    // [측정 종료] 계산 끝
    // -------------------------------------------------------
    const end = performance.now();
    const duration = end - start;

    // 통계 및 로그 출력
    const stats = statsRef.current;
    stats.calcTimes.push(duration);
    stats.loopCount++;

    if (stats.loopCount % 60 === 0) {
      // 60프레임마다 로그 출력
      const avg =
        stats.calcTimes.reduce((a, b) => a + b, 0) / stats.calcTimes.length;
      const fps = 1000 / avg;

      console.log(
        `[SingleThread] Logic Avg: ${avg.toFixed(2)}ms → ${fps.toFixed(
          1
        )} FPS possible | First veh x: ${data[0].toFixed(1)}`
      );
      stats.calcTimes = [];
    }

    // -------------------------------------------------------
    // [렌더링 업데이트] 이 부분 시간은 위 로그에 포함 안 됨
    // -------------------------------------------------------
    const matrixArray = meshRef.current.instanceMatrix.array as Float32Array;
    for (let i = 0; i < vehicleCount; i++) {
      const idx = i * STRIDE;
      const matrixIdx = i * 16;
      matrixArray[matrixIdx + 12] = data[idx]; // x
      matrixArray[matrixIdx + 13] = data[idx + 1]; // y
      matrixArray[matrixIdx + 14] = data[idx + 2]; // z
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <Rail />
      <instancedMesh ref={meshRef} args={[undefined, undefined, vehicleCount]}>
        <boxGeometry args={[VEH_LENGTH, VEH_HEIGHT, VEH_DEPTH]} />
        <meshStandardMaterial color="magenta" />{" "}
        {/* 싱글스레드 구분용 마젠타색 */}
      </instancedMesh>
    </>
  );
};

export default JSSingleThread;
