function typedEntries<T extends object>(obj: T): Array<[keyof T, T[keyof T]]> {
  return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
}

export function filterKeysFromRecord<T extends object>(
  record: T,
  keys: (keyof T)[],
  include: boolean
): Partial<T> {
  const partial: Partial<T> = {}
  for (const [k, v] of typedEntries(record)) {
    if (keys.includes(k) === include) {
      partial[k] = v
    }
  }
  return partial
}

export const pickKeysFromObject = <T extends object>(
  record: T,
  keys: (keyof T)[]
) => filterKeysFromRecord(record, keys, true)

export const omitKeysFromObject = <T extends object>(
  record: T,
  keys: (keyof T)[]
) => filterKeysFromRecord(record, keys, false)
