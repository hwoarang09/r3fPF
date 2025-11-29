import React, { useRef, useMemo, useEffect } from "react";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
  useRapier,
} from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import { Ray } from "@dimforge/rapier3d-compat"; // Ray 클래스 직접 사용 권장
import Rail, { RAIL_END_X } from "../VehicleTest/Rail";
import { calculateInitialVehicles } from "../VehicleTest/VehiclesLocationCalculator";

// --- 상수 설정 ---
const VEH_LENGTH = 3;
const VEH_HEIGHT = 8;
const VEH_DEPTH = 6;
const RAY_DISTANCE_THRESHOLD = 3;

// --- 타입 정의 ---
interface VehicleTest3Props {
  vehicleCount?: number;
}

interface VehiclePhysicsProps {
  index: number;
  initialPos: { x: number; y: number; z: number };
  speed: number;
  rigidBodyRefs: React.MutableRefObject<(RapierRigidBody | null)[]>;
}

/**
 * [개별 로직] VehiclePhysics
 * - 역할: 물리 바디 생성, Raycasting 감지, 이동 계산
 * - 렌더링은 하지 않음 (투명한 물리 객체)
 */
const VehiclePhysics: React.FC<VehiclePhysicsProps> = ({
  index,
  initialPos,
  speed,
  rigidBodyRefs,
}) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { world } = useRapier();

  // Ray 방향 벡터 (재사용)
  const rayDir = useMemo(() => ({ x: 1, y: 0, z: 0 }), []);

  // 1. Ref 등록 (Renderer가 볼 수 있게)
  useEffect(() => {
    rigidBodyRefs.current[index] = rigidBodyRef.current;
    return () => {
      rigidBodyRefs.current[index] = null;
    };
  }, [index, rigidBodyRefs]);

  // 2. 매 프레임 이동 및 센서 로직
  useFrame((_, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    const pos = body.translation();

    // --- Raycasting 로직 시작 ---
    // 중요: Ray 시작점을 차체 길이 절반보다 살짝 앞(0.1)에서 시작해야 자기 자신을 안 때림
    const rayOrigin = {
      x: pos.x + VEH_LENGTH / 2 + 0.1,
      y: pos.y,
      z: pos.z,
    };

    const ray = new Ray(rayOrigin, rayDir);

    const hit = world.castRay(
      ray,
      5, // maxToi (최대 거리)
      true, // solid
      undefined, // groups
      undefined, // interactionGroups
      body, // excludeRigidBody (자기 자신 제외 - 중요!)
      null // excludeCollider
    );

    // 충돌했고, 그 거리가 임계값보다 짧으면 멈춤
    const isStopped = hit && hit.timeOfImpact < RAY_DISTANCE_THRESHOLD;
    // --- Raycasting 로직 끝 ---

    if (!isStopped) {
      let newX = pos.x + speed * delta;
      if (newX > RAIL_END_X) newX = 0;
      body.setTranslation({ x: newX, y: pos.y, z: pos.z }, true);
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={[initialPos.x, initialPos.y, initialPos.z]}
      type="kinematicPosition" // 직접 제어하므로 kinematic
      colliders={false} // 수동 Collider 사용
      userData={{ id: index }} // 필요 시 식별자
    >
      <CuboidCollider args={[VEH_LENGTH / 2, VEH_HEIGHT / 2, VEH_DEPTH / 2]} />
    </RigidBody>
  );
};

/**
 * [통합 렌더링] VehicleRenderer
 * - 역할: Physics 바디들의 위치를 읽어와서 InstancedMesh 하나로 그림
 */
const VehicleRenderer: React.FC<{
  vehicleCount: number;
  rigidBodyRefs: React.MutableRefObject<(RapierRigidBody | null)[]>;
}> = ({ vehicleCount, rigidBodyRefs }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;

    // 등록된 모든 물리 바디를 순회하며 시각적 위치 동기화
    rigidBodyRefs.current.forEach((body, i) => {
      if (!body) return;

      const { x, y, z } = body.translation();
      tempObject.position.set(x, y, z);
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, vehicleCount]}>
      <boxGeometry args={[VEH_LENGTH, VEH_HEIGHT, VEH_DEPTH]} />
      <meshStandardMaterial color="orange" />
    </instancedMesh>
  );
};

/**
 * [메인] VehicleTest3
 */
const VehicleTest3Inner: React.FC<VehicleTest3Props> = ({
  vehicleCount = 700,
}) => {
  // 모든 차량의 물리 바디 Ref를 담는 배열
  const rigidBodyRefs = useRef<(RapierRigidBody | null)[]>([]);

  const vehiclesData = useMemo(
    () => calculateInitialVehicles(vehicleCount),
    [vehicleCount]
  );

  return (
    <>
      <Rail />

      {/* 1. 렌더러 (시각적 표현) */}
      <VehicleRenderer
        vehicleCount={vehicleCount}
        rigidBodyRefs={rigidBodyRefs}
      />

      {/* 2. 개별 차량 로직 (물리 & 이동) */}
      {vehiclesData.map((v, i) => (
        <VehiclePhysics
          key={i}
          index={i}
          initialPos={v}
          speed={v.speed}
          rigidBodyRefs={rigidBodyRefs}
        />
      ))}
    </>
  );
};

const VehicleTest3: React.FC<VehicleTest3Props> = ({ vehicleCount = 700 }) => {
  return (
    <Physics debug gravity={[0, 0, 0]}>
      <VehicleTest3Inner vehicleCount={vehicleCount} />
    </Physics>
  );
};

export default VehicleTest3;
