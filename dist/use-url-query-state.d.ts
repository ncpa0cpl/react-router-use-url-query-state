import type { AssertOneType, URIStateResult, Widen } from "./types";
export declare const useURLQueryState: <V extends string | string[]>(paramName: string, initVal: V | (() => V)) => URIStateResult<AssertOneType<Widen<V>>>;
