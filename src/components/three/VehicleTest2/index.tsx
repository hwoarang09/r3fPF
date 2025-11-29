import React, { useRef, useMemo, useEffect } from "react";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  RapierRigidBody,
} from "@react-three/rapier";
import { ActiveCollisionTypes, ActiveEvents } from "@dimforge/rapier3d-compat";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import Rail, { RAIL_END_X } from "../VehicleTest/Rail";
import { calculateInitialVehicles } from "../VehicleTest/VehiclesLocationCalculator";

const VEH_LENGTH = 3;
const VEH_HEIGHT = 8;
const VEH_DEPTH = 6;
const SENSOR_LENGTH = 5;

interface VehicleTest2Props {
  vehicleCount?: number;
}

interface VehiclePhysicsProps {
  index: number;
  initialPos: { x: number; y: number; z: number };
  speed: number;
  rigidBodyRefs: React.MutableRefObject<(RapierRigidBody | null)[]>;
}
/**
 * [개별 차량 로직]
 * 해결책: type="dynamic"으로 변경 -> 물리 엔진이 강제로 충돌 계산함
 */
const VehiclePhysics: React.FC<VehiclePhysicsProps> = ({
  index,
  initialPos,
  speed,
  rigidBodyRefs,
}) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  // 단순한 멈춤 플래그 (Boolean)
  const isStopped = useRef(false);

  useEffect(() => {
    rigidBodyRefs.current[index] = rigidBodyRef.current;
    return () => {
      rigidBodyRefs.current[index] = null;
    };
  }, [index, rigidBodyRefs]);

  useFrame((_, delta) => {
    const body = rigidBodyRef.current;
    if (!body) return;

    // 멈춤 상태면 이동 로직 스킵 (Dynamic이라 관성 때문에 밀릴 수 있으니 속도 0으로 고정)
    if (isStopped.current) {
      body.setLinvel({ x: 0, y: 0, z: 0 }, true); // 확실하게 정지
      return;
    }

    const pos = body.translation();
    let newX = pos.x + speed * delta;
    if (newX > RAIL_END_X) newX = 0;

    // Dynamic 바디를 강제로 위치 이동 (Teleport)
    body.setTranslation({ x: newX, y: pos.y, z: pos.z }, true);
  });

  // [센서 감지]
  const handleIntersectionEnter = (event: any) => {
    const otherId = event.other.rigidBodyObject?.userData?.id;

    // 로그 확인용
    // console.log(`[Vehicle ${index}] SENSOR ENTER -> ${otherId}`);

    if (otherId !== undefined && otherId !== index) {
      isStopped.current = true;
    }
  };

  // [센서 해제]
  const handleIntersectionExit = (event: any) => {
    const otherId = event.other.rigidBodyObject?.userData?.id;

    if (otherId !== undefined && otherId !== index) {
      // console.log(`[Vehicle ${index}] SENSOR EXIT -> ${otherId}`);
      isStopped.current = false;
    }
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      // 👇 여기가 핵심 변경점
      type="dynamic"
      gravityScale={0} // 중력 무시
      lockRotations={true} // 회전 금지
      linearDamping={0} // 마찰 무시
      angularDamping={0}
      position={[initialPos.x, initialPos.y, initialPos.z]}
      colliders={false}
      userData={{ id: index }}
      // 이제 activeCollisionTypes 같은 거 필요 없음 (Dynamic은 기본값으로 다 감지함)
    >
      {/* 차체 (물리 충돌체) */}
      <CuboidCollider args={[VEH_LENGTH / 2, VEH_HEIGHT / 2, VEH_DEPTH / 2]} />

      {/* 센서 (감지용) */}
      <CuboidCollider
        args={[SENSOR_LENGTH / 2, VEH_HEIGHT / 2, VEH_DEPTH / 2]}
        position={[(VEH_LENGTH + SENSOR_LENGTH) / 2 + 0.1, 0, 0]}
        sensor // 센서로 동작
        onIntersectionEnter={handleIntersectionEnter}
        onIntersectionExit={handleIntersectionExit}
      />
    </RigidBody>
  );
};

const VehicleRenderer: React.FC<{
  vehicleCount: number;
  rigidBodyRefs: React.MutableRefObject<(RapierRigidBody | null)[]>;
}> = ({ vehicleCount, rigidBodyRefs }) => {
  const meshRef = useRef<InstancedMesh>(null);
  const tempObject = useMemo(() => new Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
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

const VehicleTest2Inner: React.FC<VehicleTest2Props> = ({
  vehicleCount = 700,
}) => {
  const rigidBodyRefs = useRef<(RapierRigidBody | null)[]>([]);
  const vehiclesData = useMemo(
    () => calculateInitialVehicles(vehicleCount),
    [vehicleCount]
  );

  return (
    <>
      <Rail />
      <VehicleRenderer
        vehicleCount={vehicleCount}
        rigidBodyRefs={rigidBodyRefs}
      />
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

const VehicleTest2: React.FC<VehicleTest2Props> = ({ vehicleCount = 700 }) => {
  return (
    <Physics gravity={[0, 0, 0]}>
      <VehicleTest2Inner vehicleCount={vehicleCount} />
    </Physics>
  );
};

export default VehicleTest2;
