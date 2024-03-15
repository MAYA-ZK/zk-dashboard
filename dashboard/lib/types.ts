export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer X>
      ? ReadonlyArray<DeepPartial<X>>
      : DeepPartial<T[P]>
}

export type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

/** USE ONLY IF TOTALLY NECESSARY */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FORCE_ANY = any
