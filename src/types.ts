export type Widen<T extends string | string[]> = T extends string
  ? string
  : string[];

export type URIStateSetFn<V> = (v: V | ((v: V) => V)) => void;

export type URIStateResult<V> = [V, URIStateSetFn<V>];

type IsUnion<T> = string[] extends Exclude<T, string>
  ? string extends Exclude<T, string[]>
    ? true
    : false
  : false;

export type AssertOneType<V> = IsUnion<V> extends true ? never : V;
