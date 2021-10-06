const toArray = <T>(v: T | T[]): T[] => {
  if (Array.isArray(v)) {
    return v;
  }
  return [v];
};

export type ParamsMap = Map<string, string | string[]>;

export const getParamsMap = (params: string): ParamsMap => {
  const parameters = new URLSearchParams(params);
  const paramsMap = new Map<string, string | string[]>();

  for (const [key, value] of parameters.entries()) {
    if (paramsMap.has(key)) {
      paramsMap.set(key, [...toArray(paramsMap.get(key)!), value]);
      continue;
    }
    paramsMap.set(key, value);
  }

  return paramsMap;
};
