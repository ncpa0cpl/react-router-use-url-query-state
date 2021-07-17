"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useURIState = exports.URIStateContextProvider = void 0;
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const URIStateContext = react_1.default.createContext({
    uriGetter() {
        throw new Error();
    },
    uriSetter() {
        throw new Error();
    },
    get params() {
        throw new Error();
    },
});
const URIStateContextProvider = ({ children }) => {
    react_router_dom_1.useLocation();
    const history = react_router_dom_1.useHistory();
    const uriQueryParams = react_1.default.useMemo(() => new URLSearchParams(history.location.search), [history.location.search]);
    const uriGetter = react_1.default.useCallback((name, isArray) => {
        var _a, _b;
        if (!isArray)
            return (_a = uriQueryParams.getAll(name)) !== null && _a !== void 0 ? _a : [];
        return (_b = uriQueryParams.get(name)) !== null && _b !== void 0 ? _b : "";
    }, [uriQueryParams]);
    const uriSetter = react_1.default.useCallback((name, value, append) => {
        const newSearchQuery = new URLSearchParams(history.location.search);
        if (!append) {
            newSearchQuery.delete(name);
        }
        if (Array.isArray(value)) {
            for (const val of value) {
                newSearchQuery.append(name, val);
            }
        }
        else {
            if (value)
                newSearchQuery.set(name, value);
            else
                newSearchQuery.delete(name);
        }
        history.replace({
            pathname: history.location.pathname,
            search: `?${newSearchQuery.toString()}`,
        });
    }, [history.location.search, history.location.pathname]);
    return (react_1.default.createElement(URIStateContext.Provider, { value: {
            uriGetter,
            uriSetter,
            params: uriQueryParams,
        } }, children));
};
exports.URIStateContextProvider = URIStateContextProvider;
function useURIState(initName, initVal) {
    const [name] = react_1.default.useState(initName);
    const [isArray] = react_1.default.useState(() => (typeof initVal === "string"));
    const URIContext = react_1.default.useContext(URIStateContext);
    const [value, setValue] = react_1.default.useState(() => { var _a; return (_a = URIContext.uriGetter(name, isArray)) !== null && _a !== void 0 ? _a : initVal; });
    const set = react_1.default.useCallback((val) => {
        URIContext.uriSetter(name, val, false);
    }, [URIContext.uriSetter]);
    const append = react_1.default.useCallback((val) => {
        URIContext.uriSetter(name, val, true);
    }, [URIContext.uriSetter]);
    react_1.default.useEffect(() => {
        if (!value || value.length === 0) {
            switch (typeof initVal) {
                case "string":
                    set(initVal);
                    break;
                default:
                    append(initVal);
                    break;
            }
        }
    }, []);
    react_1.default.useEffect(() => {
        const v = URIContext.uriGetter(name, isArray);
        if (!Object.is(v, value))
            setValue(v);
    }, [URIContext.params]);
    return react_1.default.useMemo(() => ({
        value,
        set,
        append,
    }), [value, set, append]);
}
exports.useURIState = useURIState;
