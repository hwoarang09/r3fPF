import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Perf } from "r3f-perf";
import Box from "./Box";
import useMqtt from "../../hooks/useMqtt";
const ThreeScene = () => {
    const { publishMessage } = useMqtt();
    const handleBoxClick = () => {
        publishMessage("control/box", "Box clicked!");
        console.log("Box clicked!");
    };
    return (_jsxs(Canvas, { className: "absolute inset-0", children: [_jsx("ambientLight", {}), _jsx("pointLight", { position: [10, 10, 10] }), _jsx(OrbitControls, {}), _jsx(Box, { color: "orange", onClick: handleBoxClick }), _jsx(Perf, { position: "bottom-right" })] }));
};
export default ThreeScene;
