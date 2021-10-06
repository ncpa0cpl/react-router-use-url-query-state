"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useURLQueryState = void 0;
const react_1 = __importDefault(require("react"));
const react_router_1 = require("react-router");
const useURLQueryState = (paramName, initVal) => {
    const [isArray] = react_1.default.useState(() => Array.isArray(initVal));
    (0, react_router_1.useLocation)();
    const history = (0, react_router_1.useHistory)();
    const parameters = react_1.default.useMemo(() => new URLSearchParams(history.location.search), [history.location.search]);
    const updateQuery = (v) => {
        const newParameters = new URLSearchParams(history.location.search);
        if (isArray) {
            newParameters.delete(paramName);
            for (const val of v) {
                newParameters.append(paramName, val);
            }
        }
        else {
            if (v)
                newParameters.set(paramName, v);
            else
                newParameters.delete(paramName);
        }
        history.replace({
            pathname: history.location.pathname,
            search: `?${newParameters.toString()}`,
        });
    };
    const getParameter = () => {
        var _a;
        if (isArray) {
            const paramList = parameters.getAll(paramName);
            return paramList;
        }
        const parameter = (_a = parameters.get(paramName)) !== null && _a !== void 0 ? _a : initVal;
        return parameter;
    };
    const setParameter = (setter) => {
        if (typeof setter === "function") {
            const value = setter(getParameter());
            updateQuery(value);
        }
        else {
            const value = setter;
            updateQuery(value);
        }
    };
    react_1.default.useEffect(() => {
        if (parameters.get(paramName) === null)
            setParameter(initVal);
    }, []);
    return [getParameter(), setParameter];
};
exports.useURLQueryState = useURLQueryState;
