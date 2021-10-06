import React from "react";
import { useHistory, useLocation } from "react-router";
import type { AssertOneType, URIStateResult, URIStateSetFn, Widen } from "./types";

export const useURLQueryState = <V extends string | string[]>(
  paramName: string,
  initVal: V | (() => V)
): URIStateResult<AssertOneType<Widen<V>>> => {
  type WV = AssertOneType<Widen<V>>;

  const [isArray] = React.useState(() => Array.isArray(initVal));

  useLocation();
  const history = useHistory();

  const parameters = React.useMemo(
    () => new URLSearchParams(history.location.search),
    [history.location.search]
  );

  const updateQuery = (v: WV) => {
    const newParameters = new URLSearchParams(history.location.search);

    if (isArray) {
      newParameters.delete(paramName);
      for (const val of v) {
        newParameters.append(paramName, val);
      }
    } else {
      if (v) newParameters.set(paramName, v as string);
      else newParameters.delete(paramName);
    }

    history.replace({
      pathname: history.location.pathname,
      search: `?${newParameters.toString()}`,
    });
  };

  const getParameter = (): WV => {
    if (isArray) {
      const paramList = parameters.getAll(paramName) as WV;
      return paramList;
    }
    const parameter = (parameters.get(paramName) as WV) ?? initVal;
    return parameter;
  };

  const setParameter: URIStateSetFn<WV> = (setter) => {
    if (typeof setter === "function") {
      const value = setter(getParameter());
      updateQuery(value);
    } else {
      const value = setter;
      updateQuery(value);
    }
  };

  React.useEffect(() => {
    if (parameters.get(paramName) === null) setParameter(initVal as any);
  }, []);

  return [getParameter(), setParameter];
};
