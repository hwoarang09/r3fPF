import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const Box = ({ color, onClick }) => (_jsxs("mesh", { onClick: onClick, children: [_jsx("boxGeometry", { args: [1, 1, 1] }), _jsx("meshStandardMaterial", { color: color })] }));
export default Box;
