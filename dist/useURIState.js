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
        if (!isArray)
            return uriQueryParams.getAll(name);
        return uriQueryParams.get(name);
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
            newSearchQuery.set(name, value);
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
    const [value, setValue] = react_1.default.useState(() => URIContext.uriGetter(name, isArray));
    const set = (val) => {
        URIContext.uriSetter(name, val, false);
    };
    const append = (val) => {
        URIContext.uriSetter(name, val, true);
    };
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
        setValue(URIContext.uriGetter(name, isArray));
    }, [URIContext.params]);
    return {
        value,
        set,
        append,
    };
}
exports.useURIState = useURIState;
