import React from "react";
declare type ParamType<IA extends boolean> = IA extends true ? string[] : string;
export declare const URIStateContextProvider: React.FC;
export declare function useURIState<V extends string | string[]>(initName: string, initVal: V): {
    value: ParamType<V extends string ? false : true>;
    set: (val: ParamType<V extends string ? false : true>) => void;
    append: (val: ParamType<V extends string ? false : true>) => void;
};
export {};
