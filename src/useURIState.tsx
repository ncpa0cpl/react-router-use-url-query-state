import React from "react";
import { useLocation, useHistory } from "react-router-dom";

type ParamType<IA extends boolean> = IA extends true ? string[] : string;

type URIStateContextType = {
  uriGetter<IA extends boolean = false>(
    name: string,
    isArray?: IA
  ): ParamType<IA>;
  uriSetter: (name: string, value: string | string[], append?: boolean) => void;
  params: URLSearchParams;
};

const URIStateContext = React.createContext<URIStateContextType>({
  uriGetter() {
    throw new Error();
  },
  uriSetter() {
    throw new Error();
  },
  get params(): URLSearchParams {
    throw new Error();
  },
});

export const URIStateContextProvider: React.FC = ({ children }) => {
  useLocation();
  const history = useHistory();

  const uriQueryParams = React.useMemo(
    () => new URLSearchParams(history.location.search),
    [history.location.search]
  );

  const uriGetter: URIStateContextType["uriGetter"] = React.useCallback(
    <IA extends boolean = false>(name: string, isArray?: IA): ParamType<IA> => {
      if (!isArray)
        return (
          ((uriQueryParams.getAll(name) as unknown) as ParamType<IA>) ?? []
        );
      return ((uriQueryParams.get(name) as unknown) as ParamType<IA>) ?? "";
    },
    [uriQueryParams]
  );

  const uriSetter: URIStateContextType["uriSetter"] = React.useCallback(
    (name, value, append) => {
      const newSearchQuery = new URLSearchParams(history.location.search);

      if (!append) {
        newSearchQuery.delete(name);
      }

      if (Array.isArray(value)) {
        for (const val of value) {
          newSearchQuery.append(name, val);
        }
      } else {
        newSearchQuery.set(name, value);
      }

      history.replace({
        pathname: history.location.pathname,
        search: `?${newSearchQuery.toString()}`,
      });
    },
    [history.location.search, history.location.pathname]
  );

  return (
    <URIStateContext.Provider
      value={{
        uriGetter,
        uriSetter,
        params: uriQueryParams,
      }}
    >
      {children}
    </URIStateContext.Provider>
  );
};

export function useURIState<V extends string | string[]>(
  initName: string,
  initVal: V
) {
  const [name] = React.useState(initName);
  const [isArray] = React.useState<V extends string ? false : true>(
    () => (typeof initVal === "string") as any
  );

  type IA = typeof isArray;

  const URIContext = React.useContext(URIStateContext);

  const [value, setValue] = React.useState(() =>
    URIContext.uriGetter(name, isArray)
  );

  const set = (val: ParamType<IA>) => {
    URIContext.uriSetter(name, val, false);
  };

  const append = (val: ParamType<IA>) => {
    URIContext.uriSetter(name, val, true);
  };

  React.useEffect(() => {
    if (!value || value.length === 0) {
      switch (typeof initVal) {
        case "string":
          set(initVal as any);
          break;
        default:
          append(initVal as any);
          break;
      }
    }
  }, []);

  React.useEffect(() => {
    setValue(URIContext.uriGetter(name, isArray));
  }, [URIContext.params]);

  return {
    value,
    set,
    append,
  };
}
