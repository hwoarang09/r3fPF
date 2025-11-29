import React, { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D, Color } from "three";
import Rail, { RAIL_END_X } from "../VehicleTest/Rail";
import { calculateInitialVehicles } from "../VehicleTest/VehiclesLocationCalculator";

// 파일 경로 확인 필수
import SectorWorker from "./simulationWorker?worker";

// [0]:x, [1]:y, [2]:z, [3]:speed, [4]:isStopped, [5]:currentSector
const STRIDE = 9;

const VEH_LENGTH = 3;
const VEH_HEIGHT = 8;
const VEH_DEPTH = 6;

const _tempObj = new Object3D();
const _tempColor = new Color();
const _stopColor = new Color(1, 0, 0); // 정지: 빨강

const RealDataWorkerSector: React.FC<{ vehicleCount?: number }> = ({
  vehicleCount = 700,
}) => {
  const meshRef = useRef<InstancedMesh>(null);
  const workerRef = useRef<Worker | null>(null);

  // 1. Shared Buffer
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
    // 2. 초기 데이터 주입
    // (여기서는 다시 님의 원래 로직인 calculateInitialVehicles 사용)
    const initials = calculateInitialVehicles(vehicleCount);

    initials.forEach((v, i) => {
      const idx = i * STRIDE;

      // useEffect에서 초기화할 때:
      sharedView[idx] = v.x;
      sharedView[idx + 1] = v.y;
      sharedView[idx + 2] = v.z;
      sharedView[idx + 3] = v.speed;
      sharedView[idx + 4] = 0; // isStopped
      sharedView[idx + 5] = 0; // currentSector
      sharedView[idx + 6] = v.speed; // currentSpeed
      sharedView[idx + 7] = 1.0; // acceleration
      sharedView[idx + 8] = 0; // speedTimer
    });

    // 3. Worker 시작
    if (workerRef.current) workerRef.current.terminate();
    workerRef.current = new SectorWorker();

    workerRef.current.postMessage({
      sharedBuffer,
      count: vehicleCount,
    });

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [vehicleCount, sharedBuffer, sharedView]);

  useFrame(() => {
    if (!meshRef.current) return;

    for (let i = 0; i < vehicleCount; i++) {
      const idx = i * STRIDE;

      // Worker가 계산해둔 위치 읽기
      const x = sharedView[idx];
      const y = sharedView[idx + 1];
      const z = sharedView[idx + 2];
      const isStopped = sharedView[idx + 4];

      // 렌더링
      _tempObj.position.set(x, y, z);
      _tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, _tempObj.matrix);

      // 멈춤 시각화
      if (isStopped > 0.5) {
        meshRef.current.setColorAt(i, _stopColor);
      } else {
        meshRef.current.setColorAt(i, new Color("orange"));
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor)
      meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <Rail />
      <instancedMesh ref={meshRef} args={[undefined, undefined, vehicleCount]}>
        <boxGeometry args={[VEH_LENGTH, VEH_HEIGHT, VEH_DEPTH]} />
        <meshStandardMaterial color="white" />
      </instancedMesh>
    </>
  );
};

export default RealDataWorkerSector;
