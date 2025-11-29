import React, { useRef, useMemo } from "react";

import { useFrame } from "@react-three/fiber";

import { InstancedMesh, Object3D } from "three";

import Rail, { RAIL_END_X } from "../VehicleTest/Rail";

import { calculateInitialVehicles } from "../VehicleTest/VehiclesLocationCalculator";

// --- 설정 상수 ---

const VEH_LENGTH = 3;

const VEH_HEIGHT = 8;

const VEH_DEPTH = 6;

const SAFE_DISTANCE = 6; // 안전거리

const SECTOR_SIZE = 100; // 구역 크기

const TOTAL_SECTORS = Math.ceil(RAIL_END_X / SECTOR_SIZE);

interface VehicleData {
  id: number;

  x: number;

  y: number;

  z: number;

  speed: number;

  currentSector: number;

  isStopped: boolean;
}

const RealDataSingle: React.FC<{ vehicleCount?: number }> = ({
  vehicleCount = 700,
}) => {
  const meshRef = useRef<InstancedMesh>(null);

  const tempObject = useMemo(() => new Object3D(), []);

  // 1. 초기 데이터

  const vehiclesRef = useRef<VehicleData[]>(
    calculateInitialVehicles(vehicleCount).map((v, i) => ({
      id: i,

      x: v.x,

      y: v.y,

      z: v.z,

      speed: v.speed,

      currentSector: Math.floor(v.x / SECTOR_SIZE),

      isStopped: false,
    }))
  );

  // 2. Store (공간 분할)

  const sectorStore = useRef<Set<number>[]>(
    Array.from({ length: TOTAL_SECTORS }, () => new Set())
  );

  useMemo(() => {
    vehiclesRef.current.forEach((v) => {
      const safeSector = Math.min(v.currentSector, TOTAL_SECTORS - 1);

      sectorStore.current[safeSector].add(v.id);
    });
  }, []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const vehicles = vehiclesRef.current;

    const store = sectorStore.current;

    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];

      // A. 이동 (멈춰있지 않을 때만)

      if (!v.isStopped) {
        v.x += v.speed * delta;

        if (v.x >= RAIL_END_X) v.x -= RAIL_END_X;
      }

      // B. Store 업데이트 (내 위치 갱신)

      const newSector = Math.floor(v.x / SECTOR_SIZE);

      if (newSector !== v.currentSector) {
        store[v.currentSector]?.delete(v.id);

        const safeNewSector = newSector >= TOTAL_SECTORS ? 0 : newSector;

        store[safeNewSector].add(v.id);

        v.currentSector = safeNewSector;
      }

      // C. 충돌 감지 (여기가 문제였음 -> 수정 완료)

      let minDistance = Infinity;

      // 검사 대상: [내 구역, 다음 구역]

      const sectorsToCheck = [
        v.currentSector,

        (v.currentSector + 1) % TOTAL_SECTORS,
      ];

      for (const secIdx of sectorsToCheck) {
        const sectorVehicles = store[secIdx];

        if (!sectorVehicles) continue;

        sectorVehicles.forEach((otherId) => {
          if (otherId === v.id) return;

          const otherCar = vehicles[otherId];

          // 거리 계산 (상대방 위치 - 내 위치)

          let dist = otherCar.x - v.x;

          // 1) Loop 보정:

          // 만약 내 위치가 9990이고 상대가 10이면, dist는 -9980이 나옴.

          // 이 경우 실제로는 내 바로 앞(거리 20)에 있는 것임.

          if (dist < -(RAIL_END_X / 2)) {
            dist += RAIL_END_X;
          }

          // 2) 반대 Loop 보정 (거의 없겠지만):

          // 내가 10이고 상대가 9990이면, dist는 9980.

          // 이건 내 '뒤'에 있는 것이므로 무시해야 함. (아래 3번에서 걸러짐)

          // 3) [핵심] "내 앞"에 있는 차만 본다. (dist가 양수여야 함)

          // dist가 음수라는 건 내 뒤에 있다는 뜻 -> 무시!

          // 단, Loop 보정을 거친 후의 dist 값을 봐야 함.

          if (dist > 0 && dist < SECTOR_SIZE * 2) {
            if (dist < minDistance) {
              minDistance = dist;
            }
          }
        });
      }

      // D. 상태 결정

      // 가장 가까운 앞차와의 거리가 안전거리보다 작으면 멈춤

      // 멀어지면(앞차가 출발하면) minDistance가 커지므로 자동으로 출발함

      if (minDistance < SAFE_DISTANCE) {
        v.isStopped = true;
      } else {
        v.isStopped = false;
      }

      // E. 렌더링

      tempObject.position.set(v.x, v.y, v.z);

      tempObject.updateMatrix();

      meshRef.current.setMatrixAt(v.id, tempObject.matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <Rail />

      <instancedMesh ref={meshRef} args={[undefined, undefined, vehicleCount]}>
        <boxGeometry args={[VEH_LENGTH, VEH_HEIGHT, VEH_DEPTH]} />

        <meshStandardMaterial color="orange" />
      </instancedMesh>
    </>
  );
};

export default RealDataSingle;
