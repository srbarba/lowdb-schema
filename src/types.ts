export type Split<
  S extends string | number,
  D extends string,
> = string extends S
  ? (string | number)[]
  : S extends ""
  ? []
  : S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S]

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${"" extends P ? "" : "."}${P}`
    : never
  : never

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[]
]

export type RecordPaths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, RecordPaths<T[K], Prev[D]>>
        : never
    }[keyof T]
  : ""

export type tt = RecordPaths<{
  test: {
    roles: [{ name: string }]
  }
}>

type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? []
  : ((...b: T) => void) extends (a: any, ...b: infer I) => void
  ? I
  : []

export type GetPathValue<O, P extends string> = GetPathValueHelper<
  O,
  Split<P, ".">,
  10
>
type GetPathValueHelper<O, T extends [...any], D extends number> = [D] extends [
  never,
]
  ? never
  : O extends object
  ? T[0] extends undefined
    ? O
    : Exclude<O[T[0]], undefined> extends object
    ? GetPathValueHelper<O[T[0]], RemoveFirstFromTuple<T>, Prev[D]>
    : O[T[0]]
  : O
