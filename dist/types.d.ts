export declare type Widen<T extends string | string[]> = T extends string ? string : string[];
export declare type URIStateSetFn<V> = (v: V | ((v: V) => V)) => void;
export declare type URIStateResult<V> = [V, URIStateSetFn<V>];
declare type IsUnion<T> = string[] extends Exclude<T, string> ? string extends Exclude<T, string[]> ? true : false : false;
export declare type AssertOneType<V> = IsUnion<V> extends true ? never : V;
export {};
