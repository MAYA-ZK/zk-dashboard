import type { UnionToIntersection } from '@/lib/types'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

/**
 * Merge an array of objects into a single object using a key
 */
export function mergeArrayOfObjectsBy<
  TValue extends Record<string, string | number>,
  TKey extends keyof TValue,
>(array: Array<TValue>, key: TKey) {
  type Result = Record<TValue[TKey], UnionToIntersection<TValue>>

  return array.reduce<Result>((acc, curr) => {
    const prevValue = acc[curr[key]] || {}
    return { ...acc, [curr[key]]: { ...prevValue, ...curr } }
  }, {} as Result)
}
